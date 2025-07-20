import { useState, useEffect, ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User as UserIcon, Edit, Save, XCircle } from 'lucide-react';

// max avatar upload size (2MB)
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const ProfilePage = () => {
  const { user, isAuthenticated, loading, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    fitnessLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    goals: [] as string[]
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        fitnessLevel: (user.fitnessLevel as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        goals: user.profile?.goals || []
      });
      setAvatarPreview((user as any).avatarUrl || null);
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUpdateError(null);
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > MAX_AVATAR_SIZE) {
        setUpdateError('Image is too large. Please select a file under 2MB.');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await userAPI.updateProfile({
        name: formData.name,
        fitnessLevel: formData.fitnessLevel,
        goals: formData.goals
      });
      if (avatarFile) {
        const uploadData = new FormData();
        uploadData.append('avatar', avatarFile);
        await userAPI.updateAvatar(uploadData);
      }
      setUpdateSuccess('Profile updated successfully!');
      setIsEditing(false);
      await refreshUserData();
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setUpdateError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <>
      <Header />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-8">
            {updateSuccess && <div className="bg-green-100 border-green-400 text-green-700 p-3 rounded mb-4">{updateSuccess}</div>}
            {updateError && <div className="bg-red-100 border-red-400 text-red-700 p-3 rounded mb-4">{updateError}</div>}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-stone-800">My Profile</h1>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg">
                  <Edit size={18} /><span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(false)} className="flex items-center bg-stone-200 hover:bg-stone-300 text-stone-700 px-4 py-2 rounded-lg">
                    <XCircle size={18} /><span>Cancel</span>
                  </button>
                  <button onClick={handleSubmit} disabled={isUpdating} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                    {isUpdating ? <span>Saving...</span> : <><Save size={18} /><span>Save</span></>}
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative">
                  <div className="bg-stone-100 rounded-full w-40 h-40 mb-4 overflow-hidden">
                    {avatarPreview ? <img src={avatarPreview} alt="Profile" className="object-cover w-full h-full" /> : <UserIcon size={64} className="text-stone-400" />}
                  </div>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-full">
                        <span className="bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">Click to upload</span>
                      </div>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-stone-800 mt-2">{user?.name}</h2>
                <p className="text-stone-500 capitalize">{user?.fitnessLevel || 'Beginner'} Level</p>
              </div>
              <div className="w-full md:w-2/3">
                {!isEditing ? (
                  <div className="space-y-6">
                    <div><h3 className="text-stone-500 font-medium mb-1">Full Name</h3><p className="text-stone-900 font-semibold">{user?.name}</p></div>
                    <div><h3 className="text-stone-500 font-medium mb-1">Email Address</h3><p className="text-stone-900 font-semibold">{user?.email}</p></div>
                    <div><h3 className="text-stone-500 font-medium mb-1">Fitness Level</h3><p className="text-stone-900 font-semibold">{user?.fitnessLevel}</p></div>
                    <div><h3 className="text-stone-500 font-medium mb-1">Member Since</h3><p className="text-stone-900 font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p></div>
                  </div>
                ) : (
                  <form className="space-y-6">
                    <div><label htmlFor="name" className="block text-stone-500 mb-1">Full Name</label><input id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-stone-50 p-3 rounded-lg border focus:border-amber-500" /></div>
                    <div><label htmlFor="email" className="block text-stone-500 mb-1">Email Address</label><input id="email" name="email" value={formData.email} readOnly className="w-full bg-stone-50 p-3 rounded-lg border" /></div>
                    <div><label htmlFor="fitnessLevel" className="block text-stone-500 mb-1">Fitness Level</label><select id="fitnessLevel" name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange} className="w-full bg-stone-50 p-3 rounded-lg border focus:border-amber-500"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
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
