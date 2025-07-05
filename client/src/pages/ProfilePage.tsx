import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User, Edit, Save, XCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, isAuthenticated, loading, refreshUserData } = useAuth();const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goals: [] as string[]
  });
  
  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        fitnessLevel: (user.fitnessLevel as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        goals: user.profile?.goals || []
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    try {
      // Call API to update profile
      const response = await userAPI.updateProfile({
        name: formData.name,
        fitnessLevel: formData.fitnessLevel,
        goals: formData.goals
      });
      
      // Show success message
      setUpdateSuccess('Profile updated successfully!');
      
      // Exit edit mode
      setIsEditing(false);
      
      // Timeout to hide success message
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
        // Update user data in the auth context
      await refreshUserData();
      
    } catch (err: any) {
      console.error('Profile update error:', err);
      setUpdateError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <>
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6">          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
            {updateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
                <span className="mr-2">✓</span>
                {updateSuccess}
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                <span className="mr-2">✕</span>
                {updateError}
              </div>
            )}
            
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-stone-800">My Profile</h1>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                >
                  <Edit size={18} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <XCircle size={18} />
                    <span>Cancel</span>
                  </button>                  <button 
                    onClick={handleSubmit}
                    className={`flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 ${isUpdating ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="bg-stone-100 rounded-full w-40 h-40 flex items-center justify-center mb-4">
                  <User size={64} className="text-stone-400" />
                </div>
                <h2 className="text-xl font-semibold text-stone-800">{user?.name}</h2>
                <p className="text-stone-500 capitalize">{user?.fitnessLevel || 'Beginner'} Level</p>
              </div>
              
              <div className="w-full md:w-2/3">
                {!isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-stone-500 font-medium mb-1">Full Name</h3>
                      <p className="text-stone-900 font-semibold">{user?.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-stone-500 font-medium mb-1">Email Address</h3>
                      <p className="text-stone-900 font-semibold">{user?.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-stone-500 font-medium mb-1">Fitness Level</h3>
                      <p className="text-stone-900 font-semibold capitalize">{user?.fitnessLevel || 'Beginner'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-stone-500 font-medium mb-1">Member Since</h3>
                      <p className="text-stone-900 font-semibold">
                        {user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-stone-500 font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors duration-300"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-stone-500 font-medium mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors duration-300"
                        placeholder="Your email address"
                        readOnly
                      />
                      <p className="text-xs text-stone-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label htmlFor="fitnessLevel" className="block text-stone-500 font-medium mb-1">
                        Fitness Level
                      </label>
                      <select
                        id="fitnessLevel"
                        name="fitnessLevel"
                        value={formData.fitnessLevel}
                        onChange={handleChange}
                        className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors duration-300"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ProfilePage;
