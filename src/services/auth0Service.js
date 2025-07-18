const { auth, requiresAuth } = require('express-openid-connect');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const auth0Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  
  routes: {
    login: '/auth/login',
    logout: '/auth/logout',
    callback: '/auth/callback',
  },
  
  session: {
    rollingDuration: 24 * 60 * 60, // 24 hours
    absoluteDuration: 7 * 24 * 60 * 60, // 7 days
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  
  afterCallback: async (req, res, session, decodedState) => {
    try {
      const { user } = session;
      
      console.log('Auth0 user data:', {
        email: user.email,
        name: user.name,
        sub: user.sub,
        email_verified: user.email_verified
      });
      
      // Find or create user in database
      let dbUser = await User.findOne({ 
        $or: [
          { email: user.email },
          { auth0Id: user.sub }
        ]
      });
      
      if (!dbUser) {
        // Create new user
        dbUser = new User({
          email: user.email,
          name: user.name || `${user.given_name || ''} ${user.family_name || ''}`.trim(),
          auth0Id: user.sub,
          role: 'user', // Default role
          isVerified: user.email_verified || true,
          isActive: true,
          profile: {
            firstName: user.given_name || '',
            lastName: user.family_name || '',
            avatar: user.picture || '',
            phone: user.phone_number || '',
          },
          preferences: {
            emailNotifications: true,
            smsNotifications: false,
            language: user.locale || 'en',
          }
        });
        
        await dbUser.save();
        console.log(`✅ New user created via Auth0: ${user.email}`);
      } else {
        // Update existing user with Auth0 data
        if (!dbUser.auth0Id) {
          dbUser.auth0Id = user.sub;
        }
        
        // Update profile picture if not set
        if (!dbUser.profile.avatar && user.picture) {
          dbUser.profile.avatar = user.picture;
        }
        
        // Update verification status
        if (user.email_verified && !dbUser.isVerified) {
          dbUser.isVerified = true;
        }
        
        await dbUser.save();
        console.log(`✅ Existing user updated via Auth0: ${user.email}`);
      }
      
      // Generate JWT token for API access
      const token = jwt.sign(
        { 
          userId: dbUser._id, 
          email: dbUser.email, 
          role: dbUser.role,
          isApproved: dbUser.isApproved 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      // Store in session
      req.session.apiToken = token;
      req.session.userId = dbUser._id.toString();
      req.session.userRole = dbUser.role;
      req.session.userEmail = dbUser.email;
      req.session.isApproved = dbUser.isApproved;
      
      console.log(`✅ Session created for user: ${user.email}, role: ${dbUser.role}`);
      
      return session;
    } catch (error) {
      console.error('❌ Auth0 afterCallback error:', error);
      throw error;
    }
  }
};

// Create static admin account
const createStaticAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@techtrainers.ca' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Adm1n$$33!', parseInt(process.env.BCRYPT_ROUNDS));
      
      const adminUser = new User({
        email: 'admin@techtrainers.ca',
        password: hashedPassword,
        role: 'admin',
        name: 'System Administrator',
        isVerified: true,
        isActive: true,
        isStaticAdmin: true,
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          language: 'en',
        }
      });
      
      await adminUser.save();
      console.log('✅ Static admin account created successfully');
    } else {
      console.log('✅ Static admin account already exists');
    }
  } catch (error) {
    console.error('❌ Failed to create static admin:', error);
    throw error;
  }
};

module.exports = { 
  auth0Config, 
  requiresAuth, 
  createStaticAdmin 
};
