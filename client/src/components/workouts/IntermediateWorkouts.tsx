import React, { useEffect, useState, useContext } from 'react';
import { Calendar, TrendingUp, Target, Award, Plus, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext, { type UserData } from '../../contexts/AuthContext';


const IntermediateWorkouts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) as { user: UserData };



  const [workoutLog, setWorkoutLog] = useState({
    exerciseName: '',
    sets: '',
    reps: '',
    weight: ''
  });

  const [loggedWorkouts, setLoggedWorkouts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    thisWeek: 0,
    personalRecords: 0
  });

  useEffect(() => {
    if (user && user._id) {
      fetchUserWorkouts();
    }
  }, [user]);

  const fetchUserWorkouts = async () => {
    try {
      const res = await axios.get(`/api/workouts/user/${user._id}`);
      setLoggedWorkouts(res.data);
      setStats(prev => ({
        ...prev,
        totalWorkouts: res.data.length,
        thisWeek: res.data.filter((w: any) => isThisWeek(w.date)).length
      }));
    } catch (err) {
      console.error("Failed to fetch workouts", err);
    }
  };

  const isThisWeek = (dateStr: string) => {
    const now = new Date();
    const workoutDate = new Date(dateStr);
    const weekStart = new Date();
    weekStart.setDate(now.getDate() - now.getDay());
    return workoutDate >= weekStart;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutLog({
      ...workoutLog,
      [e.target.name]: e.target.value
    });
  };

  const logExercise = async () => {
    if (workoutLog.exerciseName.trim() && workoutLog.sets && workoutLog.reps && user?._id) {
      const newWorkout = {
        ...workoutLog,
        userId: user._id,
        date: new Date().toISOString()
      };

      try {
        await axios.post("/api/workouts", newWorkout);
        setLoggedWorkouts(prev => [...prev, { ...newWorkout, id: Date.now() }]);
        setStats(prev => ({
          ...prev,
          totalWorkouts: prev.totalWorkouts + 1,
          thisWeek: prev.thisWeek + 1
        }));

        setWorkoutLog({
          exerciseName: '',
          sets: '',
          reps: '',
          weight: ''
        });
      } catch (err) {
        console.error("Failed to save workout", err);
      }
    } else {
      alert("Please fill all fields before logging.");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-24 text-xl text-stone-600">
        Please log in to access your Intermediate Workout Dashboard.
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-stone-700 hover:text-amber-700 mb-6 transition-colors duration-300">
          <ArrowLeft className="w-5 h-5 mr-2" /> <span>Back</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-stone-900 mb-6">Intermediate Training Suite</h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Track your progress, log workouts, and achieve your fitness goals with advanced tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatBox label="Total Workouts" value={stats.totalWorkouts} icon={<Calendar />} />
          <StatBox label="Current Streak" value={`${stats.currentStreak} days 🔥`} icon={<TrendingUp />} />
          <StatBox label="This Week" value={stats.thisWeek} icon={<Target />} />
          <StatBox label="Personal Records" value={stats.personalRecords} icon={<Award />} />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-stone-900 mb-8 flex items-center">
            <Plus className="w-6 h-6 mr-3 text-amber-700" /> Workout Logger
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {['exerciseName', 'sets', 'reps', 'weight'].map((field) => (
              <div key={field}>
                <label className="block text-stone-700 font-semibold mb-3 capitalize">{field.replace(/([A-Z])/, ' $1')}</label>
                <input
                  type={field === 'exerciseName' ? 'text' : 'number'}
                  name={field}
                  value={(workoutLog as any)[field]}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 text-stone-900 p-4 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <button onClick={logExercise} className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 px-8 rounded-lg flex items-center">
            <Save className="w-5 h-5 mr-2" /> LOG EXERCISE
          </button>
        </div>

        {loggedWorkouts.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
            <h3 className="text-2xl font-bold text-stone-900 mb-8">Recent Workouts</h3>
            <div className="space-y-4">
              {loggedWorkouts.slice(-5).reverse().map((workout) => (
                <div key={workout.id} className="flex items-center justify-between bg-stone-50 p-6 rounded-lg">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">💪</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 text-lg">{workout.exerciseName}</h4>
                      <p className="text-stone-600">{new Date(workout.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8 text-stone-700">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{workout.sets}</div>
                      <div className="text-sm text-stone-500">Sets</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{workout.reps}</div>
                      <div className="text-sm text-stone-500">Reps</div>
                    </div>
                    {workout.weight && (
                      <div className="text-center">
                        <div className="font-semibold text-lg">{workout.weight}kg</div>
                        <div className="text-sm text-stone-500">Weight</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProgressBox />
          <AchievementBox />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
    <h3 className="text-stone-500 font-semibold text-sm uppercase tracking-wide mb-2">{label}</h3>
    <div className="text-4xl font-bold text-amber-700 mb-2">{value}</div>
    <div className="text-stone-400 mx-auto">{icon}</div>
  </div>
);

const ProgressBox = () => (
  <div className="bg-white rounded-2xl p-8 shadow-xl">
    <h3 className="text-xl font-bold text-stone-900 mb-6">Progress Analytics</h3>
    <div className="space-y-4">
      {[
        ['Weekly Volume', '+15%', 'text-amber-700'],
        ['Strength Gains', '+8%', 'text-green-600'],
        ['Consistency Score', '92%', 'text-amber-700']
      ].map(([label, value, color], i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
          <span className="text-stone-700">{label}</span>
          <span className={`font-semibold ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const AchievementBox = () => (
  <div className="bg-white rounded-2xl p-8 shadow-xl">
    <h3 className="text-xl font-bold text-stone-900 mb-6">Achievement Badges</h3>
    <div className="grid grid-cols-3 gap-4">
      {[
        ['🔥', 'Streak Master', true],
        ['💪', 'Strength Builder', true],
        ['🎯', 'Goal Crusher', false],
        ['⚡', 'Power Lifter', false],
        ['🏆', 'Champion', false],
        ['⭐', 'Elite', false]
      ].map(([emoji, name, earned], index) => (
        <div key={index} className={`text-center p-4 rounded-lg ${earned ? 'bg-amber-100' : 'bg-stone-100'}`}>
          <div className={`text-2xl mb-2 ${!earned ? 'grayscale opacity-50' : ''}`}>{emoji}</div>
          <div className={`text-xs font-medium ${earned ? 'text-amber-800' : 'text-stone-500'}`}>{name}</div>
        </div>
      ))}
    </div>
  </div>
);

export default IntermediateWorkouts;
