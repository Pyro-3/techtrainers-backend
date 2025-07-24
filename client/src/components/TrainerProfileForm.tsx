import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TrainerProfileForm: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    specialty: '',
    experience: '',
    certifications: '',
    achievements: '',
    bio: '',
    gender: '',
    instagram: '',
    linkedin: '',
    image: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'trainer') return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/trainers/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update trainer profile');

      setSuccess('Profile submitted successfully!');
      refreshUserData();
    } catch (err) {
      setError('Error submitting profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-stone-900 mb-6 text-center">Complete Your Trainer Profile</h2>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-semibold text-stone-700 mb-1">Specialty</label>
          <input name="specialty" value={formData.specialty} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" required />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Years of Experience</label>
          <input name="experience" value={formData.experience} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" required />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Certifications (comma separated)</label>
          <input name="certifications" value={formData.certifications} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" required />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Achievements</label>
          <input name="achievements" value={formData.achievements} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" required />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Short Bio</label>
          <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" required />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Gender</label>
          <input name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Instagram Handles (comma separated)</label>
          <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">LinkedIn Profile URL</label>
          <input name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" />
        </div>

        <div>
          <label className="block font-semibold text-stone-700 mb-1">Profile Image URL</label>
          <input name="image" value={formData.image} onChange={handleChange} className="w-full border border-stone-300 p-3 rounded" />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 px-6 rounded font-semibold transition"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Submit Profile'}
        </button>
      </form>
    </div>
  );
};

export default TrainerProfileForm;
