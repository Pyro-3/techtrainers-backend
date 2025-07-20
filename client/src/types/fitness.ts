export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type MuscleGroup = 'Chest' | 'Legs' | 'Back' | 'Core';

export type Goal = 'Strength' | 'Hypertrophy' | 'Fat Loss';

export type Split = 'Push' | 'Pull' | 'Legs' | 'Full Body';

export interface Exercise {
  name: string;
  muscle: string;
  difficulty: string;
  goals: Goal[];
  split: Split;
  video: string;
}

export interface Workout {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  date: string;
  userId?: string;      // ← make this optional
}


// Remove the mapped interface that was causing issues
// Replace with a simpler type definition using Record
export type WorkoutPlan = Record<MuscleGroup, string[]>;