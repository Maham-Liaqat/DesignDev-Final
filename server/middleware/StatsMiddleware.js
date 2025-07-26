const StatsService = require("../services/StatsService");

// Middleware to update user stats after certain actions
const updateUserStatsMiddleware = async (req, res, next) => {
  try {
    // Store the original send method
    const originalSend = res.send;
    
    // Override the send method to update stats after response
    res.send = function(data) {
      // Call the original send method
      originalSend.call(this, data);
      
      // Update stats if the response was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.userId;
        if (userId) {
          // Update stats asynchronously (don't wait for it)
          StatsService.updateUserStats(userId).catch(err => {
            console.error('Error updating user stats in middleware:', err);
          });
        }
      }
    };
    
    next();
  } catch (error) {
    console.error('Error in stats middleware:', error);
    next();
  }
};

// Middleware to update stats for a specific user ID
const updateStatsForUser = (userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      const originalSend = res.send;
      
      res.send = function(data) {
        originalSend.call(this, data);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const userId = req.params[userIdField] || req.body[userIdField];
          if (userId) {
            StatsService.updateUserStats(userId).catch(err => {
              console.error('Error updating user stats in middleware:', err);
            });
          }
        }
      };
      
      next();
    } catch (error) {
      console.error('Error in stats middleware:', error);
      next();
    }
  };
};

module.exports = {
  updateUserStatsMiddleware,
  updateStatsForUser
}; 