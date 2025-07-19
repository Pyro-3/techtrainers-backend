import { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Clock, Dumbbell, BarChart2, Plus, Loader } from 'lucide-react';
import { workoutAPI } from '../../services/api';
import WorkoutDetail from './WorkoutDetail';
import WorkoutCreator from './WorkoutCreator';

interface Workout {
  _id: string;
  name: string;
  type: string;
  difficulty: string;
  duration: number;
  status: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

interface WorkoutListProps {
  filter?: 'all' | 'planned' | 'completed' | 'in_progress';
  limit?: number;
  showCreate?: boolean;
}

const WorkoutList = ({ filter = 'all', limit, showCreate = true }: WorkoutListProps) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = limit || 10;

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { 
        page, 
        limit: pageSize
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await workoutAPI.getWorkouts(params);
      setWorkouts(response.data.data.workouts);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [filter, page, limit]);

  const handleWorkoutClick = (workoutId: string) => {
    setSelectedWorkout(workoutId);
  };

  const handleCloseDetail = () => {
    setSelectedWorkout(null);
    fetchWorkouts(); // Refresh the list in case changes were made
  };

  const handleWorkoutComplete = () => {
    fetchWorkouts();
    setSelectedWorkout(null);
  };

  const handleCreateComplete = () => {
    setIsCreating(false);
    fetchWorkouts();
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (selectedWorkout) {
    return (
      <WorkoutDetail 
        workoutId={selectedWorkout} 
        onClose={handleCloseDetail}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  if (isCreating) {
    return (
      <WorkoutCreator onComplete={handleCreateComplete} />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800">
          {filter === 'all' ? 'My Workouts' :
           filter === 'planned' ? 'Planned Workouts' :
           filter === 'completed' ? 'Completed Workouts' :
           'In Progress Workouts'}
        </h2>
        
        {showCreate && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Create Workout</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin h-8 w-8 text-amber-700" />
        </div>
      ) : workouts.length > 0 ? (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout._id}
              className="border border-stone-200 rounded-lg overflow-hidden hover:border-amber-300 transition-colors duration-300 cursor-pointer"
              onClick={() => handleWorkoutClick(workout._id)}
            >
              <div className="p-4 flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800 text-lg">{workout.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(workout.difficulty)}`}>
                      {workout.difficulty}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(workout.status)}`}>
                      {workout.status.replace('_', ' ')}
                    </span>
                    <span className="flex items-center text-xs text-stone-500">
                      <Clock size={14} className="mr-1" />
                      {workout.duration} min
                    </span>
                    <span className="flex items-center text-xs text-stone-500 capitalize">
                      <Dumbbell size={14} className="mr-1" />
                      {workout.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 md:mt-0">
                  <div className="text-right mr-2">
                    <p className="text-xs text-stone-500">
                      {workout.status === 'completed' ? 'Completed' : 'Created'} on {formatDate(workout.status === 'completed' && workout.endTime ? workout.endTime : workout.createdAt)}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-stone-400" />
                </div>
              </div>
            </div>
          ))}

          {/* Simple pagination */}
          {!limit && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg ${
                  page === 1
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Previous
              </button>
              <span className="text-stone-600">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={workouts.length < pageSize}
                className={`px-4 py-2 rounded-lg ${
                  workouts.length < pageSize
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Dumbbell size={48} className="mx-auto text-stone-300 mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">No workouts found</h3>
          <p className="text-stone-500 mb-6">
            {filter === 'all'
              ? "You haven't created any workouts yet"
              : filter === 'planned'
              ? "You don't have any planned workouts"
              : filter === 'completed'
              ? "You haven't completed any workouts yet"
              : "You don't have any workouts in progress"}
          </p>
          {showCreate && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              <Plus size={18} />
              <span>Create Your First Workout</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutList;
