import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart2, TrendingUp, ChevronDown, ChevronUp, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Mock progress data - in a real app, this would come from your API
const generateMockData = (weeks = 8) => {
  const data = [];
  let value = Math.floor(Math.random() * 20) + 60; // Start around 60-80
  
  for (let i = 0; i < weeks; i++) {
    // Create some natural looking variation
    const change = Math.floor(Math.random() * 10) - 2; // -2 to +7
    value = Math.max(50, Math.min(100, value + change));
    
    data.push({
      week: i + 1,
      value: Number(value.toFixed(1)) // Ensure numeric precision
    });
  }
  
  return data;
};

const validateStatData = (stat: StatCard): boolean => {
  return (
    stat &&
    typeof stat.id === 'string' &&
    typeof stat.title === 'string' &&
    typeof stat.currentValue === 'number' &&
    typeof stat.previousValue === 'number' &&
    typeof stat.unit === 'string' &&
    typeof stat.change === 'number' &&
    Array.isArray(stat.data) &&
    stat.data.length > 0 &&
    stat.data.every(point => 
      typeof point.week === 'number' && 
      typeof point.value === 'number' &&
      !isNaN(point.value)
    )
  );
};

interface ProgressDataPoint {
  week: number;
  value: number;
}

interface StatCard {
  id: string;
  title: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  change: number;
  data: ProgressDataPoint[];
}

const FitnessProgressTracker = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [expandedStat, setExpandedStat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would fetch this data from your backend
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        const currentWeight = user?.profile?.weight || 75;
        const previousWeight = currentWeight + 2.1; // Simulate previous weight being higher
        const weightChange = currentWeight - previousWeight;
          const mockStats = [
          {
            id: 'weight',
            title: 'Body Weight',
            currentValue: Number(currentWeight.toFixed(1)),
            previousValue: Number(previousWeight.toFixed(1)),
            unit: 'kg',
            change: Number(weightChange.toFixed(1)),
            data: generateMockData()
          },
          {
            id: 'strength',
            title: 'Strength Score',
            currentValue: 82,
            previousValue: 75,
            unit: 'pts',
            change: 7,
            data: generateMockData()
          },
          {
            id: 'cardio',
            title: 'Cardio Performance',
            currentValue: 68,
            previousValue: 62,
            unit: 'pts',
            change: 6,
            data: generateMockData()
          }
        ];
        
        // Validate data before setting state
        const validStats = mockStats.filter(validateStatData);
        if (validStats.length === 0) {
          throw new Error('No valid progress data available');
        }
        
        setStats(validStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [user, retryCount]);
    const toggleExpand = (id: string) => {
    setExpandedStat(expandedStat === id ? null : id);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-stone-600';
  };
  
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (change < 0) return <TrendingUp size={16} className="text-red-600 transform rotate-180" />;
    return null;
  };
  
  const getChangeText = (change: number) => {
    const absChange = Math.abs(change);
    if (change > 0) return `+${absChange}`;
    if (change < 0) return `-${absChange}`;
    return '0';
  };
    return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">My Fitness Progress</h2>
        <div className="flex items-center gap-2">
          {error && (
            <button 
              onClick={handleRetry}
              className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Retry
            </button>
          )}
          <button className="text-amber-700 hover:text-amber-800 text-sm font-medium">
            View Detailed Stats
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600 mx-auto mb-3" />
            <p className="text-stone-600">Loading your progress...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-stone-800 font-medium mb-1">Unable to load progress data</p>
            <p className="text-stone-600 text-sm mb-4">{error}</p>
            <button 
              onClick={handleRetry}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && stats.length > 0 && (
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.id} className="border border-stone-200 rounded-lg overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => toggleExpand(stat.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-stone-800">{stat.title}</h3>
                  <button className="text-stone-400 hover:text-stone-600 transition-colors">
                    {expandedStat === stat.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                
                <div className="mt-2 flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold text-stone-900">
                      {stat.currentValue}
                      <span className="text-lg ml-1 text-stone-600">{stat.unit}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm mr-1 ${getChangeColor(stat.change)}`}>
                        {getChangeText(stat.change)} {stat.unit}
                      </span>
                      {getChangeIcon(stat.change)}
                      <span className="text-xs text-stone-500 ml-2">vs last month</span>
                    </div>
                  </div>
                    <div className="flex items-end h-16">
                    {/* Simple bar chart visualization */}
                    {stat.data.slice(-5).map((point, i) => {
                      // Normalize height to fit within the 64px container (h-16)
                      const maxHeight = 60; // Leave some space for padding
                      const normalizedHeight = Math.max(8, (point.value / 100) * maxHeight);
                      
                      return (
                        <div key={i} className="flex flex-col items-center mx-1">
                          <div 
                            className="w-4 bg-amber-600 rounded-t transition-all duration-300"
                            style={{ height: `${normalizedHeight}px` }}
                          ></div>
                          <div className="text-xs text-stone-400 mt-1">{point.week}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {expandedStat === stat.id && (
                <div className="bg-stone-50 p-4 border-t border-stone-200 animate-in slide-in-from-top duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">8-Week Trend</h4>
                      <p className="text-sm text-stone-500">
                        {stat.change > 0 
                          ? 'Showing positive progress over time' 
                          : stat.change < 0 
                          ? 'Working to improve these results'
                          : 'Maintaining consistent results'}
                      </p>
                    </div>
                    <div>
                      <button className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        Set New Goal
                      </button>
                    </div>
                  </div>
                    {/* Full chart visualization */}
                  <div className="mt-4 h-48 flex items-end justify-between">
                    {stat.data.map((point, i) => {
                      // Normalize height for the larger chart (192px = h-48)
                      const maxHeight = 180; // Leave some space for padding
                      const normalizedHeight = Math.max(20, (point.value / 100) * maxHeight);
                      
                      return (
                        <div key={i} className="flex flex-col items-center flex-1">
                          <div 
                            className={`w-full max-w-[30px] ${
                              i === stat.data.length - 1 ? 'bg-amber-600' : 'bg-amber-300'
                            } rounded-t mx-1 transition-all duration-300`}
                            style={{ height: `${normalizedHeight}px` }}
                          ></div>
                          <div className="text-xs text-stone-500 mt-1">W{point.week}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-stone-500">Starting</p>
                      <p className="font-bold text-stone-800">{stat.data[0].value} {stat.unit}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-stone-500">Current</p>
                      <p className="font-bold text-stone-800">{stat.currentValue} {stat.unit}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-stone-500">Change</p>
                      <p className={`font-bold ${getChangeColor(stat.currentValue - stat.data[0].value)}`}>
                        {getChangeText(stat.currentValue - stat.data[0].value)} {stat.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stats.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart2 className="h-8 w-8 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-800 font-medium mb-1">No progress data available</p>
            <p className="text-stone-600 text-sm">Start tracking your fitness journey to see progress here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessProgressTracker;
