import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Workout {
  id: string;
  name: string;
  status: string;
}

interface ClientDetails {
  id: string;
  name: string;
  email: string;
  fitnessLevel: string;
  workouts: Workout[];
}

const TrainerClientDashboard: React.FC = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await fetch(`/api/trainer/clients/${clientId}`);
        const data = await response.json();
        setClient(data);
      } catch (error) {
        console.error('Error fetching client details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleCreateWorkout = async () => {
    // Example: you might trigger a modal or redirect to a workout builder page
    alert(`Redirecting to workout creation page for ${client?.name}`);
    // e.g. navigate(`/trainer/clients/${clientId}/create-workout`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-stone-600 text-lg">
        Loading client dashboard...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-bold text-xl">
        Client not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-4xl mx-auto p-8 pt-28">
        <h2 className="text-4xl font-bold mb-4 text-stone-900">
          {client.name}'s Dashboard
        </h2>
        <p className="text-stone-600 mb-4">Fitness Level: {client.fitnessLevel}</p>
        <p className="text-stone-600 mb-8">Email: {client.email}</p>

        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-3 text-stone-800">Current Workouts</h3>
          {client.workouts.length === 0 ? (
            <p className="text-stone-500 italic">No workouts assigned yet.</p>
          ) : (
            <ul className="list-disc list-inside text-stone-700 space-y-2">
              {client.workouts.map((workout) => (
                <li key={workout.id}>
                  <span className="font-medium">{workout.name}</span> –{' '}
                  <span className="text-sm italic text-stone-500">{workout.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleCreateWorkout}
          className="mt-6 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
        >
          Create New Workout
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default TrainerClientDashboard;
