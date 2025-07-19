import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    navigate('/select-tier');
  };

  return (
    <div>
      <Header />
      <Hero onStartJourney={handleStartJourney} />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;