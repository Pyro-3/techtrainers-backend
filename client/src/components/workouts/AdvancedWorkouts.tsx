import React, { useState } from 'react';
import { Goal, Split, Exercise } from '../../types/fitness';
import { Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdvancedWorkoutsProps {
  onExerciseClick: (title: string, videoUrl: string) => void;
}

const AdvancedWorkouts: React.FC = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState<'Strength' | 'Hypertrophy' | 'Fat Loss'>('Strength');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [split, setSplit] = useState<'Push' | 'Pull' | 'Legs' | 'Full Body'>('Push');
  const [generatedWorkout, setGeneratedWorkout] = useState<Exercise[]>([]);

  const exercises: Exercise[] = [
    { name: 'Push-Up', muscle: 'Chest', difficulty: 'Beginner', goals: ['Strength', 'Hypertrophy', 'Fat Loss'], split: 'Push', video: 'https://www.youtube.com/embed/-Mbr55h3BeQ' },
    { name: 'Overhead Press', muscle: 'Shoulders', difficulty: 'Intermediate', goals: ['Strength', 'Hypertrophy'], split: 'Push', video: 'https://www.youtube.com/embed/F3QY5vMz_6I' },
    { name: 'Deadlift', muscle: 'Hamstrings', difficulty: 'Advanced', goals: ['Strength', 'Hypertrophy'], split: 'Legs', video: 'https://www.youtube.com/embed/4AObAU-EcYE' },
    { name: 'Plank', muscle: 'Core', difficulty: 'Beginner', goals: ['Strength', 'Fat Loss'], split: 'Full Body', video: 'https://www.youtube.com/embed/u6ZelKyUM6g' },
    { name: 'Biceps Curl', muscle: 'Biceps', difficulty: 'Beginner', goals: ['Hypertrophy', 'Strength'], split: 'Pull', video: 'https://www.youtube.com/embed/KS-1_r9K4XA' },
    { name: 'Incline Dumbbell Press', muscle: 'Chest', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Push', video: 'https://www.youtube.com/embed/8iPEnn-ltC8' },
    { name: 'Barbell Row', muscle: 'Back', difficulty: 'Intermediate', goals: ['Strength'], split: 'Pull', video: 'https://www.youtube.com/embed/vT2GjY_Umpw' },
    { name: 'Squat', muscle: 'Quads', difficulty: 'Advanced', goals: ['Strength'], split: 'Legs', video: 'https://www.youtube.com/embed/YaXPRqUwItQ' },
    { name: 'Lat Pulldown', muscle: 'Back', difficulty: 'Beginner', goals: ['Hypertrophy'], split: 'Pull', video: 'https://www.youtube.com/embed/CAwf7n6Luuc' },
    { name: 'Triceps Pushdown', muscle: 'Triceps', difficulty: 'Beginner', goals: ['Hypertrophy'], split: 'Push', video: 'https://www.youtube.com/embed/2-LAMcpzODU' },
    { name: 'Leg Press', muscle: 'Quads', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Legs', video: 'https://www.youtube.com/embed/IZxyjW7MPJQ' },
    { name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Push', video: 'https://www.youtube.com/embed/3VcKaXpzqRo' },
    { name: 'Romanian Deadlift', muscle: 'Hamstrings', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Legs', video: 'https://www.youtube.com/embed/2SHsk9AzdjA' },
    { name: 'Cable Row', muscle: 'Back', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Pull', video: 'https://www.youtube.com/embed/HJSVR_67OlM' },
    { name: 'Face Pull', muscle: 'Shoulders', difficulty: 'Intermediate', goals: ['Strength', 'Hypertrophy'], split: 'Pull', video: 'https://www.youtube.com/embed/d_R6Oj4vP9c' },
    { name: 'Hip Thrust', muscle: 'Glutes', difficulty: 'Advanced', goals: ['Hypertrophy'], split: 'Legs', video: 'https://www.youtube.com/embed/LM8XHLYJoYs' },
    { name: 'Pull-Up', muscle: 'Back', difficulty: 'Advanced', goals: ['Strength'], split: 'Pull', video: 'https://www.youtube.com/embed/eGo4IYlbE5g' },
    { name: 'Chest Fly', muscle: 'Chest', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Push', video: 'https://www.youtube.com/embed/eozdVDA78K0' },
    { name: 'Hammer Curl', muscle: 'Biceps', difficulty: 'Intermediate', goals: ['Hypertrophy'], split: 'Pull', video: 'https://www.youtube.com/embed/zC3nLlEvin4' },
    { name: 'Seated Calf Raise', muscle: 'Calves', difficulty: 'Beginner', goals: ['Hypertrophy'], split: 'Legs', video: 'https://www.youtube.com/embed/-M4-G8p8fmc' },
    { name: 'Mountain Climbers', muscle: 'Core', difficulty: 'Beginner', goals: ['Fat Loss'], split: 'Full Body', video: 'https://www.youtube.com/embed/nmwgirgXLYM' }
  ];

  const generateWorkout = () => {
    const filtered = exercises.filter(ex =>
      ex.goals.includes(goal) &&
      ex.difficulty === level &&
      ex.split === split
    );
  const onExerciseClick = (name: string, videoUrl: string) => {
  console.log(`Clicked on: ${name}`);
  window.open(videoUrl, '_blank');
};

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setGeneratedWorkout(shuffled.slice(0, 5));

    
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-stone-700 hover:text-amber-700 mb-6 transition-colors duration-300">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Back</span>
        </button>

        <h2 className="text-4xl font-bold text-center mb-16 text-stone-900">Advanced Tools & Full Package</h2>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-8 text-stone-900">Workout Generator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Select inputs for goal, level, and split */}
            </div>
            <button onClick={generateWorkout} className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
              Generate Custom Workout
            </button>
          </div>

          {generatedWorkout.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-8 text-stone-900">
                {level} {split} Workout ({goal})
              </h3>
              <div className="space-y-4">
                {generatedWorkout.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between bg-stone-50 p-6 rounded-lg hover:bg-stone-100 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-700 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-stone-900 font-semibold text-lg">{exercise.name}</span>
                        <span className="text-stone-600 ml-3">– {exercise.muscle}</span>
                      </div>
                    </div>
                    <button onClick={() => onExerciseClick(exercise.name, exercise.video)} className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                      <Play className="w-4 h-4" />
                      <span>Watch</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-8 text-stone-900">Premium Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: '📊', title: 'Workout Logging & Progress Analytics', desc: 'Track your progress with detailed charts and logs' },
                { icon: '⏱️', title: 'Rest Timer with Auto Notifications', desc: 'Never miss your rest periods with smart timers' },
                { icon: '📚', title: 'Exercise Library with Form Tips', desc: 'Master proper form with our comprehensive guide' },
                { icon: '🏆', title: 'Streaks, Badges, and Leaderboard', desc: 'Stay motivated with achievements and competition' },
                { icon: '🎲', title: 'Routine Randomizer / Workout Generator', desc: 'Keep workouts fresh with AI-powered generation' },
                { icon: '📸', title: 'Progress Photo Comparison Tool', desc: 'Visual progress tracking with side-by-side comparisons' },
                { icon: '📋', title: 'Habit Tracker', desc: 'Track water intake, sleep, and gym attendance' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-stone-50 rounded-lg">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1">{feature.title}</h4>
                    <p className="text-stone-600 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedWorkouts;
