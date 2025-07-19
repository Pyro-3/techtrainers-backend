import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdvancedWorkouts from '../components/workouts/AdvancedWorkouts';
import ExerciseModal from '../components/ExerciseModal';
import PersonalTrainerSection from '../components/PersonalTrainerSection';

const AdvancedPage: React.FC = () => {
  const [exerciseModal, setExerciseModal] = useState<{
    isOpen: boolean;
    title: string;
    videoUrl: string;
  }>({
    isOpen: false,
    title: '',
    videoUrl: ''
  });

  const openExerciseModal = (title: string, videoUrl: string) => {
    setExerciseModal({
      isOpen: true,
      title,
      videoUrl
    });
  };

  const closeExerciseModal = () => {
    setExerciseModal({
      isOpen: false,
      title: '',
      videoUrl: ''
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <div className="pt-20">
        <AdvancedWorkouts onExerciseClick={openExerciseModal} />
        <PersonalTrainerSection />
      </div>
      <Footer />
      
      <ExerciseModal 
        isOpen={exerciseModal.isOpen}
        title={exerciseModal.title}
        videoUrl={exerciseModal.videoUrl}
        onClose={closeExerciseModal}
      />
    </div>
  );
};

export default AdvancedPage;