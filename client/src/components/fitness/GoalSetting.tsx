import { useState } from 'react';
import { Target, Plus, Check, X, Edit2, Trash2, Calendar } from 'lucide-react';
import { userAPI } from '../../services/api';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  progress: number;
  category: 'strength' | 'cardio' | 'flexibility' | 'weight' | 'nutrition' | 'other';
}

// Mock goals data - in a real app, this would come from your API
const initialGoals: Goal[] = [
  {
    id: '1',
    title: 'Increase bench press max',
    description: 'Reach 100kg bench press',
    targetDate: '2025-10-15',
    progress: 75,
    category: 'strength'
  },
  {
    id: '2',
    title: 'Complete 5km run under 25 minutes',
    targetDate: '2025-08-30',
    progress: 60,
    category: 'cardio'
  },
  {
    id: '3',
    title: 'Lose 5kg',
    description: 'Reach target weight of 75kg',
    targetDate: '2025-09-20',
    progress: 40,
    category: 'weight'
  }
];

const categoryIcons: Record<string, JSX.Element> = {
  strength: (
    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18h12M6 6h12M6 12h12M18 3v18M12 3v18M6 3v18"></path>
      </svg>
    </div>
  ),
  cardio: (
    <div className="bg-red-100 text-red-600 p-2 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.4 2.9a2.5 2.5 0 0 0-3.5 0l-.7.7a.4.4 0 0 1-.6 0 .4.4 0 0 0-.6 0L12.4 6a2 2 0 0 0-.5 1v0a3 3 0 0 0 .5 1.7l.7 1a2 2 0 0 1 .5 1v0a2 2 0 0 1-.5 1.3l-.7 1a2 2 0 0 0-.5 1v0a3 3 0 0 0 .5 1.7l1.7 2.3a.4.4 0 0 0 .6 0 .4.4 0 0 1 .6 0 2.5 2.5 0 0 0 3.6 0l3.9-4a2.5 2.5 0 0 0 0-3.6l-.7-.7" />
        <path d="M8 11.5a9 9 0 0 0 3-6.5" />
        <path d="M11 13.5a9 9 0 0 1-3 6.5" />
      </svg>
    </div>
  ),
  flexibility: (
    <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" y1="9" x2="9.01" y2="9"></line>
        <line x1="15" y1="9" x2="15.01" y2="9"></line>
      </svg>
    </div>
  ),
  weight: (
    <div className="bg-amber-100 text-amber-600 p-2 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12M8.5 8v10.5a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V8M12 13V3"></path>
      </svg>
    </div>
  ),
  nutrition: (
    <div className="bg-green-100 text-green-600 p-2 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 10H2v4h3M18 10h4v4h-3M10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"></path>
      </svg>
    </div>
  ),
  other: (
    <div className="bg-stone-100 text-stone-600 p-2 rounded-full">
      <Target size={20} />
    </div>
  )
};

const categoryColors = {
  strength: 'bg-blue-100 text-blue-800 border-blue-200',
  cardio: 'bg-red-100 text-red-800 border-red-200',
  flexibility: 'bg-purple-100 text-purple-800 border-purple-200',
  weight: 'bg-amber-100 text-amber-800 border-amber-200',
  nutrition: 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-stone-100 text-stone-800 border-stone-200'
};

const categoryOptions = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'weight', label: 'Weight Management' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'other', label: 'Other' }
];

const GoalSetting = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id'>>({
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    progress: 0,
    category: 'other'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewGoal({
      ...newGoal,
      [e.target.name]: e.target.value
    });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGoal({
      ...newGoal,
      progress: parseInt(e.target.value)
    });
  };

  const handleAddGoal = async () => {
    if (!newGoal.title) {
      setError('Please enter a goal title');
      return;
    }

    if (!newGoal.targetDate) {
      setError('Please set a target date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real app, you would call your API here
      // const response = await userAPI.addGoal(newGoal);
      
      // For demo, we'll just update the local state
      const newId = Math.random().toString(36).substring(2, 9);
      
      if (isEditing) {
        setGoals(goals.map(goal => 
          goal.id === isEditing 
            ? { ...newGoal, id: isEditing } 
            : goal
        ));
        setIsEditing(null);
      } else {
        setGoals([...goals, { ...newGoal, id: newId }]);
      }
      
      // Reset form
      setNewGoal({
        title: '',
        description: '',
        targetDate: new Date().toISOString().split('T')[0],
        progress: 0,
        category: 'other'
      });
      
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to add goal:', err);
      setError('Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal: Goal) => {
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate,
      progress: goal.progress,
      category: goal.category
    });
    setIsEditing(goal.id);
    setIsCreating(true);
  };

  const handleDelete = (goalId: string) => {
    // In a real app, you would call your API here
    // await userAPI.deleteGoal(goalId);
    
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(null);
    setError(null);
    setNewGoal({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      progress: 0,
      category: 'other'
    });
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-amber-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const displayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">Fitness Goals</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-1 bg-amber-700 hover:bg-amber-800 text-white px-3 py-2 rounded-lg transition-colors duration-300"
          >
            <Plus size={16} />
            <span>New Goal</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isCreating ? (
        <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 mb-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-stone-600 mb-1">
                Goal Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newGoal.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g. Complete a 5K run"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stone-600 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newGoal.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Add details about your goal"
                rows={2}
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-stone-600 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newGoal.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-stone-600 mb-1">
                  Target Date*
                </label>
                <input
                  type="date"
                  id="targetDate"
                  name="targetDate"
                  value={newGoal.targetDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-stone-600 mb-1">
                Current Progress: {newGoal.progress}%
              </label>
              <input
                type="range"
                id="progress"
                name="progress"
                value={newGoal.progress}
                onChange={handleProgressChange}
                min="0"
                max="100"
                step="5"
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={loading}
                className={`px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors duration-300 flex items-center ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Check size={16} className="mr-1" /> Update Goal
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-1" /> Save Goal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {goals.length > 0 ? (
        <div className="space-y-4">
          {goals.map((goal) => {
            const daysRemaining = calculateDaysRemaining(goal.targetDate);
            
            return (
              <div 
                key={goal.id} 
                className={`border rounded-lg overflow-hidden ${
                  categoryColors[goal.category as keyof typeof categoryColors] || categoryColors.other
                }`}
              >
                <div className="p-4 bg-white border-b">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      {categoryIcons[goal.category] || categoryIcons.other}
                      <h3 className="ml-3 font-semibold text-stone-800">{goal.title}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(goal)}
                        className="p-1 rounded-full hover:bg-stone-100"
                      >
                        <Edit2 size={16} className="text-stone-500" />
                      </button>
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        className="p-1 rounded-full hover:bg-stone-100"
                      >
                        <Trash2 size={16} className="text-stone-500" />
                      </button>
                    </div>
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-stone-600 mt-2 ml-11">{goal.description}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-stone-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div 
                        className={`${getProgressColor(goal.progress)} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <span className="text-xs flex items-center text-stone-500">
                        <Calendar size={12} className="mr-1" />
                        {displayDate(goal.targetDate)}
                      </span>
                      <span className={`text-xs ${
                        daysRemaining < 0 ? 'text-red-600' : 
                        daysRemaining < 7 ? 'text-amber-600' : 
                        'text-stone-500'
                      }`}>
                        {daysRemaining < 0 
                          ? 'Overdue' 
                          : daysRemaining === 0 
                          ? 'Due today' 
                          : `${daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
            <Target size={24} className="text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-700 mb-2">No goals yet</h3>
          <p className="text-stone-500 mb-6">
            Set fitness goals to track your progress and stay motivated
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Create Your First Goal</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalSetting;
