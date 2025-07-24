import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Clock, CheckCircle, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TrainerPendingApprovalPage: React.FC = () => {
  const { user, logout } = useAuth();

  // Redirect if not a trainer or if already approved
  if (!user || user.role !== 'trainer') {
    return <Navigate to="/" replace />;
  }

  if (user.isApproved) {
    return <Navigate to="/trainer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Trainer Application is 
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {' '}Under Review
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Thank you for applying to become a TechTrainer! We're excited to have you join our community of fitness professionals.
          </p>

          {/* Status Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Application Submitted</h3>
              <p className="text-slate-400 text-sm">Your trainer profile has been successfully submitted</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Under Review</h3>
              <p className="text-slate-400 text-sm">Our team is reviewing your qualifications and experience</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <div className="w-12 h-12 bg-slate-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Notification Pending</h3>
              <p className="text-slate-400 text-sm">You'll receive an email once the review is complete</p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">What's Next?</h2>
            <div className="text-left max-w-2xl mx-auto space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Review Process</h3>
                  <p className="text-slate-400 text-sm">Our team will review your qualifications, certifications, and experience (typically 2-3 business days)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Email Notification</h3>
                  <p className="text-slate-400 text-sm">You'll receive an email at <strong className="text-white">{user?.email}</strong> with the decision</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Dashboard Access</h3>
                  <p className="text-slate-400 text-sm">Once approved, you'll have full access to the trainer dashboard and client management tools</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center mb-8">
            <p className="text-slate-400 mb-4">
              Have questions about your application? Contact our support team.
            </p>
            <a 
              href="mailto:support@techtrainer.com" 
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              support@techtrainer.com
            </a>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              Refresh Status
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrainerPendingApprovalPage;
