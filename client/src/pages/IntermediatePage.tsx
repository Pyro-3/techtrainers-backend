import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import IntermediateWorkouts from '../components/workouts/IntermediateWorkouts';

const IntermediatePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="pt-20">
        <IntermediateWorkouts />
      </div>
      <Footer />
    </div>
  );
};

export default IntermediatePage;