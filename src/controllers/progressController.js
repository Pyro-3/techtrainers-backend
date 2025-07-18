const Progress = require('../models/ProgressModel');
const User = require('../models/User');
const mongoose = require('mongoose');

// Progress tracking operations
const progressController = {
  logProgress: async (req, res) => {
    try {
      const userId = req.user._id;
      const { 
        date, 
        weight, 
        bodyFat, 
        measurements, 
        notes,
        workoutDuration,
        caloriesBurned,
        mood,
        energyLevel,
        sleepHours 
      } = req.body;

      // Validate required fields
      if (!date) {
        return res.status(400).json({
          status: 'error',
          message: 'Date is required for progress entry'
        });
      }

      // Validate date format
      const entryDate = new Date(date);
      if (isNaN(entryDate.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format'
        });
      }

      // Check if entry for this date already exists
      const existingEntry = await Progress.findOne({
        userId,
        date: {
          $gte: new Date(entryDate.setHours(0, 0, 0, 0)),
          $lt: new Date(entryDate.setHours(23, 59, 59, 999))
        }
      });

      // If entry exists, update it
      if (existingEntry) {
        const updatedEntry = await Progress.findByIdAndUpdate(
          existingEntry._id,
          {
            weight: weight !== undefined ? weight : existingEntry.weight,
            bodyFat: bodyFat !== undefined ? bodyFat : existingEntry.bodyFat,
            measurements: measurements ? { ...existingEntry.measurements, ...measurements } : existingEntry.measurements,
            notes: notes !== undefined ? notes : existingEntry.notes,
            workoutDuration: workoutDuration !== undefined ? workoutDuration : existingEntry.workoutDuration,
            caloriesBurned: caloriesBurned !== undefined ? caloriesBurned : existingEntry.caloriesBurned,
            mood: mood !== undefined ? mood : existingEntry.mood,
            energyLevel: energyLevel !== undefined ? energyLevel : existingEntry.energyLevel,
            sleepHours: sleepHours !== undefined ? sleepHours : existingEntry.sleepHours,
          },
          { new: true }
        );

        // Update user profile with latest weight and measurements if provided
        if (weight || measurements) {
          const updateData = {};
          
          if (weight) {
            updateData['profile.weight'] = weight;
          }
          
          if (measurements) {
            if (measurements.chest) updateData['profile.measurements.chest'] = measurements.chest;
            if (measurements.waist) updateData['profile.measurements.waist'] = measurements.waist;
            if (measurements.hips) updateData['profile.measurements.hips'] = measurements.hips;
            if (measurements.biceps) updateData['profile.measurements.biceps'] = measurements.biceps;
            if (measurements.thighs) updateData['profile.measurements.thighs'] = measurements.thighs;
          }
          
          await User.findByIdAndUpdate(userId, updateData);
        }

        return res.status(200).json({
          status: 'success',
          data: updatedEntry,
          message: 'Progress entry updated successfully'
        });
      }

      // Create new progress entry
      const newProgress = new Progress({
        userId,
        date: entryDate,
        weight,
        bodyFat,
        measurements,
        notes,
        workoutDuration,
        caloriesBurned,
        mood,
        energyLevel,
        sleepHours
      });

      await newProgress.save();

      // Update user profile with latest weight and measurements if provided
      if (weight || measurements) {
        const updateData = {};
        
        if (weight) {
          updateData['profile.weight'] = weight;
        }
        
        if (measurements) {
          updateData['profile.measurements'] = measurements;
        }
        
        await User.findByIdAndUpdate(userId, updateData);
      }

      return res.status(201).json({
        status: 'success',
        data: newProgress,
        message: 'Progress logged successfully'
      });
    } catch (error) {
      console.error('Error in logProgress:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to log progress'
      });
    }
  },
  
  getProgressHistory: async (req, res) => {
    try {
      const userId = req.user._id;
      const { 
        startDate, 
        endDate, 
        metrics = 'all', 
        limit = 30,
        page = 1,
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = { userId };

      // Add date range filter if provided
      if (startDate || endDate) {
        filter.date = {};
        
        if (startDate) {
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) {
            filter.date.$gte = start;
          }
        }
        
        if (endDate) {
          const end = new Date(endDate);
          if (!isNaN(end.getTime())) {
            filter.date.$lte = end;
          }
        }
      }

      // Determine which fields to include
      let projection = {};
      if (metrics !== 'all') {
        // Always include date and userId
        projection = { date: 1, userId: 1 };
        
        // Add requested metrics
        const requestedMetrics = metrics.split(',');
        requestedMetrics.forEach(metric => {
          projection[metric.trim()] = 1;
        });
      }

      // Determine sort order
      const sort = { date: sortOrder === 'asc' ? 1 : -1 };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const parsedLimit = parseInt(limit);

      // Execute query with pagination
      const progressEntries = await Progress.find(filter, projection)
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit);

      // Get total count for pagination
      const total = await Progress.countDocuments(filter);

      return res.status(200).json({
        status: 'success',
        data: {
          entries: progressEntries,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parsedLimit),
            limit: parsedLimit
          }
        },
        message: 'Progress history retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getProgressHistory:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve progress history'
      });
    }
  },
  
  getProgressStats: async (req, res) => {
    try {
      const userId = req.user._id;
      const { timeframe = '30days', metrics = 'weight,bodyFat,workoutDuration' } = req.query;

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
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Default to 30 days
      }

      // Get all progress entries within the timeframe
      const progressEntries = await Progress.find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: 1 });

      // Get requested metrics
      const requestedMetrics = metrics.split(',').map(m => m.trim());
      
      // Calculate statistics
      const stats = {};

      // Process each metric
      requestedMetrics.forEach(metric => {
        if (['weight', 'bodyFat', 'workoutDuration', 'caloriesBurned', 'sleepHours', 'energyLevel'].includes(metric)) {
          // Filter out entries where the metric is defined
          const validEntries = progressEntries.filter(entry => entry[metric] !== undefined);
          
          if (validEntries.length > 0) {
            // Calculate basic statistics
            const values = validEntries.map(entry => entry[metric]);
            const sum = values.reduce((acc, val) => acc + val, 0);
            const avg = sum / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const latest = validEntries[validEntries.length - 1][metric];
            const oldest = validEntries[0][metric];
            const change = latest - oldest;
            const percentChange = oldest !== 0 ? (change / oldest) * 100 : 0;
            
            // Format the trend data for charts
            const trend = validEntries.map(entry => ({
              date: entry.date,
              value: entry[metric]
            }));
            
            stats[metric] = {
              latest,
              min,
              max,
              avg,
              change,
              percentChange,
              trend
            };
          } else {
            stats[metric] = null;
          }
        }
        // Handle measurements separately as they're nested objects
        else if (metric === 'measurements') {
          const measurementKeys = ['chest', 'waist', 'hips', 'biceps', 'thighs'];
          
          stats.measurements = {};
          
          measurementKeys.forEach(key => {
            // Filter entries where this measurement exists
            const validEntries = progressEntries.filter(
              entry => entry.measurements && entry.measurements[key] !== undefined
            );
            
            if (validEntries.length > 0) {
              const values = validEntries.map(entry => entry.measurements[key]);
              const latest = validEntries[validEntries.length - 1].measurements[key];
              const oldest = validEntries[0].measurements[key];
              const change = latest - oldest;
              
              stats.measurements[key] = {
                latest,
                change,
                trend: validEntries.map(entry => ({
                  date: entry.date,
                  value: entry.measurements[key]
                }))
              };
            } else {
              stats.measurements[key] = null;
            }
          });
        }
      });

      // Calculate consistency metrics
      let totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      let recordedDays = new Set(progressEntries.map(entry => 
        new Date(entry.date).toISOString().split('T')[0]
      )).size;
      
      const consistency = {
        totalDays,
        recordedDays,
        recordingRate: Math.round((recordedDays / totalDays) * 100),
        streaks: calculateStreaks(progressEntries)
      };

      // Get summary data (first and latest entry)
      const summary = {
        startDate,
        endDate,
        firstEntry: progressEntries.length > 0 ? progressEntries[0] : null,
        latestEntry: progressEntries.length > 0 ? progressEntries[progressEntries.length - 1] : null,
        entriesCount: progressEntries.length
      };

      return res.status(200).json({
        status: 'success',
        data: {
          timeframe,
          summary,
          stats,
          consistency
        },
        message: 'Progress statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getProgressStats:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve progress statistics'
      });
    }
  },
  
  deleteProgressEntry: async (req, res) => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid entry ID format'
        });
      }

      // Find the entry and ensure it belongs to the current user
      const progressEntry = await Progress.findOne({ _id: id, userId });

      if (!progressEntry) {
        return res.status(404).json({
          status: 'error',
          message: 'Progress entry not found or you do not have permission to delete it'
        });
      }

      // Delete the entry
      await Progress.findByIdAndDelete(id);

      // If this was the latest entry for weight or measurements,
      // update the user profile with data from the next most recent entry
      const latestEntry = await Progress.findOne({ userId })
        .sort({ date: -1 });
      
      if (latestEntry) {
        const updateData = {};
        
        if (latestEntry.weight) {
          updateData['profile.weight'] = latestEntry.weight;
        }
        
        if (latestEntry.measurements) {
          updateData['profile.measurements'] = latestEntry.measurements;
        }
        
        if (Object.keys(updateData).length > 0) {
          await User.findByIdAndUpdate(userId, updateData);
        }
      }

      return res.status(200).json({
        status: 'success',
        data: { id },
        message: 'Progress entry deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteProgressEntry:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete progress entry'
      });
    }
  },
  
  // Additional useful methods
  
  getProgressSummary: async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Get the first and last progress entries
      const firstEntry = await Progress.findOne({ userId })
        .sort({ date: 1 })
        .select('date weight bodyFat measurements');
        
      const latestEntry = await Progress.findOne({ userId })
        .sort({ date: -1 })
        .select('date weight bodyFat measurements');
      
      // If no entries exist, return empty summary
      if (!firstEntry || !latestEntry) {
        return res.status(200).json({
          status: 'success',
          data: {
            hasData: false,
            message: 'No progress data available'
          }
        });
      }
      
      // Calculate days tracked
      const daysTracked = await Progress.distinct('date', { userId });
      
      // Calculate total workouts logged
      const workoutsLogged = await Progress.countDocuments({
        userId,
        workoutDuration: { $gt: 0 }
      });
      
      // Calculate changes
      const changes = {};
      
      if (firstEntry.weight && latestEntry.weight) {
        changes.weight = {
          start: firstEntry.weight,
          current: latestEntry.weight,
          change: latestEntry.weight - firstEntry.weight,
          percentChange: ((latestEntry.weight - firstEntry.weight) / firstEntry.weight) * 100
        };
      }
      
      if (firstEntry.bodyFat && latestEntry.bodyFat) {
        changes.bodyFat = {
          start: firstEntry.bodyFat,
          current: latestEntry.bodyFat,
          change: latestEntry.bodyFat - firstEntry.bodyFat,
          percentChange: ((latestEntry.bodyFat - firstEntry.bodyFat) / firstEntry.bodyFat) * 100
        };
      }
      
      // Calculate measurement changes
      if (firstEntry.measurements && latestEntry.measurements) {
        changes.measurements = {};
        
        ['chest', 'waist', 'hips', 'biceps', 'thighs'].forEach(measurement => {
          if (
            firstEntry.measurements[measurement] !== undefined && 
            latestEntry.measurements[measurement] !== undefined
          ) {
            changes.measurements[measurement] = {
              start: firstEntry.measurements[measurement],
              current: latestEntry.measurements[measurement],
              change: latestEntry.measurements[measurement] - firstEntry.measurements[measurement],
              percentChange: ((latestEntry.measurements[measurement] - firstEntry.measurements[measurement]) / firstEntry.measurements[measurement]) * 100
            };
          }
        });
      }
      
      // Calculate duration
      const durationDays = Math.ceil(
        (new Date(latestEntry.date) - new Date(firstEntry.date)) / (1000 * 60 * 60 * 24)
      );
      
      return res.status(200).json({
        status: 'success',
        data: {
          hasData: true,
          startDate: firstEntry.date,
          currentDate: latestEntry.date,
          durationDays,
          daysTracked: daysTracked.length,
          workoutsLogged,
          consistency: (daysTracked.length / durationDays) * 100,
          changes
        },
        message: 'Progress summary retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getProgressSummary:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to retrieve progress summary'
      });
    }
  }
};

// Helper function to calculate streaks from progress entries
function calculateStreaks(entries) {
  if (entries.length === 0) return { current: 0, longest: 0 };
  
  // Map entries to dates and sort them
  const dates = entries
    .map(entry => new Date(entry.date).toISOString().split('T')[0])
    .sort();
  
  let currentStreak = 1;
  let longestStreak = 1;
  let streakStart = dates[0];
  
  // Calculate streaks
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);
    
    // Calculate difference in days
    const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      // Break in streak
      currentStreak = 1;
      streakStart = dates[i];
    }
  }
  
  // Check if current streak is still active (ends today or yesterday)
  const lastEntryDate = new Date(dates[dates.length - 1]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const isActiveStreak = 
    lastEntryDate.getTime() === today.getTime() || 
    lastEntryDate.getTime() === yesterday.getTime();
  
  return {
    current: isActiveStreak ? currentStreak : 0,
    longest: longestStreak,
    streakStart: isActiveStreak ? streakStart : null
  };
}

module.exports = progressController;