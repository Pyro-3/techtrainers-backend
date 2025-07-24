// src/components/workouts/SampleRoutine.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const demoPlan = [
  'Barbell Squat – 3×5 @ 70%',
  'Bench Press – 3×5 @ 70%',
  'Deadlift – 1×5 @ 80%',
  'Overhead Press – 3×5 @ 65%',
  'Barbell Row – 3×8 @ 60%',
];

const SampleRoutine: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-stone-700 hover:text-amber-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>
      <h3 className="text-2xl font-bold mb-4">Intermediate Routine</h3>
      <ul className="space-y-3">
        {demoPlan.map((item, i) => (
          <li
            key={i}
            className="flex items-center space-x-3 bg-stone-50 p-4 rounded-lg"
          >
            <div className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center">
              {i + 1}
            </div>
            <span className="text-stone-900">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SampleRoutine;
