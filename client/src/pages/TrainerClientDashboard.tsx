import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

interface Workout {
  id: string;
  name: string;
  status: string;
  difficulty?: string;
  exerciseCount: number;
  description?: string;
  createdAt: string;
}

interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  measurements?: any;
  hasPhotos: boolean;
  notes?: string;
}

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  fitnessLevel: string;
  profile?: any;
  memberSince: string;
  workouts: Workout[];
  recentProgress?: ProgressEntry[];
}

const TrainerClientDashboard: React.FC = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify trainer is logged in
    if (!user || user.role !== 'trainer') {
      navigate('/login');
      return;
    }

    const fetchClientDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/trainer/clients/${clientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have access to this client');
          } else if (response.status === 404) {
            throw new Error('Client not found');
          } else {
            throw new Error('Failed to fetch client details');
          }
        }

        const data = await response.json();
        setClient(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId, user, navigate]);

  const handleCreateWorkout = () => {
    // Navigate to workout creation page
    navigate(`/trainer/clients/${clientId}/create-workout`);
  };

  const handleViewWorkout = (workoutId: string) => {
    // Navigate to workout details/edit page
    navigate(`/trainer/clients/${clientId}/workouts/${workoutId}`);
  };

  const handleViewProgress = () => {
    // Navigate to client progress page
    navigate(`/trainer/clients/${clientId}/progress`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-stone-600 text-lg">Loading client dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <main className="max-w-4xl mx-auto p-8 pt-28">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-bold text-xl mb-2">Error</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/trainer/dashboard')}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <main className="max-w-4xl mx-auto p-8 pt-28">
          <div className="text-center">
            <div className="text-red-600 font-bold text-xl mb-4">Client not found</div>
            <button
              onClick={() => navigate('/trainer/dashboard')}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-6xl mx-auto p-8 pt-28">
        {/* Client Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-4xl font-bold text-stone-900 mb-2">
                {client.name}'s Dashboard
              </h2>
              <p className="text-stone-600 mb-1">
                <span className="font-medium">Email:</span> {client.email}
              </p>
              <p className="text-stone-600 mb-1">
                <span className="font-medium">Fitness Level:</span>{' '}
                <span className="capitalize">{client.fitnessLevel}</span>
              </p>
              <p className="text-stone-600">
                <span className="font-medium">Member Since:</span>{' '}
                {new Date(client.memberSince).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => navigate('/trainer/dashboard')}
              className="text-stone-600 hover:text-stone-800 px-3 py-1 border rounded"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workouts Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-stone-800">Workouts</h3>
              <button
                onClick={handleCreateWorkout}
                className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create New
              </button>
            </div>
            
            {client.workouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-500 italic mb-4">No workouts assigned yet.</p>
                <button
                  onClick={handleCreateWorkout}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Create First Workout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {client.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewWorkout(workout.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-stone-900">{workout.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        workout.status === 'active' ? 'bg-green-100 text-green-800' :
                        workout.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workout.status}
                      </span>
                    </div>
                    <div className="text-sm text-stone-600 space-y-1">
                      {workout.description && (
                        <p className="line-clamp-2">{workout.description}</p>
                      )}
                      <div className="flex gap-4">
                        <span>{workout.exerciseCount} exercises</span>
                        {workout.difficulty && (
                          <span className="capitalize">• {workout.difficulty}</span>
                        )}
                        <span>• Created {new Date(workout.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-stone-800">Recent Progress</h3>
              <button
                onClick={handleViewProgress}
                className="text-amber-700 hover:text-amber-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            
            {!client.recentProgress || client.recentProgress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-500 italic">No progress entries yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {client.recentProgress.map((entry) => (
                  <div key={entry.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-stone-900">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      {entry.hasPhotos && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          📷 Photos
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-stone-600 space-y-1">
                      {entry.weight && <p>Weight: {entry.weight} lbs</p>}
                      {entry.notes && <p className="italic">"{entry.notes}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrainerClientDashboard;