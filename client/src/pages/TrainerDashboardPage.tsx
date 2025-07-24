import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TrainerHeader from '../components/TrainerHeader';
import TrainerFooter from '../components/TrainerFooter';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Dumbbell,
  TrendingUp,
  Star,
  Eye,
  AlertCircle
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  fitnessLevel: string;
  joinDate: string;
  lastWorkout?: string;
  totalWorkouts: number;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface BookingRequest {
  id: string;
  clientName: string;
  clientId: string;
  clientEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  sessionDate: string;
  sessionType: string;
  message?: string;
  createdAt: string;
  duration: number;
}

interface TrainerStats {
  totalClients: number;
  activeClients: number;
  pendingBookings: number;
  completedSessions: number;
  totalRevenue: number;
  averageRating: number;
  workoutsCreated: number;
}

const TrainerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [stats, setStats] = useState<TrainerStats>({
    totalClients: 0,
    activeClients: 0,
    pendingBookings: 0,
    completedSessions: 0,
    totalRevenue: 0,
    averageRating: 0,
    workoutsCreated: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'trainer') {
      navigate('/dashboard');
      return;
    }

    if (!user.isApproved) {
      navigate('/trainer/pending-approval');
      return;
    }

    loadTrainerData();
  }, [user, navigate]);

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadClients(),
        loadBookingRequests(),
        loadStats()
      ]);
    } catch (err) {
      setError('Failed to load trainer data');
      console.error('Error loading trainer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      setClients([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          fitnessLevel: 'intermediate',
          joinDate: '2024-01-15',
          lastWorkout: '2024-01-20',
          totalWorkouts: 15,
          status: 'active',
          avatar: 'SJ'
        },
        {
          id: '2',
          name: 'Mike Chen',
          email: 'mike@example.com',
          fitnessLevel: 'beginner',
          joinDate: '2024-01-10',
          lastWorkout: '2024-01-18',
          totalWorkouts: 8,
          status: 'active',
          avatar: 'MC'
        }
      ]);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadBookingRequests = async () => {
    try {
      setBookingRequests([
        {
          id: '1',
          clientName: 'Emma Wilson',
          clientId: '3',
          clientEmail: 'emma@example.com',
          status: 'pending',
          sessionDate: '2024-01-25',
          sessionType: 'Personal Training',
          message: 'Looking for help with strength training',
          createdAt: '2024-01-22',
          duration: 60
        },
        {
          id: '2',
          clientName: 'John Davis',
          clientId: '4',
          clientEmail: 'john@example.com',
          status: 'pending',
          sessionDate: '2024-01-26',
          sessionType: 'Consultation',
          message: 'First time trainer session',
          createdAt: '2024-01-21',
          duration: 30
        }
      ]);
    } catch (err) {
      console.error('Error loading booking requests:', err);
    }
  };

  const loadStats = async () => {
    try {
      setStats({
        totalClients: 12,
        activeClients: 10,
        pendingBookings: 3,
        completedSessions: 145,
        totalRevenue: 4250,
        averageRating: 4.8,
        workoutsCreated: 28
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject') => {
    try {
      console.log(`${action} booking ${bookingId}`);
      
      setBookingRequests(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: action === 'approve' ? 'approved' : 'rejected' }
            : booking
        )
      );
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your trainer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <TrainerHeader />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <TrainerFooter />
      </div>
    );
  }

  if (!user?.isApproved) {
    navigate('/trainer/pending-approval');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <TrainerHeader />
      
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-cyan-900/20" />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Manage your clients, track progress, and create personalized workout plans.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Clients', value: stats.totalClients, icon: Users, color: 'purple' },
              { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, color: 'yellow' },
              { label: 'Sessions Completed', value: stats.completedSessions, icon: CheckCircle, color: 'green' },
              { label: 'Average Rating', value: stats.averageRating.toFixed(1), icon: Star, color: 'cyan' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-purple-400" />
                  Booking Requests
                </h3>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                  {bookingRequests.filter(b => b.status === 'pending').length} pending
                </span>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookingRequests.filter(booking => booking.status === 'pending').map((booking) => (
                  <div key={booking.id} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{booking.clientName}</h4>
                        <p className="text-slate-400 text-sm">{booking.clientEmail}</p>
                      </div>
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                        {booking.sessionType}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-400 mb-3">
                      <div>📅 {new Date(booking.sessionDate).toLocaleDateString()}</div>
                      <div>⏱️ {booking.duration} minutes</div>
                      {booking.message && <div className="mt-2 italic">"{booking.message}"</div>}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'approve')}
                        className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking.id, 'reject')}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}

                {bookingRequests.filter(b => b.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending booking requests</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center">
                  <Users className="w-6 h-6 mr-3 text-cyan-400" />
                  Your Clients
                </h3>
                <button
                  onClick={() => navigate('/trainer/clients')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center"
                >
                  View All <Eye className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {client.avatar || client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-white">{client.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            client.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">{client.fitnessLevel} level</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                          <span>{client.totalWorkouts} workouts completed</span>
                          {client.lastWorkout && (
                            <span>Last: {new Date(client.lastWorkout).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/trainer/clients/${client.id}`)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {clients.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No clients assigned yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/trainer/workout-creator')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <Dumbbell className="w-8 h-8 text-white mr-3" />
                  <h4 className="text-xl font-semibold">Create Workout</h4>
                </div>
                <p className="text-purple-100">Design custom workout plans for your clients</p>
              </button>

              <button
                onClick={() => navigate('/trainer/clients')}
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-white mr-3" />
                  <h4 className="text-xl font-semibold">Manage Clients</h4>
                </div>
                <p className="text-cyan-100">View and manage all your clients</p>
              </button>

              <button
                onClick={() => navigate('/trainer/reports')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-8 h-8 text-white mr-3" />
                  <h4 className="text-xl font-semibold">View Reports</h4>
                </div>
                <p className="text-green-100">Track client progress and performance</p>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <TrainerFooter />
    </div>
  );
};

export default TrainerDashboardPage;
