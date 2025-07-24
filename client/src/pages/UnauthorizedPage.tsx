import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, User } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-red-700 mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-xl text-red-600 mb-8">
            You do not have permission to view this page.
          </p>

          {/* User Info Debug */}
          {user && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                <User className="w-5 h-5 mr-2" />
                Your Account Info
              </h3>
              <div className="text-left space-y-2">
                <p><span className="font-medium">Role:</span> {user.role}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Approved:</span> {user.isApproved ? 'Yes' : 'No'}</p>
                {user.role === 'trainer' && !user.isApproved && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
                    <p className="text-yellow-800 text-sm">
                      Your trainer account is pending approval. Please wait for an admin to approve your account.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {user?.role === 'trainer' && !user.isApproved ? (
              <Link
                to="/trainer/pending-approval"
                className="inline-flex items-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Go to Pending Approval
              </Link>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Home
              </Link>
            )}
            
            <div>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UnauthorizedPage;
