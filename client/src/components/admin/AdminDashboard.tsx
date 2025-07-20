import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import SupportTicketManager from './SupportTicketManager';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className="max-w-6xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-bold text-center text-stone-900 mb-12">Admin Dashboard</h1>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">User Management</h2>
          <UserManagement />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">Support Tickets</h2>
          <SupportTicketManager />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
