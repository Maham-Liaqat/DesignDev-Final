const User = require("../model/UserModel");
const Sale = require("../model/SaleModel");
const Message = require("../model/MessageModel");
const Seller = require("../model/SellerMods");
const Review = require("../model/ReviewModel");

class StatsService {
  // Calculate and update user stats
  static async updateUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get all stats
      const stats = await this.calculateAllStats(userId);
      
      // Update user stats
      await User.findByIdAndUpdate(userId, {
        $set: {
          'stats.totalSales': stats.totalSales,
          'stats.totalRevenue': stats.totalRevenue,
          'stats.responseRate': stats.responseRate,
          'stats.averageResponseTime': stats.averageResponseTime,
          'stats.templatesUploaded': stats.templatesUploaded,
          'stats.totalReviews': stats.totalReviews,
          'stats.averageRating': stats.averageRating,
          'stats.lastActive': new Date(),
        }
      });

      return stats;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Calculate all stats for a user
  static async calculateAllStats(userId) {
    const [
      salesStats,
      responseStats,
      templateStats,
      reviewStats
    ] = await Promise.all([
      this.calculateSalesStats(userId),
      this.calculateResponseStats(userId),
      this.calculateTemplateStats(userId),
      this.calculateReviewStats(userId)
    ]);

    return {
      ...salesStats,
      ...responseStats,
      ...templateStats,
      ...reviewStats
    };
  }

  // Calculate sales statistics
  static async calculateSalesStats(userId) {
    try {
      // Get completed sales for the user
      const completedSales = await Sale.find({
        sellerId: userId,
        status: 'completed'
      });

      const totalSales = completedSales.length;
      const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.amount, 0);

      return {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100 // Round to 2 decimal places
      };
    } catch (error) {
      console.error('Error calculating sales stats:', error);
      return { totalSales: 0, totalRevenue: 0 };
    }
  }

  // Calculate response rate and average response time
  static async calculateResponseStats(userId) {
    try {
      // Get all inquiries sent to this user (as a seller)
      const inquiries = await Message.find({
        receiverId: userId,
        isInquiry: true
      });

      if (inquiries.length === 0) {
        return { responseRate: 0, averageResponseTime: 0 };
      }

      let respondedCount = 0;
      let totalResponseTime = 0;

      for (const inquiry of inquiries) {
        // Find the first response from the seller within 24 hours
        const response = await Message.findOne({
          senderId: userId,
          receiverId: inquiry.senderId,
          conversationId: inquiry.conversationId,
          createdAt: {
            $gt: inquiry.createdAt,
            $lt: new Date(inquiry.createdAt.getTime() + 24 * 60 * 60 * 1000) // 24 hours
          }
        });

        if (response) {
          respondedCount++;
          const responseTimeHours = (response.createdAt - inquiry.createdAt) / (1000 * 60 * 60);
          totalResponseTime += responseTimeHours;
        }
      }

      const responseRate = Math.round((respondedCount / inquiries.length) * 100);
      const averageResponseTime = respondedCount > 0 
        ? Math.round((totalResponseTime / respondedCount) * 10) / 10 
        : 0;

      return {
        responseRate,
        averageResponseTime
      };
    } catch (error) {
      console.error('Error calculating response stats:', error);
      return { responseRate: 0, averageResponseTime: 0 };
    }
  }

  // Calculate template statistics
  static async calculateTemplateStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { templatesUploaded: 0 };
      }

      const templatesUploaded = await Seller.countDocuments({ email: user.email });
      
      return { templatesUploaded };
    } catch (error) {
      console.error('Error calculating template stats:', error);
      return { templatesUploaded: 0 };
    }
  }

  // Calculate review statistics
  static async calculateReviewStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { totalReviews: 0, averageRating: 0 };
      }

      // Get all templates by this user
      const userTemplates = await Seller.find({ email: user.email });
      const templateIds = userTemplates.map(t => t._id);

      if (templateIds.length === 0) {
        return { totalReviews: 0, averageRating: 0 };
      }

      // Get all reviews for these templates
      const reviews = await Review.find({ seller: { $in: templateIds } });
      
      const totalReviews = reviews.length;
      let averageRating = 0;

      if (totalReviews > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
      }

      return { totalReviews, averageRating };
    } catch (error) {
      console.error('Error calculating review stats:', error);
      return { totalReviews: 0, averageRating: 0 };
    }
  }

  // Mark a message as an inquiry
  static async markAsInquiry(messageId) {
    try {
      await Message.findByIdAndUpdate(messageId, {
        $set: { isInquiry: true }
      });
    } catch (error) {
      console.error('Error marking message as inquiry:', error);
    }
  }

  // Mark an inquiry as responded to
  static async markInquiryResponded(inquiryId, responseId) {
    try {
      const inquiry = await Message.findById(inquiryId);
      const response = await Message.findById(responseId);

      if (inquiry && response) {
        const responseTimeHours = (response.createdAt - inquiry.createdAt) / (1000 * 60 * 60);
        
        await Message.findByIdAndUpdate(inquiryId, {
          $set: { 
            hasResponse: true,
            responseTime: Math.round(responseTimeHours * 10) / 10
          }
        });
      }
    } catch (error) {
      console.error('Error marking inquiry as responded:', error);
    }
  }

  // Get detailed stats for a user
  static async getUserDetailedStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const stats = await this.calculateAllStats(userId);
      
      // Get recent sales
      const recentSales = await Sale.find({
        sellerId: userId,
        status: 'completed'
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('templateId', 'templateName')
      .populate('buyerId', 'username');

      // Get recent inquiries
      const recentInquiries = await Message.find({
        receiverId: userId,
        isInquiry: true
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('senderId', 'username');

      return {
        ...stats,
        recentSales,
        recentInquiries
      };
    } catch (error) {
      console.error('Error getting detailed stats:', error);
      throw error;
    }
  }
}

module.exports = StatsService; 