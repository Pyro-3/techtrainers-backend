// src/components/workouts/AdvancedWorkouts.tsx
import React, { useState } from 'react'
import { Play, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Exercise } from '../../types/fitness'

const AdvancedWorkouts: React.FC = () => {
  const navigate = useNavigate()
  const [goal, setGoal] = useState<'Strength' | 'Hypertrophy' | 'Fat Loss'>('Strength')
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner')
  const [split, setSplit] = useState<'Push' | 'Pull' | 'Legs' | 'Full Body'>('Push')
  const [generatedWorkout, setGeneratedWorkout] = useState<Exercise[]>([])

  const exercises: Exercise[] = [
    {
      name: 'Barbell Back Squat',
      muscle: 'Legs',
      goals: ['Strength', 'Hypertrophy'],
      difficulty: 'Advanced',
      split: 'Legs',
      video: 'https://www.youtube.com/embed/4xMa9xhJvUY',
    },
    {
      name: 'Romanian Deadlift',
      muscle: 'Hamstrings',
      goals: ['Strength', 'Hypertrophy'],
      difficulty: 'Advanced',
      split: 'Legs',
      video: 'https://www.youtube.com/embed/2SHsk9AzdjA',
    },
    {
      name: 'Bench Press',
      muscle: 'Chest',
      goals: ['Strength', 'Hypertrophy'],
      difficulty: 'Intermediate',
      split: 'Push',
      video: 'https://www.youtube.com/embed/4M8RBbiF4Mk',
    },
    {
      name: 'Overhead Press',
      muscle: 'Shoulders',
      goals: ['Strength'],
      difficulty: 'Intermediate',
      split: 'Push',
      video: 'https://www.youtube.com/embed/qEwKCR5JCog',
    },
    {
      name: 'Pull‑Up',
      muscle: 'Back',
      goals: ['Strength', 'Fat Loss'],
      difficulty: 'Advanced',
      split: 'Pull',
      video: 'https://www.youtube.com/embed/eGo4IYlbE5g',
    },
    {
      name: 'Barbell Row',
      muscle: 'Back',
      goals: ['Strength', 'Hypertrophy'],
      difficulty: 'Intermediate',
      split: 'Pull',
      video: 'https://www.youtube.com/embed/vT2GjY_Umpw',
    },
    {
      name: 'Dumbbell Lunges',
      muscle: 'Legs',
      goals: ['Hypertrophy', 'Fat Loss'],
      difficulty: 'Beginner',
      split: 'Legs',
      video: 'https://www.youtube.com/embed/D7KaRcUTQeE',
    },
    {
      name: 'Tricep Dips',
      muscle: 'Triceps',
      goals: ['Strength', 'Fat Loss'],
      difficulty: 'Intermediate',
      split: 'Push',
      video: 'https://www.youtube.com/embed/6kALZikXxLc',
    },
    {
      name: 'Bicep Curls',
      muscle: 'Biceps',
      goals: ['Hypertrophy'],
      difficulty: 'Beginner',
      split: 'Pull',
      video: 'https://www.youtube.com/embed/kwG2ipFRgfo',
    },
    {
      name: 'Burpees',
      muscle: 'Full Body',
      goals: ['Fat Loss'],
      difficulty: 'Advanced',
      split: 'Full Body',
      video: 'https://www.youtube.com/embed/JZQA08SlJnM',
    },
    {
      name: 'Plank',
      muscle: 'Core',
      goals: ['Fat Loss', 'Strength'],
      difficulty: 'Beginner',
      split: 'Full Body',
      video: 'https://www.youtube.com/embed/pSHjTRCQxIw',
    },
    {
      name: 'Leg Press',
      muscle: 'Legs',
      goals: ['Hypertrophy'],
      difficulty: 'Intermediate',
      split: 'Legs',
      video: 'https://www.youtube.com/embed/IZxyjW7MPJQ',
    },
  ]

  const generateWorkout = () => {
    const filtered = exercises.filter(
      (ex) =>
        ex.goals.includes(goal) &&
        ex.difficulty === level &&
        ex.split === split
    )
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    setGeneratedWorkout(shuffled.slice(0, 5))
  }

  const onExerciseClick = (name: string, videoUrl: string) => {
    window.open(videoUrl, '_blank')
  }

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-stone-700 hover:text-amber-700 mb-6 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> <span>Back</span>
        </button>

        <h2 className="text-4xl font-bold text-center mb-16 text-stone-900">
          Advanced Tools & Full Package
        </h2>

        {/* Workout Generator */}
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-8 text-stone-900">Workout Generator</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-600">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as typeof goal)}
                  className="w-full p-3 border border-stone-300 rounded-lg"
                >
                  <option value="Strength">Strength</option>
                  <option value="Hypertrophy">Hypertrophy</option>
                  <option value="Fat Loss">Fat Loss</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-600">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="w-full p-3 border border-stone-300 rounded-lg"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-600">Split</label>
                <select
                  value={split}
                  onChange={(e) => setSplit(e.target.value as typeof split)}
                  className="w-full p-3 border border-stone-300 rounded-lg"
                >
                  <option value="Push">Push</option>
                  <option value="Pull">Pull</option>
                  <option value="Legs">Legs</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateWorkout}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Generate Custom Workout
            </button>
          </div>

          {/* Generated Workout Display */}
          {generatedWorkout.length > 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-8 text-stone-900">
                {level} {split} Workout ({goal})
              </h3>
              <div className="space-y-4">
                {generatedWorkout.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-stone-50 p-6 rounded-lg hover:bg-stone-100 transition-colors duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-amber-700 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-stone-900 font-semibold text-lg">
                          {exercise.name}
                        </span>
                        <span className="text-stone-600 ml-3">– {exercise.muscle}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onExerciseClick(exercise.name, exercise.video)}
                      className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition duration-300 transform hover:scale-105"
                    >
                      <Play className="w-4 h-4" />
                      <span>Watch</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdvancedWorkouts
