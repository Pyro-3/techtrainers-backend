import { useState } from 'react';
import { registerUser } from '../services/api'; // Update path as needed

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [role, setRole] = useState('member'); // Default to member

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const userData = {
      name,
      email,
      password,
      fitnessLevel,
      role, // include role in signup data
    };

    try {
      const result = await registerUser(userData);
      console.log('Registration successful:', result);
      setSuccess('Signup successful!');
      // Optionally redirect or reset form
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded px-4 py-2"
            minLength={6}
          />
        </div>

        <div>
          <label className="block font-medium">Fitness Level</label>
          <select
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
            className="w-full border rounded px-4 py-2"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Registering as</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded px-4 py-2"
          >
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
