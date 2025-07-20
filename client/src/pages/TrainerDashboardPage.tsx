import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TrainerProfileForm from '../components/TrainerProfileForm';

interface Client {
  id: string;
  name: string;
  workouts: {
    name: string;
    status: string;
  }[];
}

interface BookingRequest {
  id: string;
  clientName: string;
  clientId: string;
  status: 'pending' | 'approved' | 'rejected';
}

const TrainerDashboardPage: React.FC = () => {
  const { user, logout, refreshUserData } = useAuth(); // ✅ Added logout here
  const [clients, setClients] = useState<Client[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUserData(); // ensure fresh user data
        const [clientsRes, requestsRes] = await Promise.all([
          fetch('/api/trainer/clients'),
          fetch('/api/trainer/booking-requests'),
        ]);

        const clientsData = await clientsRes.json();
        const requestsData = await requestsRes.json();

        setClients(clientsData);
        setBookingRequests(requestsData);
      } catch (error) {
        console.error('Error fetching trainer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshUserData]);

  const handleRequestAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await fetch(`/api/trainer/booking-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      setBookingRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

  const viewClientDashboard = (clientId: string) => {
    navigate(`/trainer/clients/${clientId}`);
  };

  if (user?.role === 'trainer' && user?.isApproved && !user?.profileCompleted) {
    return <TrainerProfileForm />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-5xl mx-auto p-8 pt-28">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-stone-900">Trainer Dashboard</h2>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center text-stone-600 text-lg">Loading data...</div>
        ) : (
          <>
            {/* Booking Requests */}
            <section className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-stone-800">Pending Booking Requests</h3>
              {bookingRequests.length === 0 ? (
                <p className="text-stone-600">No pending requests.</p>
              ) : (
                bookingRequests.map((request) => (
                  <div key={request.id} className="mb-4 p-5 bg-white rounded-xl shadow">
                    <p className="text-lg text-stone-800 font-medium">
                      {request.clientName} wants to book you as their trainer.
                    </p>
                    <div className="mt-3 space-x-4">
                      <button
                        onClick={() => handleRequestAction(request.id, 'approve')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        disabled={request.status !== 'pending'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        disabled={request.status !== 'pending'}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Current Clients */}
            <section>
              <h3 className="text-2xl font-semibold mb-4 text-stone-800">Your Clients</h3>
              {clients.length === 0 ? (
                <p className="text-stone-600">You don’t have any clients yet.</p>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    className="mb-6 p-6 bg-white rounded-xl shadow hover:shadow-md transition"
                  >
                    <h4 className="text-xl font-bold text-stone-900">{client.name}</h4>
                    <p className="text-stone-600 mt-1 mb-2">
                      Workouts: {client.workouts.length}
                    </p>
                    <button
                      onClick={() => viewClientDashboard(client.id)}
                      className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
                    >
                      View Client Dashboard
                    </button>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrainerDashboardPage;
