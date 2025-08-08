import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';

interface Exercise {
    id: string;
    name: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    equipment: string[];
    muscleGroups: string[];
    description: string;
}

const ExerciseSelector: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const workoutData = location.state;

    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Mock exercise data
    const exercises: Exercise[] = [
        {
            id: '1',
            name: 'Push-ups',
            category: 'chest',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            muscleGroups: ['chest', 'shoulders', 'triceps'],
            description: 'Classic bodyweight exercise for upper body strength'
        },
        {
            id: '2',
            name: 'Squats',
            category: 'legs',
            difficulty: 'beginner',
            equipment: ['bodyweight'],
            muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
            description: 'Fundamental lower body exercise'
        },
        {
            id: '3',
            name: 'Bench Press',
            category: 'chest',
            difficulty: 'intermediate',
            equipment: ['barbell', 'bench'],
            muscleGroups: ['chest', 'shoulders', 'triceps'],
            description: 'Classic chest building exercise'
        },
        {
            id: '4',
            name: 'Deadlift',
            category: 'back',
            difficulty: 'advanced',
            equipment: ['barbell'],
            muscleGroups: ['hamstrings', 'glutes', 'back', 'traps'],
            description: 'Compound exercise for posterior chain'
        }
    ];

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'chest', label: 'Chest' },
        { value: 'back', label: 'Back' },
        { value: 'legs', label: 'Legs' },
        { value: 'shoulders', label: 'Shoulders' },
        { value: 'arms', label: 'Arms' },
        { value: 'core', label: 'Core' }
    ];

    const filteredExercises = exercises.filter(exercise => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleExercise = (exercise: Exercise) => {
        setSelectedExercises(prev => {
            const isSelected = prev.find(e => e.id === exercise.id);
            if (isSelected) {
                return prev.filter(e => e.id !== exercise.id);
            } else {
                return [...prev, exercise];
            }
        });
    };

    const handleContinue = () => {
        if (selectedExercises.length === 0) {
            alert('Please select at least one exercise');
            return;
        }

        // Navigate to workout summary or save workout
        navigate('/workout-generator/summary', {
            state: {
                ...workoutData,
                exercises: selectedExercises
            }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                <h1 className="text-2xl font-bold text-stone-800">
                    Add Exercises to "{workoutData?.workoutName}"
                </h1>

                <div className="text-sm text-stone-600">
                    {selectedExercises.length} selected
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-10 pr-8 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                        >
                            {categories.map(category => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Exercise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredExercises.map(exercise => {
                    const isSelected = selectedExercises.find(e => e.id === exercise.id);

                    return (
                        <div
                            key={exercise.id}
                            onClick={() => toggleExercise(exercise)}
                            className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-md ${isSelected
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-stone-200 hover:border-stone-300'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-stone-800">{exercise.name}</h3>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                        ? 'border-amber-500 bg-amber-500'
                                        : 'border-stone-300'
                                    }`}>
                                    {isSelected && <Plus className="w-4 h-4 text-white transform rotate-45" />}
                                </div>
                            </div>

                            <p className="text-sm text-stone-600 mb-3">{exercise.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium text-stone-500">Category:</span>
                                    <span className="text-xs bg-stone-100 px-2 py-1 rounded capitalize">
                                        {exercise.category}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium text-stone-500">Difficulty:</span>
                                    <span className={`text-xs px-2 py-1 rounded capitalize ${exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                            exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {exercise.difficulty}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1 mt-2">
                                    {exercise.muscleGroups.slice(0, 3).map(muscle => (
                                        <span key={muscle} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                            {muscle}
                                        </span>
                                    ))}
                                    {exercise.muscleGroups.length > 3 && (
                                        <span className="text-xs text-stone-500">
                                            +{exercise.muscleGroups.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* No Results */}
            {filteredExercises.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-stone-500">No exercises found matching your criteria.</p>
                </div>
            )}

            {/* Continue Button */}
            {selectedExercises.length > 0 && (
                <div className="fixed bottom-6 right-6">
                    <button
                        onClick={handleContinue}
                        className="flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-lg"
                    >
                        <span>Continue with {selectedExercises.length} exercises</span>
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExerciseSelector;
