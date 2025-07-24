// src/components/fitness/FitnessSettings.tsx
import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Preferences {
  duration: string;
  frequency: string;
  workoutTypes: string[];
  primaryGoal: string;
  notifications: {
    summary: boolean;
    reminders: boolean;
    suggestions: boolean;
  };
}

const defaultPrefs: Preferences = {
  duration: '',
  frequency: '',
  workoutTypes: [],
  primaryGoal: '',
  notifications: {
    summary: false,
    reminders: false,
    suggestions: false,
  },
};

const durations = [
  '30 minutes',
  '60 minutes',
  '90 minutes',
  '120 minutes or more',
];

const frequencies = [
  '1–2 times per week',
  '3–4 times per week',
  '5–6 times per week',
  'Daily',
];

const workoutTypes = [
  'Strength',
  'Cardio',
  'Yoga',
  'Pilates',
  'Running',
];

const goals = [
  'Weight Loss',
  'Muscle Gain',
  'Endurance',
  'Flexibility',
];

export default function FitnessSettings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // load existing prefs
  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await userAPI.getPreferences();
        setPrefs(data);
      } catch {
        // ignore
      }
    }
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await userAPI.updatePreferences(prefs);
      setMessage('Preferences saved!');
    } catch {
      setMessage('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const onChange = (key: keyof Preferences, value: any) =>
    setPrefs(p => ({ ...p, [key]: value }));

  const onNotif = (key: keyof Preferences['notifications'], val: boolean) =>
    setPrefs(p => ({ 
      ...p, 
      notifications: { ...p.notifications, [key]: val }
    }));

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Preferences</h2>
        <div>
          <button
            className={`px-3 py-1 rounded-l ${mode==='simple' ? 'bg-amber-700 text-white' : 'bg-stone-200'}`}
            onClick={() => setMode('simple')}
          >Simple</button>
          <button
            className={`px-3 py-1 rounded-r ${mode==='advanced' ? 'bg-amber-700 text-white' : 'bg-stone-200'}`}
            onClick={() => setMode('advanced')}
          >Advanced</button>
        </div>
      </div>

      {/* Simple mode: just duration & email notif */}
      {mode === 'simple' && (
        <div className="space-y-4">
          <label>
            Workout Duration
            <select
              value={prefs.duration}
              onChange={e => onChange('duration', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select or enter below</option>
              {durations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>
            Or custom duration
            <input
              type="text"
              placeholder="e.g. 45 minutes"
              value={prefs.duration}
              onChange={e => onChange('duration', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={prefs.notifications.summary}
              onChange={e => onNotif('summary', e.target.checked)}
            />
            <span>Enable Email Notifications</span>
          </label>
        </div>
      )}

      {/* Advanced mode */}
      {mode === 'advanced' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label>
              Workout Duration
              <select
                value={prefs.duration}
                onChange={e => onChange('duration', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select or enter below</option>
                {durations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>
              Or custom duration
              <input
                type="text"
                placeholder="e.g. 45 minutes"
                value={prefs.duration}
                onChange={e => onChange('duration', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </label>
          </div>

          <label>
            Frequency
            <select
              value={prefs.frequency}
              onChange={e => onChange('frequency', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select frequency</option>
              {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>

          <fieldset className="space-y-2">
            <legend>Preferred Workout Types</legend>
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map(t => (
                <label key={t} className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={prefs.workoutTypes.includes(t)}
                    onChange={e => {
                      const next = e.target.checked
                        ? [...prefs.workoutTypes, t]
                        : prefs.workoutTypes.filter(x => x !== t);
                      onChange('workoutTypes', next);
                    }}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Primary Goal
            <select
              value={prefs.primaryGoal}
              onChange={e => onChange('primaryGoal', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select goal</option>
              {goals.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>

          <fieldset className="space-y-2">
            <legend>Notifications</legend>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={prefs.notifications.summary}
                onChange={e => onNotif('summary', e.target.checked)}
              />
              <span>Weekly progress summaries</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={prefs.notifications.reminders}
                onChange={e => onNotif('reminders', e.target.checked)}
              />
              <span>Goal reminders</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={prefs.notifications.suggestions}
                onChange={e => onNotif('suggestions', e.target.checked)}
              />
              <span>Workout suggestions</span>
            </label>
          </fieldset>
        </div>
      )}

      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {message && <p className="mt-2 text-center">{message}</p>}
      </div>
    </div>
  );
}
