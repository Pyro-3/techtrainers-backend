import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Dumbbell } from 'lucide-react';

const WorkoutGenerator: React.FC = () => {
    const navigate = useNavigate();
    const [workoutName, setWorkoutName] = useState('');
    const [workoutType, setWorkoutType] = useState('strength');
    const [difficulty, setDifficulty] = useState('beginner');
    const [duration, setDuration] = useState('45');
    const [showError, setShowError] = useState(false);

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleHome = () => {
        navigate('/dashboard'); // Go to dashboard/home
    };

    const handleContinue = () => {
        if (!workoutName.trim()) {
            setShowError(true);
            return;
        }
        setShowError(false);
        // Continue to exercises page
        navigate('/workout-generator/exercises', {
            state: {
                workoutName: workoutName.trim(),
                workoutType,
                difficulty,
                duration
            }
        });
    };

    return (
        <div className="min-h-screen bg-stone-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center space-x-2 px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back</span>
                        </button>

                        <button
                            onClick={handleHome}
                            className="flex items-center space-x-2 px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </button>
                    </div>

                    {/* Page Title */}
                    <div className="flex items-center space-x-3">
                        <Dumbbell className="w-8 h-8 text-amber-600" />
                        <h1 className="text-2xl font-bold text-stone-800">Create New Workout</h1>
                    </div>

                    {/* Spacer for centering */}
                    <div className="w-32"></div>
                </div>

                {/* Error Message */}
                {showError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">Workout name is required</p>
                    </div>
                )}

                {/* Workout Details Form */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
                    <h2 className="text-xl font-semibold text-stone-800 mb-6">Workout Details</h2>

                    <div className="space-y-6">
                        {/* Workout Name */}
                        <div>
                            <label htmlFor="workoutName" className="block text-sm font-medium text-stone-700 mb-2">
                                Workout Name*
                            </label>
                            <input
                                type="text"
                                id="workoutName"
                                value={workoutName}
                                onChange={(e) => {
                                    setWorkoutName(e.target.value);
                                    if (showError && e.target.value.trim()) {
                                        setShowError(false);
                                    }
                                }}
                                placeholder="e.g. Upper Body Strength"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${showError && !workoutName.trim()
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-stone-300'
                                    }`}
                                required
                            />
                        </div>

                        {/* Workout Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Type */}
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-stone-700 mb-2">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={workoutType}
                                    onChange={(e) => setWorkoutType(e.target.value)}
                                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="strength">Strength</option>
                                    <option value="cardio">Cardio</option>
                                    <option value="flexibility">Flexibility</option>
                                    <option value="sports">Sports</option>
                                    <option value="general">General</option>
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-medium text-stone-700 mb-2">
                                    Difficulty
                                </label>
                                <select
                                    id="difficulty"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>

                            {/* Duration */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-stone-700 mb-2">
                                    Duration (minutes)
                                </label>
                                <select
                                    id="duration"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">60 minutes</option>
                                    <option value="90">90 minutes</option>
                                </select>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="flex justify-end pt-6">
                            <button
                                onClick={handleContinue}
                                className="flex items-center space-x-2 px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                            >
                                <span>Continue to Exercises</span>
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-800 mb-3">💡 Quick Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                        <div>
                            <p className="font-medium">Workout Naming:</p>
                            <p>Use descriptive names like "Upper Body Strength" or "Morning Cardio"</p>
                        </div>
                        <div>
                            <p className="font-medium">Duration Guidelines:</p>
                            <p>Beginners: 15-30 min, Intermediate: 30-60 min, Advanced: 60+ min</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutGenerator;
