/**
 * Fitness-related calculations and utilities
 */

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {Object} - BMI value and category
 */
const calculateBMI = (weightKg, heightCm) => {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be positive values');
  }
  
  // Convert height to meters
  const heightM = heightCm / 100;
  
  // Calculate BMI
  const bmi = weightKg / (heightM * heightM);
  
  // Determine BMI category
  let category;
  if (bmi < 18.5) {
    category = 'underweight';
  } else if (bmi < 25) {
    category = 'normal';
  } else if (bmi < 30) {
    category = 'overweight';
  } else {
    category = 'obese';
  }
  
  return {
    bmi: parseFloat(bmi.toFixed(2)),
    category
  };
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} - BMR in calories per day
 */
const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (gender.toLowerCase() === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal metabolic rate
 * @param {string} activityLevel - Activity level
 * @returns {number} - TDEE in calories per day
 */
const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    'sedentary': 1.2, // Little or no exercise
    'light': 1.375, // Light exercise 1-3 days/week
    'moderate': 1.55, // Moderate exercise 3-5 days/week
    'active': 1.725, // Heavy exercise 6-7 days/week
    'very active': 1.9 // Very heavy exercise, physical job, or training twice daily
  };
  
  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.2;
  return Math.round(bmr * multiplier);
};

/**
 * Calculate macronutrient distribution based on goal
 * @param {number} calories - Total daily calories
 * @param {string} goal - 'maintenance', 'fat loss', 'muscle gain'
 * @returns {Object} - Macronutrient distribution in grams
 */
const calculateMacros = (calories, goal) => {
  let proteinPct, fatPct, carbPct;
  
  switch (goal.toLowerCase()) {
    case 'fat loss':
      proteinPct = 0.40; // 40% protein
      fatPct = 0.35;    // 35% fat
      carbPct = 0.25;   // 25% carbs
      break;
    case 'muscle gain':
      proteinPct = 0.30; // 30% protein
      fatPct = 0.25;    // 25% fat
      carbPct = 0.45;   // 45% carbs
      break;
    case 'maintenance':
    default:
      proteinPct = 0.30; // 30% protein
      fatPct = 0.30;    // 30% fat
      carbPct = 0.40;   // 40% carbs
  }
  
  // Calculate macros in grams
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const protein = Math.round((calories * proteinPct) / 4);
  const carbs = Math.round((calories * carbPct) / 4);
  const fat = Math.round((calories * fatPct) / 9);
  
  return {
    protein,
    carbs,
    fat,
    calories
  };
};

/**
 * Estimate calorie burn for an activity
 * @param {number} weightKg - Weight in kilograms
 * @param {string} activity - Type of activity
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} - Estimated calories burned
 */
const estimateCalorieBurn = (weightKg, activity, durationMinutes) => {
  // MET values (Metabolic Equivalent of Task) for various activities
  const metValues = {
    'walking': 3.5,
    'jogging': 7.0,
    'running': 9.8,
    'cycling': 7.5,
    'swimming': 7.0,
    'weight lifting': 3.5,
    'yoga': 2.5,
    'hiit': 8.0,
    'pilates': 3.0,
    'elliptical': 5.0,
    'stair climbing': 4.0,
    'aerobics': 6.0
  };
  
  // Default to walking if activity not found
  const met = metValues[activity.toLowerCase()] || 3.5;
  
  // Calories burned = MET * weight in kg * duration in hours
  return Math.round((met * weightKg * (durationMinutes / 60)));
};

module.exports = {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  estimateCalorieBurn
};