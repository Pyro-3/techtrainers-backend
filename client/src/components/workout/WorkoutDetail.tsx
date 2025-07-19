import { useState, useEffect } from 'react';
import { Clock, Calendar, Activity, Dumbbell, Award, CheckCircle, X, ChevronRight, ChevronDown } from 'lucide-react';
import { workoutAPI } from '../../services/api';

interface Set {
  reps: number;
  weight: number | null;
  duration: number | null;
  restTime: number;
  completed: boolean;
}

interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: Set[];
  notes: string;
}

interface WorkoutDetailProps {
  workoutId: string;
  onClose?: () => void;
  onComplete?: () => void;
}

const WorkoutDetail = ({ workoutId, onClose, onComplete }: WorkoutDetailProps) => {
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});
  const [completionStatus, setCompletionStatus] = useState<Record<string, Record<number, boolean>>>({});
  const [timer, setTimer] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await workoutAPI.getWorkout(workoutId);
        const workoutData = response.data.data.workout;
        setWorkout(workoutData);
        
        // Initialize expanded state
        const expandedState: Record<string, boolean> = {};
        workoutData.exercises.forEach((exercise: Exercise) => {
          expandedState[exercise._id] = false;
        });
        setExpandedExercises(expandedState);
        
        // Initialize completion status
        const completionState: Record<string, Record<number, boolean>> = {};
        workoutData.exercises.forEach((exercise: Exercise) => {
          completionState[exercise._id] = {};
          exercise.sets.forEach((set, index) => {
            completionState[exercise._id][index] = set.completed || false;
          });
        });
        setCompletionStatus(completionState);
        
        // Check if workout is already in progress
        setWorkoutInProgress(workoutData.status === 'in_progress');
        
        // Start timer if already in progress
        if (workoutData.status === 'in_progress' && workoutData.startTime) {
          const startTime = new Date(workoutData.startTime).getTime();
          const currentTime = new Date().getTime();
          const elapsed = Math.floor((currentTime - startTime) / 1000);
          setTimeElapsed(elapsed);
          startTimer();
        }
        
      } catch (err: any) {
        console.error('Error fetching workout:', err);
        setError('Failed to load workout details.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [workoutId]);

  const startTimer = () => {
    const intervalId = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    setTimer(intervalId);
  };
  
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : '',
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  };
  
  const toggleExerciseExpand = (exerciseId: string) => {
    setExpandedExercises({
      ...expandedExercises,
      [exerciseId]: !expandedExercises[exerciseId]
    });
  };
  
  const toggleSetCompleted = (exerciseId: string, setIndex: number) => {
    setCompletionStatus({
      ...completionStatus,
      [exerciseId]: {
        ...completionStatus[exerciseId],
        [setIndex]: !completionStatus[exerciseId][setIndex]
      }
    });
  };
  
  const startWorkout = async () => {
    try {
      await workoutAPI.startWorkout(workoutId);
      setWorkoutInProgress(true);
      setWorkout({
        ...workout,
        status: 'in_progress',
        startTime: new Date().toISOString()
      });
      startTimer();
    } catch (err) {
      console.error('Error starting workout:', err);
      setError('Failed to start workout');
    }
  };
  
  const completeWorkout = async () => {
    setIsCompleting(true);
    try {
      // Update exercise completion status
      const updatedExercises = workout.exercises.map((exercise: Exercise) => {
        const updatedSets = exercise.sets.map((set, index) => ({
          ...set,
          completed: completionStatus[exercise._id][index]
        }));
        return {
          ...exercise,
          sets: updatedSets
        };
      });
      
      // Update workout with completion status
      await workoutAPI.updateWorkout(workoutId, {
        exercises: updatedExercises
      });
      
      // Complete the workout
      await workoutAPI.completeWorkout(workoutId);
      
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      // Update local workout state
      setWorkout({
        ...workout,
        status: 'completed',
        endTime: new Date().toISOString(),
        exercises: updatedExercises
      });
      
      // Notify parent component
      if (onComplete) {
        onComplete();
      }
      
    } catch (err) {
      console.error('Error completing workout:', err);
      setError('Failed to complete workout');
    } finally {
      setIsCompleting(false);
    }
  };

  const getMuscleGroupLabel = (value: string): string => {
    const labels: Record<string, string> = {
      chest: 'Chest',
      back: 'Back',
      shoulders: 'Shoulders',
      arms: 'Arms',
      legs: 'Legs',
      core: 'Core',
      full_body: 'Full Body'
    };
    return labels[value] || value;
  };
  
  const getEquipmentLabel = (value: string): string => {
    const labels: Record<string, string> = {
      bodyweight: 'Bodyweight',
      dumbbells: 'Dumbbells',
      barbell: 'Barbell',
      machine: 'Machine',
      cable: 'Cable',
      resistance_band: 'Resistance Band',
      other: 'Other'
    };
    return labels[value] || value;
  };
  
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={onClose}
          className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!workout) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center">
          <p className="text-stone-600">Workout not found</p>
          <button 
            onClick={onClose}
            className="mt-4 bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Calculate completion percentage
  const totalSets = workout.exercises.reduce((acc: number, exercise: Exercise) => acc + exercise.sets.length, 0);
  const completedSets = Object.keys(completionStatus).reduce((acc, exerciseId) => {
    return acc + Object.values(completionStatus[exerciseId]).filter(Boolean).length;
  }, 0);
  const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">{workout.name}</h2>
          <div className="flex items-center space-x-4 mt-1">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(workout.difficulty)}`}>
              {workout.difficulty}
            </span>
            <span className="flex items-center text-sm text-stone-500">
              <Clock size={16} className="mr-1" />
              {workout.duration} min
            </span>
            <span className="flex items-center text-sm text-stone-500 capitalize">
              <Activity size={16} className="mr-1" />
              {workout.type}
            </span>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 md:mt-0 text-stone-500 hover:text-stone-700"
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      {workoutInProgress && (
        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-amber-800">Workout in progress</h3>
              <p className="text-amber-700 text-sm">Time elapsed: {formatTime(timeElapsed)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-amber-700">{completedSets} / {totalSets} sets completed</p>
              <div className="w-32 bg-amber-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-amber-600 h-2 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-stone-800">Exercises</h3>
          
          {workout.exercises.map((exercise: Exercise) => (
            <div key={exercise._id} className="border border-stone-200 rounded-lg overflow-hidden">
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  expandedExercises[exercise._id] ? 'bg-stone-50' : 'bg-white'
                }`}
                onClick={() => toggleExerciseExpand(exercise._id)}
              >
                <div>
                  <h4 className="font-semibold text-stone-800">{exercise.name}</h4>
                  <p className="text-sm text-stone-500">
                    {getMuscleGroupLabel(exercise.muscleGroup)} • 
                    {getEquipmentLabel(exercise.equipment)} • 
                    {exercise.sets.length} {exercise.sets.length === 1 ? 'set' : 'sets'}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-xs bg-stone-100 text-stone-700 py-1 px-2 rounded mr-2">
                    {Object.values(completionStatus[exercise._id] || {}).filter(Boolean).length} / {exercise.sets.length}
                  </span>
                  {expandedExercises[exercise._id] ? 
                    <ChevronDown size={20} className="text-stone-400" /> : 
                    <ChevronRight size={20} className="text-stone-400" />
                  }
                </div>
              </div>
              
              {expandedExercises[exercise._id] && (
                <div className="p-4 bg-stone-50 border-t border-stone-200">
                  {exercise.sets.map((set, setIndex) => (
                    <div 
                      key={setIndex}
                      className={`flex items-center justify-between p-3 mb-1 rounded ${
                        completionStatus[exercise._id][setIndex] 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-white border border-stone-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="bg-stone-200 text-stone-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          {setIndex + 1}
                        </span>
                        <div>
                          <p className="font-medium">
                            {set.reps} reps
                            {set.weight ? ` × ${set.weight} kg` : ''}
                            {set.duration ? ` / ${set.duration}s` : ''}
                          </p>
                          <p className="text-xs text-stone-500">Rest: {set.restTime}s</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSetCompleted(exercise._id, setIndex);
                        }}
                        disabled={workout.status === 'completed' || !workoutInProgress}
                        className={`
                          ${completionStatus[exercise._id][setIndex] 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}
                          p-2 rounded-full transition-colors duration-300
                          ${(workout.status === 'completed' || !workoutInProgress) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <CheckCircle size={20} />
                      </button>
                    </div>
                  ))}
                  
                  {exercise.notes && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 p-3 rounded text-sm text-amber-800">
                      <p className="font-medium mb-1">Notes:</p>
                      <p>{exercise.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="pt-6">
          {workout.status === 'planned' && (
            <button
              onClick={startWorkout}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <Dumbbell size={20} className="mr-2" /> Start Workout
            </button>
          )}
          
          {workout.status === 'in_progress' && (
            <button
              onClick={completeWorkout}
              disabled={isCompleting}
              className={`
                w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg 
                transition-colors duration-300 flex items-center justify-center
                ${isCompleting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isCompleting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Completing Workout...
                </>
              ) : (
                <>
                  <Award size={20} className="mr-2" /> Complete Workout
                </>
              )}
            </button>
          )}
          
          {workout.status === 'completed' && (
            <div className="bg-green-100 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center text-green-800 mb-2">
                <CheckCircle size={20} className="mr-2" />
                <h3 className="font-medium">Workout completed</h3>
              </div>
              <p className="text-sm text-green-700">
                {workout.endTime ? (
                  `Completed on ${new Date(workout.endTime).toLocaleDateString()}`
                ) : 'Workout has been marked as completed'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;
