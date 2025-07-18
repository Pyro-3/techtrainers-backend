const Workout = require('../models/Workout');
const Exercise = require('../models/ExerciseModel');
const User = require('../models/User');
const Progress = require('../models/ProgressModel');
const mongoose = require('mongoose');

// Workout management operations
const workoutController = {
  createWorkout: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        title,
        description,
        exercises,
        type,
        difficulty,
        estimatedDuration,
        scheduledFor,
        notes
      } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          status: 'error',
          message: 'Workout title is required'
        });
      }

      // Validate exercises if provided
      if (exercises && !Array.isArray(exercises)) {
        return res.status(400).json({
          status: 'error',
          message: 'Exercises must be an array'
        });
      }

      // Prepare exercises with validation
      let validatedExercises = [];
      if (exercises && exercises.length > 0) {
        // Verify exercise IDs exist in database
        const exerciseIds = exercises
          .filter(ex => ex.exerciseId)
          .map(ex => ex.exerciseId);
        
        if (exerciseIds.length > 0) {
          const existingExercises = await Exercise.find({
            _id: { $in: exerciseIds }
          }).select('_id name');
          
          const existingIds = existingExercises.map(ex => ex._id.toString());
          
          // Format and validate each exercise
          validatedExercises = exercises.map(ex => {
            // If custom exercise without ID
            if (!ex.exerciseId) {
              return {
                name: ex.name || 'Custom Exercise',
                sets: ex.sets || 1,
                reps: ex.reps || 10,
                duration: ex.duration || 0,
                restTime: ex.restTime || 60,
                notes: ex.notes || ''
              };
            }
            
            // If exercise with ID exists in database
            if (existingIds.includes(ex.exerciseId.toString())) {
              return {
                exerciseId: ex.exerciseId,
                sets: ex.sets || 1,
                reps: ex.reps || 10,
                duration: ex.duration || 0,
                restTime: ex.restTime || 60,
                notes: ex.notes || ''
              };
            }
            
            // Invalid exercise ID, use as custom
            return {
              name: ex.name || 'Custom Exercise',
              sets: ex.sets || 1,
              reps: ex.reps || 10,
              duration: ex.duration || 0,
              restTime: ex.restTime || 60,
              notes: ex.notes || ''
            };
          });
        } else {
          // All custom exercises
          validatedExercises = exercises.map(ex => ({
            name: ex.name || 'Custom Exercise',
            sets: ex.sets || 1,
            reps: ex.reps || 10,
            duration: ex.duration || 0,
            restTime: ex.restTime || 60,
            notes: ex.notes || ''
          }));
        }
      }

      // Create new workout
      const workout = new Workout({
        userId,
        title,
        description: description || '',
        exercises: validatedExercises,
        type: type || 'general',
        difficulty: difficulty || req.user.fitnessLevel || 'beginner',
        estimatedDuration: estimatedDuration || calculateEstimatedDuration(validatedExercises),
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'in-progress',
        notes: notes || ''
      });

      await workout.save();

      return res.status(201).json({
        status: 'success',
        data: workout,
        message: 'Workout created successfully'
      });
    } catch (error) {
      console.error('Error in createWorkout:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create workout'
      });
    }
  },

  getWorkouts: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        status,
        type,
        difficulty,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = { userId };

      // Add status filter if provided
      if (status) {
        filter.status = status;
      }

      // Add type filter if provided
      if (type) {
        filter.type = type;
      }

      // Add difficulty filter if provided
      if (difficulty) {
        filter.difficulty = difficulty;
      }

      // Add search functionality for title or description
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      // Add date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate);
        }
      }

      // Determine sort direction
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      
      // Create sort object
      const sort = {};
      sort[sortBy] = sortDirection;

      // Calculate pagination parameters
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const parsedLimit = parseInt(limit);

      // Execute query with filters, sorting, and pagination
      const workouts = await Workout.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit);

      // Get total count for pagination info
      const total = await Workout.countDocuments(filter);

      // Get status counts for filters
      const statusCounts = await Workout.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Format status counts
      const statusCountsObj = {};
      statusCounts.forEach(item => {
        statusCountsObj[item._id] = item.count;
      });

      return res.status(200).json({
        status: 'success',
        data: {
          workouts,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parsedLimit),
            limit: parsedLimit
          },
          filters: {
            statusCounts: statusCountsObj
          }
        },
        message: 'Workouts retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getWorkouts:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve workouts'
      });
    }
  },

  getWorkout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid workout ID format'
        });
      }

      // Find workout by ID and ensure it belongs to the current user
      const workout = await Workout.findOne({ _id: id, userId });

      if (!workout) {
        return res.status(404).json({
          status: 'error',
          message: 'Workout not found'
        });
      }

      // Populate exercise details if they reference existing exercises
      if (workout.exercises && workout.exercises.length > 0) {
        // Extract exercise IDs
        const exerciseIds = workout.exercises
          .filter(ex => ex.exerciseId)
          .map(ex => ex.exerciseId);
        
        if (exerciseIds.length > 0) {
          // Fetch exercise details
          const exerciseDetails = await Exercise.find({
            _id: { $in: exerciseIds }
          }).select('name description imageUrl muscleGroup difficulty type');
          
          // Create lookup map
          const exerciseMap = {};
          exerciseDetails.forEach(ex => {
            exerciseMap[ex._id.toString()] = ex;
          });
          
          // Enhance workout exercises with details
          workout.exercises = workout.exercises.map(ex => {
            if (ex.exerciseId && exerciseMap[ex.exerciseId.toString()]) {
              const details = exerciseMap[ex.exerciseId.toString()];
              return {
                ...ex.toObject(),
                details: {
                  name: details.name,
                  description: details.description,
                  imageUrl: details.imageUrl,
                  muscleGroup: details.muscleGroup,
                  difficulty: details.difficulty,
                  type: details.type
                }
              };
            }
            return ex;
          });
        }
      }

      return res.status(200).json({
        status: 'success',
        data: workout,
        message: 'Workout retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getWorkout:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve workout'
      });
    }
  },

  updateWorkout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid workout ID format'
        });
      }

      // Check if workout exists and belongs to user
      const existingWorkout = await Workout.findOne({ _id: id, userId });
      
      if (!existingWorkout) {
        return res.status(404).json({
          status: 'error',
          message: 'Workout not found'
        });
      }

      // Prevent updating completed workouts
      if (existingWorkout.status === 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot update a completed workout'
        });
      }

      // Handle exercises update if provided
      if (updateData.exercises) {
        if (!Array.isArray(updateData.exercises)) {
          return res.status(400).json({
            status: 'error',
            message: 'Exercises must be an array'
          });
        }

        // Validate and format exercises
        const exerciseIds = updateData.exercises
          .filter(ex => ex.exerciseId)
          .map(ex => ex.exerciseId);
        
        if (exerciseIds.length > 0) {
          const existingExercises = await Exercise.find({
            _id: { $in: exerciseIds }
          }).select('_id');
          
          const existingIds = existingExercises.map(ex => ex._id.toString());
          
          // Format exercises, handling both referenced and custom
          updateData.exercises = updateData.exercises.map(ex => {
            if (!ex.exerciseId) {
              return {
                name: ex.name || 'Custom Exercise',
                sets: ex.sets || 1,
                reps: ex.reps || 10,
                duration: ex.duration || 0,
                restTime: ex.restTime || 60,
                notes: ex.notes || ''
              };
            }
            
            if (existingIds.includes(ex.exerciseId.toString())) {
              return {
                exerciseId: ex.exerciseId,
                sets: ex.sets || 1,
                reps: ex.reps || 10,
                duration: ex.duration || 0,
                restTime: ex.restTime || 60,
                notes: ex.notes || ''
              };
            }
            
            return {
              name: ex.name || 'Custom Exercise',
              sets: ex.sets || 1,
              reps: ex.reps || 10,
              duration: ex.duration || 0,
              restTime: ex.restTime || 60,
              notes: ex.notes || ''
            };
          });
        }

        // Update estimated duration if exercises changed
        if (!updateData.estimatedDuration) {
          updateData.estimatedDuration = calculateEstimatedDuration(updateData.exercises);
        }
      }

      // Update status based on scheduledFor if changed
      if (updateData.scheduledFor && !updateData.status) {
        updateData.status = 'scheduled';
      }

      // Update workout
      const updatedWorkout = await Workout.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        status: 'success',
        data: updatedWorkout,
        message: 'Workout updated successfully'
      });
    } catch (error) {
      console.error('Error in updateWorkout:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update workout'
      });
    }
  },

  deleteWorkout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid workout ID format'
        });
      }

      // Find workout by ID and ensure it belongs to the current user
      const workout = await Workout.findOne({ _id: id, userId });

      if (!workout) {
        return res.status(404).json({
          status: 'error',
          message: 'Workout not found'
        });
      }

      // Delete the workout
      await Workout.findByIdAndDelete(id);

      return res.status(200).json({
        status: 'success',
        data: { id },
        message: 'Workout deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteWorkout:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete workout'
      });
    }
  },

  completeWorkout: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { 
        duration, 
        caloriesBurned, 
        exerciseResults, 
        notes,
        rating 
      } = req.body;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid workout ID format'
        });
      }

      // Find workout by ID and ensure it belongs to the current user
      const workout = await Workout.findOne({ _id: id, userId });

      if (!workout) {
        return res.status(404).json({
          status: 'error',
          message: 'Workout not found'
        });
      }

      // Check if workout is already completed
      if (workout.status === 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Workout is already marked as completed'
        });
      }

      // Process exercise results if provided
      let updatedExercises = [...workout.exercises];
      if (exerciseResults && Array.isArray(exerciseResults)) {
        // Map exercise results to existing exercises
        updatedExercises = workout.exercises.map((ex, index) => {
          const result = exerciseResults.find(r => 
            (r.index === index) || 
            (ex.exerciseId && r.exerciseId === ex.exerciseId.toString()) ||
            (ex.name && r.name === ex.name)
          );

          if (result) {
            return {
              ...ex.toObject(),
              completed: true,
              actualSets: result.sets || ex.sets,
              actualReps: result.reps || ex.reps,
              actualWeight: result.weight || 0,
              actualDuration: result.duration || ex.duration,
              feedback: result.feedback || ''
            };
          }
          
          return ex;
        });
      }

      // Update workout to completed status
      const updatedWorkout = await Workout.findByIdAndUpdate(
        id,
        {
          status: 'completed',
          completedAt: new Date(),
          duration: duration || workout.estimatedDuration,
          caloriesBurned: caloriesBurned || 0,
          exercises: updatedExercises,
          notes: notes !== undefined ? notes : workout.notes,
          rating: rating || 0
        },
        { new: true }
      );

      // Create a progress entry for this workout
      const progressEntry = new Progress({
        userId,
        date: new Date(),
        workoutId: id,
        workoutDuration: duration || workout.estimatedDuration,
        caloriesBurned: caloriesBurned || 0,
        notes: `Completed workout: ${workout.title}`,
        workoutRating: rating || 0,
        workoutType: workout.type,
        workoutDifficulty: workout.difficulty
      });

      await progressEntry.save();

      return res.status(200).json({
        status: 'success',
        data: updatedWorkout,
        message: 'Workout marked as completed'
      });
    } catch (error) {
      console.error('Error in completeWorkout:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to complete workout'
      });
    }
  },

  getWorkoutStats: async (req, res) => {
    try {
      const userId = req.user._id;
      const { timeframe = '30days' } = req.query;

      // Determine date range based on timeframe
      const endDate = new Date();
      let startDate;
      
      switch (timeframe) {
        case '7days':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '6months':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'alltime':
          startDate = new Date(0); // Beginning of time
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Default to 30 days
      }

      // Get total workouts created in timeframe
      const totalWorkouts = await Workout.countDocuments({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      // Get completed workouts in timeframe
      const completedWorkouts = await Workout.countDocuments({
        userId,
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
      });

      // Get workouts by type
      const workoutsByType = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]);

      // Get workouts by difficulty
      const workoutsByDifficulty = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$difficulty',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get workout duration stats
      const durationStats = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalDuration: { $sum: '$duration' },
            avgDuration: { $avg: '$duration' },
            maxDuration: { $max: '$duration' },
            minDuration: { $min: '$duration' }
          }
        }
      ]);

      // Get workouts by day of week
      const workoutsByDay = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: '$completedAt' }, // 1 for Sunday, 2 for Monday, etc.
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);

      // Get workout time distribution (morning, afternoon, evening)
      const workoutsByTime = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed',
            completedAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $project: {
            hour: { $hour: '$completedAt' }
          }
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ['$hour', 12] }, then: 'morning' },
                  { case: { $lt: ['$hour', 18] }, then: 'afternoon' },
                  { case: { $gte: ['$hour', 18] }, then: 'evening' }
                ],
                default: 'unknown'
              }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // Format workout time distribution
      const timeDistribution = {};
      workoutsByTime.forEach(item => {
        timeDistribution[item._id] = item.count;
      });

      // Format workout by day distribution
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayDistribution = {};
      workoutsByDay.forEach(item => {
        // MongoDB's $dayOfWeek returns 1 for Sunday, 2 for Monday, etc.
        const dayIndex = item._id - 1;
        dayDistribution[dayNames[dayIndex]] = item.count;
      });

      // Prepare the response
      const stats = {
        timeframe,
        dateRange: {
          start: startDate,
          end: endDate
        },
        summary: {
          totalWorkouts,
          completedWorkouts,
          completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
          totalDuration: durationStats.length > 0 ? durationStats[0].totalDuration : 0,
          avgDuration: durationStats.length > 0 ? durationStats[0].avgDuration : 0,
          maxDuration: durationStats.length > 0 ? durationStats[0].maxDuration : 0,
          minDuration: durationStats.length > 0 ? durationStats[0].minDuration : 0
        },
        distribution: {
          byType: workoutsByType.map(item => ({
            type: item._id,
            count: item.count,
            totalDuration: item.totalDuration
          })),
          byDifficulty: workoutsByDifficulty.map(item => ({
            difficulty: item._id,
            count: item.count
          })),
          byDayOfWeek: dayDistribution,
          byTimeOfDay: timeDistribution
        }
      };

      return res.status(200).json({
        status: 'success',
        data: stats,
        message: 'Workout statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getWorkoutStats:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve workout statistics'
      });
    }
  }
};

// Helper function to calculate estimated workout duration
function calculateEstimatedDuration(exercises) {
  if (!exercises || exercises.length === 0) return 30; // Default 30 minutes
  
  let totalDuration = 0;
  
  exercises.forEach(exercise => {
    const sets = exercise.sets || 1;
    const reps = exercise.reps || 10;
    const restTime = exercise.restTime || 60; // seconds
    
    // Estimate exercise duration:
    // - Each rep takes about 5 seconds
    // - Rest time between sets
    const setDuration = (reps * 5) + (exercise.duration || 0);
    totalDuration += (sets * setDuration) + ((sets - 1) * restTime);
  });
  
  // Convert to minutes and round up
  return Math.ceil(totalDuration / 60) || 30; // Minimum 30 minutes
}

module.exports = workoutController;