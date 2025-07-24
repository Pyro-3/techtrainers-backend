const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/enhancedRoleAuth');
const User = require('../models/User');
const SupportTicket = require('../models/SupportTicket');
const Booking = require('../models/Booking');
const DatabaseLogger = require('../utils/DatabaseLogger');

// Admin Dashboard Stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const adminId = req.user._id;
    
    await DatabaseLogger.log('info', 'Admin dashboard stats requested', {
      adminId,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    const [
      totalUsers,
      totalTrainers,
      pendingTrainers,
      activeTickets,
      totalBookings,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: 'trainer', isDeleted: false }),
      User.countDocuments({ role: 'trainer', isApproved: false, isDeleted: false }),
      SupportTicket.countDocuments({ status: { $in: ['open', 'in-progress'] }, isDeleted: false }),
      Booking.countDocuments({ isDeleted: false }),
      User.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt')
    ]);

    const stats = {
      totalUsers,
      totalTrainers,
      pendingTrainers,
      activeTickets,
      totalBookings,
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt
      }))
    };

    res.json(stats);
  } catch (error) {
    await DatabaseLogger.log('error', 'Error fetching admin stats', {
      adminId: req.user._id,
      error: error.message
    });

    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      message: 'Internal server error'
    });
  }
});

// Get all users with pagination and filtering
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const adminId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };
    
    // Add filters
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'pending' && role === 'trainer') {
        query.isApproved = false;
      }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('name email role isActive isApproved createdAt lastLogin profile')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit),
      User.countDocuments(query)
    ]);

    const result = {
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isApproved: user.isApproved,
        joinedAt: user.createdAt,
        lastLogin: user.lastLogin,
        profileCompleted: user.profileCompleted || false
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: 'Internal server error'
    });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    const adminId = req.user._id;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(userId);
    
    if (!user || user.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    // Don't allow deactivating other admins
    if (user.role === 'admin' && !isActive) {
      return res.status(403).json({ 
        error: 'Cannot deactivate admin',
        message: 'Admin users cannot be deactivated'
      });
    }

    user.isActive = isActive;
    await user.save();

    await DatabaseLogger.log('info', `User ${isActive ? 'activated' : 'deactivated'} by admin`, {
      adminId,
      targetUserId: userId,
      targetUserEmail: user.email,
      newStatus: isActive
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      error: 'Failed to update user status',
      message: 'Internal server error'
    });
  }
});

// Approve/reject trainer
router.patch('/users/:userId/approve', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isApproved, notes } = req.body;
    const adminId = req.user._id;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ 
        error: 'Invalid approval status',
        message: 'isApproved must be a boolean value'
      });
    }

    const user = await User.findById(userId);
    
    if (!user || user.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The requested user does not exist'
      });
    }

    if (user.role !== 'trainer') {
      return res.status(400).json({ 
        error: 'Invalid user role',
        message: 'Only trainers can be approved/rejected'
      });
    }

    user.isApproved = isApproved;
    if (notes) {
      user.adminNotes = notes;
    }
    await user.save();

    res.json({
      success: true,
      message: `Trainer ${isApproved ? 'approved' : 'rejected'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Error updating trainer approval:', error);
    res.status(500).json({ 
      error: 'Failed to update trainer approval',
      message: 'Internal server error'
    });
  }
});

// Email Analytics
router.get('/email-analytics', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const EmailAnalytics = require('../models/EmailAnalytics');
    
    const adminId = req.user._id;
    
    await DatabaseLogger.log('info', 'Admin email analytics requested', {
      adminId,
      filters: { startDate, endDate, status },
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Build query
    const query = {};
    if (startDate || endDate) {
      query.sentAt = {};
      if (startDate) query.sentAt.$gte = new Date(startDate);
      if (endDate) query.sentAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    // Get analytics data
    const [analytics, summary] = await Promise.all([
      EmailAnalytics.find(query)
        .populate('userId', 'name email')
        .sort({ sentAt: -1 })
        .limit(100),
      EmailAnalytics.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRetries: { $sum: '$retryCount' }
          }
        }
      ])
    ]);

    // Calculate delivery rate
    const totalEmails = analytics.length;
    const deliveredEmails = analytics.filter(a => a.status === 'delivered').length;
    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        analytics,
        summary,
        stats: {
          totalEmails,
          deliveredEmails,
          deliveryRate: parseFloat(deliveryRate),
          avgRetries: totalEmails > 0 ? (analytics.reduce((sum, a) => sum + a.retryCount, 0) / totalEmails).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching email analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch email analytics',
      message: 'Internal server error'
    });
  }
});

module.exports = router;