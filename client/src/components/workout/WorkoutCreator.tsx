import { useState } from 'react';
import { PlusCircle, X, Save, ArrowRight } from 'lucide-react';
import { workoutAPI } from '../../services/api';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: {
    reps: number;
    weight: number | null;
    duration: number | null;
    restTime: number;
  }[];
  notes: string;
}

const muscleGroups = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
];

const equipmentTypes = [
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'machine', label: 'Machine' },
  { value: 'cable', label: 'Cable' },
  { value: 'resistance_band', label: 'Resistance Band' },
  { value: 'other', label: 'Other' },
];

const WorkoutCreator = ({ onComplete }: { onComplete?: () => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Workout details
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [workoutDifficulty, setWorkoutDifficulty] = useState('beginner');
  const [workoutDuration, setWorkoutDuration] = useState(45);
  
  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    id: Date.now().toString(),
    name: '',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    sets: [{ reps: 10, weight: null, duration: null, restTime: 60 }],
    notes: ''
  });
  
  const addSet = () => {
    setCurrentExercise({
      ...currentExercise,
      sets: [...currentExercise.sets, { reps: 10, weight: null, duration: null, restTime: 60 }]
    });
  };
  
  const removeSet = (index: number) => {
    setCurrentExercise({
      ...currentExercise,
      sets: currentExercise.sets.filter((_, i) => i !== index)
    });
  };
  
  const updateSet = (index: number, field: string, value: string | number) => {
    const newSets = [...currentExercise.sets];
    newSets[index] = {
      ...newSets[index],
      [field]: field === 'reps' || field === 'restTime' ? parseInt(value as string) || 0 : 
               field === 'weight' || field === 'duration' ? parseFloat(value as string) || null : value
    };
    
    setCurrentExercise({
      ...currentExercise,
      sets: newSets
    });
  };
  
  const addExercise = () => {
    if (!currentExercise.name.trim()) {
      setError('Exercise name is required');
      return;
    }
    
    setExercises([...exercises, currentExercise]);
    setCurrentExercise({
      id: Date.now().toString(),
      name: '',
      muscleGroup: 'chest',
      equipment: 'bodyweight',
      sets: [{ reps: 10, weight: null, duration: null, restTime: 60 }],
      notes: ''
    });
    setError(null);
  };
  
  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };
  
  const handleExerciseChange = (field: string, value: string) => {
    setCurrentExercise({
      ...currentExercise,
      [field]: value
    });
  };
  
  const handleSubmit = async () => {
    if (exercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format data for API
      const workoutData = {
        name: workoutName,
        type: workoutType,
        difficulty: workoutDifficulty,
        duration: workoutDuration,
        exercises: exercises.map(ex => ({
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          sets: ex.sets,
          notes: ex.notes
        }))
      };
      
      await workoutAPI.createWorkout(workoutData);
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error creating workout:', err);
      setError(err.response?.data?.message || 'Failed to create workout');
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = () => {
    if (step === 1) {
      if (!workoutName.trim()) {
        setError('Workout name is required');
        return;
      }
      setError(null);
    }
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Workout Created!</h2>
        <p className="text-stone-600 mb-6 text-center">
          Your workout has been saved. You can now access it from your dashboard.
        </p>
        {onComplete && (
          <button
            onClick={onComplete}
            className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors duration-300 font-medium"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-6">Create New Workout</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-stone-800">Workout Details</h3>
          
          <div>
            <label className="block text-stone-600 mb-2" htmlFor="workoutName">
              Workout Name*
            </label>
            <input
              type="text"
              id="workoutName"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g. Upper Body Strength"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-stone-600 mb-2" htmlFor="workoutType">
                Type
              </label>
              <select
                id="workoutType"
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-stone-600 mb-2" htmlFor="workoutDifficulty">
                Difficulty
              </label>
              <select
                id="workoutDifficulty"
                value={workoutDifficulty}
                onChange={(e) => setWorkoutDifficulty(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-stone-600 mb-2" htmlFor="workoutDuration">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="workoutDuration"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 45)}
                min="5"
                max="240"
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="pt-6">
            <button
              onClick={nextStep}
              className="flex items-center justify-center w-full md:w-auto bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Continue to Exercises <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Add Exercises</h3>
            <p className="text-stone-600">
              Add the exercises that make up your workout. For each exercise, you can add multiple sets.
            </p>
          </div>
          
          {exercises.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-stone-700 mb-3">Exercises ({exercises.length})</h4>
              <div className="space-y-4">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-stone-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-semibold">{exercise.name}</h5>
                        <p className="text-sm text-stone-500">
                          {muscleGroups.find(m => m.value === exercise.muscleGroup)?.label} • 
                          {equipmentTypes.find(e => e.value === exercise.equipment)?.label} • 
                          {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-stone-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-stone-800 mb-4">New Exercise</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-stone-600 mb-2" htmlFor="exerciseName">
                  Exercise Name*
                </label>
                <input
                  type="text"
                  id="exerciseName"
                  value={currentExercise.name}
                  onChange={(e) => handleExerciseChange('name', e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g. Bench Press"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 mb-2" htmlFor="muscleGroup">
                    Muscle Group
                  </label>
                  <select
                    id="muscleGroup"
                    value={currentExercise.muscleGroup}
                    onChange={(e) => handleExerciseChange('muscleGroup', e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {muscleGroups.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-stone-600 mb-2" htmlFor="equipment">
                    Equipment
                  </label>
                  <select
                    id="equipment"
                    value={currentExercise.equipment}
                    onChange={(e) => handleExerciseChange('equipment', e.target.value)}
                    className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-stone-600 mb-2">
                  Sets
                </label>
                
                {currentExercise.sets.map((set, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                    <div className="col-span-1">
                      <label className="text-xs text-stone-500 mb-1">Reps</label>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateSet(index, 'reps', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs text-stone-500 mb-1">Weight</label>
                      <input
                        type="number"
                        value={set.weight === null ? '' : set.weight}
                        onChange={(e) => updateSet(index, 'weight', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="kg"
                        min="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs text-stone-500 mb-1">Rest (sec)</label>
                      <input
                        type="number"
                        value={set.restTime}
                        onChange={(e) => updateSet(index, 'restTime', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="0"
                        step="5"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs text-stone-500 mb-1">Duration</label>
                      <input
                        type="number"
                        value={set.duration === null ? '' : set.duration}
                        onChange={(e) => updateSet(index, 'duration', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="sec"
                        min="0"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      {currentExercise.sets.length > 1 && (
                        <button 
                          onClick={() => removeSet(index)}
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addSet}
                  className="flex items-center mt-2 text-amber-700 hover:text-amber-800"
                >
                  <PlusCircle size={18} className="mr-1" /> Add Another Set
                </button>
              </div>
              
              <div>
                <label className="block text-stone-600 mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={currentExercise.notes}
                  onChange={(e) => handleExerciseChange('notes', e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Any special instructions or form tips"
                  rows={2}
                ></textarea>
              </div>
              
              <button
                onClick={addExercise}
                className="flex items-center justify-center w-full bg-stone-700 hover:bg-stone-800 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                <PlusCircle size={18} className="mr-2" /> Add Exercise
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button
              onClick={prevStep}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Back to Details
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || exercises.length === 0}
              className={`flex items-center justify-center flex-1 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors duration-300 ${
                loading || exercises.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Workout...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" /> Save Workout
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCreator;
