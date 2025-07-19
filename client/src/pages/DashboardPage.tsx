import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  return (
    <>
      <Header />
      <div className="pt-28 pb-20">
        <Dashboard />
      </div>
      <Footer />
    </>
  );
};

export default DashboardPage;