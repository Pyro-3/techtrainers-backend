const Exercise = require('../models/ExerciseModel');
const mongoose = require('mongoose');

// Exercise management operations
const exerciseController = {
  getExercises: async (req, res) => {
    try {
      // Extract query parameters for filtering, sorting, and pagination
      const {
        name,
        muscleGroup,
        difficulty,
        equipment,
        type,
        page = 1,
        limit = 20,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Build filter object based on query parameters
      const filter = {};

      // Add name search if provided (case-insensitive partial match)
      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }

      // Add muscle group filter if provided
      if (muscleGroup) {
        // Handle multiple muscle groups (comma-separated)
        const muscleGroups = muscleGroup.split(',');
        filter.muscleGroup = { $in: muscleGroups };
      }

      // Add difficulty filter if provided
      if (difficulty) {
        // Handle multiple difficulties (comma-separated)
        const difficulties = difficulty.split(',');
        filter.difficulty = { $in: difficulties };
      }

      // Add equipment filter if provided
      if (equipment) {
        // Handle multiple equipment types (comma-separated)
        const equipmentTypes = equipment.split(',');
        filter.equipment = { $in: equipmentTypes };
      }

      // Add exercise type filter if provided
      if (type) {
        // Handle multiple types (comma-separated)
        const types = type.split(',');
        filter.type = { $in: types };
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
      const exercises = await Exercise.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit);

      // Get total count for pagination info
      const total = await Exercise.countDocuments(filter);

      return res.status(200).json({
        status: 'success',
        data: {
          exercises,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parsedLimit),
            limit: parsedLimit
          }
        },
        message: 'Exercises retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getExercises:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve exercises'
      });
    }
  },

  getExerciseById: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid exercise ID format'
        });
      }

      // Find exercise by ID
      const exercise = await Exercise.findById(id);

      // Handle case where exercise is not found
      if (!exercise) {
        return res.status(404).json({
          status: 'error',
          message: 'Exercise not found'
        });
      }

      // Get related exercises with the same muscle group (limited to 5)
      const relatedExercises = await Exercise.find({
        _id: { $ne: id },
        muscleGroup: { $in: exercise.muscleGroup }
      })
        .limit(5)
        .select('name imageUrl difficulty');

      return res.status(200).json({
        status: 'success',
        data: {
          exercise,
          relatedExercises
        },
        message: 'Exercise retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getExerciseById:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve exercise'
      });
    }
  },

  getExercisesByMuscleGroup: async (req, res) => {
    try {
      const { muscleGroup } = req.params;
      
      // Validate muscle group
      const validMuscleGroups = [
        'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body', 'cardio'
      ];
      
      if (!validMuscleGroups.includes(muscleGroup)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid muscle group'
        });
      }

      // Extract additional query parameters
      const {
        difficulty,
        equipment,
        page = 1,
        limit = 20,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Build filter object
      const filter = { muscleGroup };

      // Add difficulty filter if provided
      if (difficulty) {
        filter.difficulty = difficulty;
      }

      // Add equipment filter if provided
      if (equipment) {
        filter.equipment = equipment;
      }

      // Determine sort direction
      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      
      // Create sort object
      const sort = {};
      sort[sortBy] = sortDirection;

      // Calculate pagination parameters
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const parsedLimit = parseInt(limit);

      // Execute query
      const exercises = await Exercise.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit);

      // Get total count for pagination
      const total = await Exercise.countDocuments(filter);

      // Get difficulty distribution for this muscle group
      const difficultyDistribution = await Exercise.aggregate([
        { $match: { muscleGroup } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // Format the difficulty distribution
      const formattedDistribution = {};
      difficultyDistribution.forEach(item => {
        formattedDistribution[item._id] = item.count;
      });

      return res.status(200).json({
        status: 'success',
        data: {
          muscleGroup,
          exercises,
          difficultyDistribution: formattedDistribution,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parsedLimit),
            limit: parsedLimit
          }
        },
        message: `Exercises for ${muscleGroup} retrieved successfully`
      });
    } catch (error) {
      console.error('Error in getExercisesByMuscleGroup:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve exercises by muscle group'
      });
    }
  },

  getFeaturedExercises: async (req, res) => {
    try {
      // Extract query parameter for count
      const { count = 6 } = req.query;
      const parsedCount = parseInt(count);

      // Validate count
      if (isNaN(parsedCount) || parsedCount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Count parameter must be a positive integer'
        });
      }

      // Get featured exercises
      // First try to get exercises marked as featured
      let featuredExercises = await Exercise.find({ featured: true })
        .limit(parsedCount);

      // If not enough featured exercises found, supplement with popular exercises
      if (featuredExercises.length < parsedCount) {
        const remainingCount = parsedCount - featuredExercises.length;
        
        // Get exercises sorted by popularity (rating) excluding already featured ones
        const featuredIds = featuredExercises.map(exercise => exercise._id);
        const popularExercises = await Exercise.find({
          _id: { $nin: featuredIds }
        })
          .sort({ rating: -1 })
          .limit(remainingCount);
        
        // Combine the results
        featuredExercises = [...featuredExercises, ...popularExercises];
      }

      // If still not enough exercises, get some random ones
      if (featuredExercises.length < parsedCount) {
        const remainingCount = parsedCount - featuredExercises.length;
        const featuredIds = featuredExercises.map(exercise => exercise._id);
        
        // Get random exercises
        const randomExercises = await Exercise.aggregate([
          { $match: { _id: { $nin: featuredIds } } },
          { $sample: { size: remainingCount } }
        ]);
        
        // Combine the results
        featuredExercises = [...featuredExercises, ...randomExercises];
      }

      return res.status(200).json({
        status: 'success',
        data: featuredExercises,
        message: 'Featured exercises retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getFeaturedExercises:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve featured exercises'
      });
    }
  },

  // Additional useful methods

  createExercise: async (req, res) => {
    // Only admin can create exercises
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create exercises'
        });
      }

      const {
        name,
        description,
        muscleGroup,
        difficulty,
        equipment,
        instructions,
        type,
        imageUrl,
        videoUrl,
        featured
      } = req.body;

      // Validate required fields
      if (!name || !description || !muscleGroup || !difficulty) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide name, description, muscle group, and difficulty'
        });
      }

      // Create new exercise
      const exercise = new Exercise({
        name,
        description,
        muscleGroup,
        difficulty,
        equipment,
        instructions,
        type,
        imageUrl,
        videoUrl,
        featured: featured || false,
        createdBy: req.user._id
      });

      // Save exercise
      await exercise.save();

      return res.status(201).json({
        status: 'success',
        data: exercise,
        message: 'Exercise created successfully'
      });
    } catch (error) {
      console.error('Error in createExercise:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create exercise'
      });
    }
  },

  updateExercise: async (req, res) => {
    // Only admin can update exercises
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update exercises'
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid exercise ID format'
        });
      }

      // Update exercise
      const updatedExercise = await Exercise.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      // Handle case where exercise is not found
      if (!updatedExercise) {
        return res.status(404).json({
          status: 'error',
          message: 'Exercise not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: updatedExercise,
        message: 'Exercise updated successfully'
      });
    } catch (error) {
      console.error('Error in updateExercise:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update exercise'
      });
    }
  },

  deleteExercise: async (req, res) => {
    // Only admin can delete exercises
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete exercises'
        });
      }

      const { id } = req.params;

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid exercise ID format'
        });
      }

      // Delete exercise
      const deletedExercise = await Exercise.findByIdAndDelete(id);

      // Handle case where exercise is not found
      if (!deletedExercise) {
        return res.status(404).json({
          status: 'error',
          message: 'Exercise not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { id },
        message: 'Exercise deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteExercise:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete exercise'
      });
    }
  },

  getMuscleGroups: async (req, res) => {
    try {
      // Get distinct muscle groups from the database
      const muscleGroups = await Exercise.distinct('muscleGroup');
      
      // Get count of exercises for each muscle group
      const muscleGroupCounts = await Promise.all(
        muscleGroups.map(async (group) => {
          const count = await Exercise.countDocuments({ muscleGroup: group });
          return { 
            name: group, 
            count,
            // Add display name for better UI presentation
            displayName: group.charAt(0).toUpperCase() + group.slice(1).replace('_', ' ')
          };
        })
      );
      
      // Sort by count (descending)
      muscleGroupCounts.sort((a, b) => b.count - a.count);

      return res.status(200).json({
        status: 'success',
        data: muscleGroupCounts,
        message: 'Muscle groups retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getMuscleGroups:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve muscle groups'
      });
    }
  },

  getEquipmentTypes: async (req, res) => {
    try {
      // Get distinct equipment types from the database
      const equipmentTypes = await Exercise.distinct('equipment');
      
      // Get count of exercises for each equipment type
      const equipmentCounts = await Promise.all(
        equipmentTypes.map(async (type) => {
          const count = await Exercise.countDocuments({ equipment: type });
          return { 
            name: type, 
            count,
            displayName: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
          };
        })
      );
      
      // Sort by count (descending)
      equipmentCounts.sort((a, b) => b.count - a.count);

      return res.status(200).json({
        status: 'success',
        data: equipmentCounts,
        message: 'Equipment types retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getEquipmentTypes:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve equipment types'
      });
    }
  }
};

module.exports = exerciseController;