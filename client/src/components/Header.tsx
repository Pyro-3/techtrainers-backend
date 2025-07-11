import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, MessageCircle, User, LogOut } from 'lucide-react';
import ChatBot from './ChatBot';
import SignupModal from './SignupModal';
import LoginModal from './LoginModal';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const [showChatBot, setShowChatBot] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Use the auth context instead of local state
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    // Use the logout method from AuthContext
    logout();
    setShowUserMenu(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="bg-white border-b border-stone-200 fixed top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-stone-900 tracking-wider hover:text-amber-700 transition-colors duration-300">
              TECH TRAINERS
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/') ? 'text-amber-700' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/about') ? 'text-amber-700' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              About
            </Link>
            
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="font-medium text-stone-700 hover:text-stone-900 transition-colors duration-300"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-full font-medium transition-colors duration-300"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-stone-700 hover:text-amber-700 transition-colors duration-300"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name.split(' ')[0]}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors duration-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors duration-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/fitness"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors duration-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Fitness Tracker
                    </Link>
                    <Link 
                      to={`/${user?.fitnessLevel || 'beginner'}`}
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors duration-300"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Workouts
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-stone-100 transition-colors duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={() => setShowChatBot(true)}
              className="text-stone-700 hover:text-stone-900 transition-colors duration-300 font-medium flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contact</span>
            </button>
            <button className="text-stone-700 hover:text-stone-900 transition-colors duration-300">
              <ShoppingCart className="w-6 h-6" />
            </button>
          </nav>
        </div>
      </header>

      {/* Chat Bot Modal */}
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
      
      {/* Sign Up Modal */}
      <SignupModal isOpen={showSignupModal} onClose={() => setShowSignupModal(false)} />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSignupClick={() => setShowSignupModal(true)} 
      />
    </>
  );
};

export default Header;