import React, { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  userEmail: string;
  message: string;
  status: 'open' | 'resolved';
}

const SupportTicketManager = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch('/api/admin/support-tickets');
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const resolveTicket = async (ticketId: string) => {
    try {
      await fetch(`/api/admin/support-tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' }),
        headers: { 'Content-Type': 'application/json' },
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: 'resolved' } : t
        )
      );
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  return (
    <div>
      {loading ? (
        <p className="text-stone-600">Loading support tickets...</p>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.id} className="mb-6 p-5 bg-white rounded shadow">
            <p className="text-stone-800 font-medium">From: {ticket.userEmail}</p>
            <p className="text-stone-700 mt-2">{ticket.message}</p>
            <div className="mt-4">
              {ticket.status === 'resolved' ? (
                <span className="text-green-600 font-semibold">Resolved</span>
              ) : (
                <button
                  onClick={() => resolveTicket(ticket.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SupportTicketManager;
