import React from 'react';
import { FitnessLevel } from '../types/fitness';
import BeginnerWorkouts from './workouts/BeginnerWorkouts';
import IntermediateWorkouts from './workouts/IntermediateWorkouts';
import AdvancedWorkouts from './workouts/AdvancedWorkouts';
import { ArrowLeft } from 'lucide-react';

interface WorkoutSectionsProps {
  activeSection: FitnessLevel;
  onBack: () => void;
  onExerciseClick: (title: string, videoUrl: string) => void;
}

const WorkoutSections: React.FC<WorkoutSectionsProps> = ({ 
  activeSection, 
  onBack, 
  onExerciseClick 
}) => {
  return (
    <section className={`py-20 min-h-screen ${activeSection === 'intermediate' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gray-800'}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Levels</span>
          </button>
        </div>

        {activeSection === 'beginner' && (
          <BeginnerWorkouts />
        )}

        {activeSection === 'intermediate' && (
          <IntermediateWorkouts />
        )}

        {activeSection === 'advanced' && (
          <AdvancedWorkouts />
        )}
      </div>
    </section>
  );
};

export default WorkoutSections;

