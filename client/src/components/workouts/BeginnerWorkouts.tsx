// src/components/workouts/BeginnerWorkouts.tsx
import React, { useState } from 'react';
import { MuscleGroup } from '../../types/fitness';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Map each exercise name to a representative YouTube tutorial
const exerciseVideos: Record<string, string> = {
  'Incline Dumbbell Press': 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
  'Flat Barbell Bench Press': 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  'Chest Fly Machine': 'https://www.youtube.com/watch?v=eozdVDA78K0',
  'Push-Ups': 'https://www.youtube.com/watch?v=_l3ySVKYVJ8',
  'Barbell Squats': 'https://www.youtube.com/watch?v=Dy28eq2PjcM',
  'Leg Press': 'https://youtu.be/t9sTSr-JYSs?si=Lba4L8sQOBb4FDqa',
  'Leg Curl Machine': 'https://www.youtube.com/watch?v=Re4n8RSB5uo',
  'Walking Lunges': 'https://www.youtube.com/watch?v=COKYKgQ8KR0',
  'Lat Pulldown': 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  'Seated Row Machine': 'https://www.youtube.com/watch?v=DMkbnWeG_xw',
  'Dumbbell Rows': 'https://www.youtube.com/watch?v=pYcpY20QaE8',
  'Assisted Pull-ups': 'https://youtu.be/wFj808u2HWU?si=JAcbKHgnt22CyGN7',
  'Plank': 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  'Russian Twists': 'https://www.youtube.com/watch?v=wkD8rjkodUI',
  'Hanging Leg Raises': 'https://youtu.be/RuIdJSVTKO4?si=JieCp6ZlI4N2kjr-',
  'Cable Woodchopper': 'https://youtu.be/ZDt4MCvjMAA?si=HxyM-H4L-MgFNolh'
};

const workoutPlan: Record<MuscleGroup, string[]> = {
  Chest: [
    'Incline Dumbbell Press – 3 sets of 8-12 reps',
    'Flat Barbell Bench Press – 3 sets of 8-12 reps',
    'Chest Fly Machine – 3 sets of 8-12 reps',
    'Push-Ups – 3 sets of 8-12 reps'
  ],
  Legs: [
    'Barbell Squats – 3 sets of 8-12 reps',
    'Leg Press – 3 sets of 8-12 reps',
    'Leg Curl Machine – 3 sets of 8-12 reps',
    'Walking Lunges – 3 sets of 8-12 reps'
  ],
  Back: [
    'Lat Pulldown – 3 sets of 8-12 reps',
    'Seated Row Machine – 3 sets of 8-12 reps',
    'Dumbbell Rows – 3 sets of 8-12 reps',
    'Assisted Pull-ups – 3 sets of 8-12 reps'
  ],
  Core: [
    'Plank – 3 sets (30-60 sec hold)',
    'Russian Twists – 3 sets of 8-12 reps',
    'Hanging Leg Raises – 3 sets of 8-12 reps',
    'Cable Woodchopper – 3 sets of 8-12 reps'
  ]
};

const muscleGroupImages: Record<MuscleGroup, { src: string; alt: string }> = {
  Chest: {
    src: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Person performing a chest press exercise.'
  },
  Legs: {
    src: 'https://images.pexels.com/photos/703012/pexels-photo-703012.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Athlete performing a leg exercise like a squat or lunge.'
  },
  Back: {
    src: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Person doing a back exercise, possibly a row or pull-down.'
  },
  Core: {
    src: 'https://images.pexels.com/photos/685530/pexels-photo-685530.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Person engaged in a core strengthening exercise.'
  }
};

const muscleGroups: MuscleGroup[] = ['Chest', 'Legs', 'Back', 'Core'];

const BeginnerWorkouts: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-stone-700 hover:text-amber-700 mb-6 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-stone-900 mb-6">Beginner Workouts</h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Start your fitness journey with these foundational exercises designed for beginners.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscleGroup(group)}
              className={
                `py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedMuscleGroup === group
                    ? 'bg-amber-700 text-white shadow-lg'
                    : 'bg-white text-stone-700 hover:bg-stone-100 shadow-md'
                }`
              }
            >
              {group}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto">
          {selectedMuscleGroup ? (
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-8 text-stone-900">
                    {selectedMuscleGroup} Workouts
                  </h2>
                  <div className="space-y-4">
                    {workoutPlan[selectedMuscleGroup].map((exercise, index) => {
                      const [name, rest] = exercise.split('–').map(s => s.trim());
                      const videoUrl = exerciseVideos[name] || '#';
                      return (
                        <a
                          key={index}
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-4 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-300"
                        >
                          <div className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-stone-700 text-lg">{name}</span>
                            {rest && <span className="text-stone-500 text-sm">– {rest}</span>}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <img
                    src={muscleGroupImages[selectedMuscleGroup].src}
                    alt={muscleGroupImages[selectedMuscleGroup].alt}
                    className="w-full h-80 object-cover rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center bg-white rounded-2xl p-16 shadow-lg">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💪</span>
              </div>
              <h3 className="text-2xl font-semibold text-stone-900 mb-4">Choose Your Focus</h3>
              <p className="text-xl text-stone-600">
                Select a muscle group above to see recommended workouts and exercises.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeginnerWorkouts;
