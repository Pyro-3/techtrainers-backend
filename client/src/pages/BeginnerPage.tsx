import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BeginnerWorkouts from '../components/workouts/BeginnerWorkouts';

const BeginnerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="pt-20">
        <BeginnerWorkouts />
      </div>
      <Footer />
    </div>
  );
};

export default BeginnerPage;