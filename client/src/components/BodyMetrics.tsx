import { useState } from 'react';
import { userAPI } from '../services/api';

const BodyMetrics = () => {
  // Modes: simple vs advanced
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  // Units: metric vs imperial
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  // Inputs
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [weight, setWeight] = useState(''); // kg or lbs
  const [height, setHeight] = useState(''); // cm or in
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [neck, setNeck] = useState('');

  // Results
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [healthyRange, setHealthyRange] = useState<{ min: number; max: number } | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Conversion helpers
  const toKg = (lbs: number) => lbs * 0.453592;
  const toLbs = (kg: number) => kg / 0.453592;
  const toCm = (inch: number) => inch * 2.54;
  const toIn = (cm: number) => cm / 2.54;

  const calculateBMI = async () => {
    // Validate core inputs
    const a = parseInt(age, 10);
    let w = parseFloat(weight);
    let h = parseFloat(height);
    if (isNaN(a) || a <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setError('Please fill out all required fields with valid numbers.');
      setBmi(null);
      setCategory('');
      setHealthyRange(null);
      setBodyFat(null);
      return;
    }
    setError('');

    // Convert to metric units for calculation
    if (units === 'imperial') {
      w = toKg(w);
      h = toCm(h);
    }
    const heightM = h / 100;

    // BMI calculation
    const rawBmi = w / (heightM * heightM);
    const roundedBMI = Number(rawBmi.toFixed(1));
    setBmi(roundedBMI);

    // BMI category
    let cat = '';
    if (roundedBMI < 18.5) cat = 'Underweight';
    else if (roundedBMI < 25) cat = 'Normal';
    else if (roundedBMI < 30) cat = 'Overweight';
    else cat = 'Obesity';
    setCategory(cat);

    // Healthy weight range
    const minW = 18.5 * heightM * heightM;
    const maxW = 24.9 * heightM * heightM;
    setHealthyRange({ min: Number(minW.toFixed(1)), max: Number(maxW.toFixed(1)) });

    // Advanced mode: body fat % via US Navy formula
    if (mode === 'advanced') {
      let bf: number | null = null;
      const wst = parseFloat(waist);
      const hp = parseFloat(hips);
      const nk = parseFloat(neck);
      if (!isNaN(wst) && !isNaN(nk)) {
        // convert measurement to cm if imperial
        const waistCM = units === 'imperial' ? toCm(wst) : wst;
        const neckCM = units === 'imperial' ? toCm(nk) : nk;
        const hipCM = !isNaN(hp) ? (units === 'imperial' ? toCm(hp) : hp) : 0;
        if (gender === 'male') {
          bf = 495 / (1.0324 - 0.19077 * Math.log10(waistCM - neckCM) + 0.15456 * Math.log10(h)) - 450;
        } else {
          bf = 495 / (1.29579 - 0.35004 * Math.log10(waistCM + hipCM - neckCM) + 0.221 * Math.log10(h)) - 450;
        }
      }
      setBodyFat(bf !== null ? Number(bf.toFixed(1)) : null);
    } else {
      setBodyFat(null);
    }

    // Save to backend
    try {
      setSaving(true);
      await userAPI.updateBMI({ bmi: roundedBMI, category: cat, age: a, gender });
    } catch (e) {
      console.error('Save failed:', e);
      setError('Failed to save. Try again later.');
    } finally {
      setSaving(false);
    }
  };

  const getColor = (cat: string) => {
    switch (cat) {
      case 'Underweight': return 'text-blue-600';
      case 'Normal': return 'text-green-600';
      case 'Overweight': return 'text-yellow-600';
      case 'Obesity': return 'text-red-600';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-stone-800 mb-4">Body Metrics</h2>

      {/* Mode Toggle */}
      <div className="mb-4 flex space-x-4">
        <button
          className={`flex-1 py-2 rounded ${mode === 'simple' ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}
          onClick={() => setMode('simple')}
        >Simple</button>
        <button
          className={`flex-1 py-2 rounded ${mode === 'advanced' ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}
          onClick={() => setMode('advanced')}
        >Advanced</button>
      </div>

      {/* Unit Toggle */}
      <div className="mb-4 flex space-x-4">
        <button
          className={`flex-1 py-2 rounded ${units === 'metric' ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}
          onClick={() => setUnits('metric')}
        >Metric (kg, cm)</button>
        <button
          className={`flex-1 py-2 rounded ${units === 'imperial' ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}
          onClick={() => setUnits('imperial')}
        >Imperial (lbs, in)</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm">Age</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="Years"
            className="w-full p-2 border border-stone-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Gender</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as any)}
            className="w-full p-2 border border-stone-300 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col">
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={units === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}
            className="w-full p-2 border border-stone-300 rounded"
          />
          {weight && (
            <button
              onClick={() => {
                const val = parseFloat(weight);
                if (!isNaN(val)) {
                  const converted = units === 'metric' ? toLbs(val) : toKg(val);
                  setWeight(converted.toFixed(1));
                  setUnits(units === 'metric' ? 'imperial' : 'metric');
                }
              }}
              className="mt-1 text-sm text-blue-600 hover:underline"
            >Convert to {units === 'metric' ? 'lbs' : 'kg'}</button>
          )}
        </div>

        <div className="flex flex-col">
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder={units === 'metric' ? 'Height (cm)' : 'Height (in)'}
            className="w-full p-2 border border-stone-300 rounded"
          />
          {height && (
            <button
              onClick={() => {
                const val = parseFloat(height);
                if (!isNaN(val)) {
                  const converted = units === 'metric' ? toIn(val) : toCm(val);
                  setHeight(converted.toFixed(1));
                  setUnits(units === 'metric' ? 'imperial' : 'metric');
                }
              }}
              className="mt-1 text-sm text-blue-600 hover:underline"
            >Convert to {units === 'metric' ? 'in' : 'cm'}</button>
          )}
        </div>

        {mode === 'advanced' && (
          <>            
            <input
              type="number"
              value={waist}
              onChange={e => setWaist(e.target.value)}
              placeholder={units === 'metric' ? 'Waist (cm)' : 'Waist (in)'}
              className="w-full p-2 border border-stone-300 rounded"
            />
            <input
              type="number"
              value={hips}
              onChange={e => setHips(e.target.value)}
              placeholder={units === 'metric' ? 'Hips (cm)' : 'Hips (in)'}
              className="w-full p-2 border border-stone-300 rounded"
            />
            <input
              type="number"
              value={neck}
              onChange={e => setNeck(e.target.value)}
              placeholder={units === 'metric' ? 'Neck (cm)' : 'Neck (in)'}
              className="w-full p-2 border border-stone-300 rounded"
            />
          </>
        )}

        <button
          onClick={calculateBMI}
          disabled={saving}
          className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg"
        >
          {saving ? 'Saving...' : 'Calculate BMI'}
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {bmi !== null && (
          <div className="mt-4 text-center">
            <p className={`text-lg font-semibold ${getColor(category)}`}>Your BMI: {bmi}</p>
            <p className="text-sm text-stone-600">Category: {category}</p>
            {healthyRange && (
              <p className="text-sm text-stone-500 mt-1">
                Healthy weight range: {healthyRange.min}{units==='metric'? 'kg':'lbs'} – {healthyRange.max}{units==='metric'? 'kg':'lbs'}
              </p>
            )}
            {mode === 'advanced' && bodyFat !== null && (
              <p className="text-sm text-stone-700 mt-2">Estimated Body Fat: {bodyFat}%</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyMetrics;
