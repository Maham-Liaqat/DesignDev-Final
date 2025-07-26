const Sale = require("../model/SaleModel");
const User = require("../model/UserModel");
const Seller = require("../model/SellerMods");
const StatsService = require("../services/StatsService");

// Create a new sale
const createSale = async (req, res) => {
  try {
    const { templateId, buyerId, amount, paymentMethod, transactionId, notes } = req.body;
    const sellerId = req.user.userId; // From auth middleware

    // Validate required fields
    if (!templateId || !buyerId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        error: "Template ID, buyer ID, amount, and payment method are required" 
      });
    }

    // Verify template exists and belongs to seller
    const template = await Seller.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, error: "Template not found" });
    }

    const seller = await User.findById(sellerId);
    if (template.email !== seller.email) {
      return res.status(403).json({ success: false, error: "Template does not belong to seller" });
    }

    // Create sale record
    const newSale = new Sale({
      templateId,
      sellerId,
      buyerId,
      amount,
      paymentMethod,
      transactionId,
      notes,
      status: 'completed' // Assuming immediate completion for now
    });

    await newSale.save();

    // Update seller stats
    await StatsService.updateUserStats(sellerId);

    res.status(201).json({ 
      success: true, 
      message: "Sale recorded successfully",
      sale: newSale 
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sales for a seller
const getSellerSales = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { sellerId };
    if (status) {
      query.status = status;
    }

    const sales = await Sale.find(query)
      .populate('templateId', 'templateName category')
      .populate('buyerId', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.status(200).json({
      success: true,
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error getting seller sales:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sales statistics for a seller
const getSalesStats = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { period = 'all' } = req.query; // all, month, week, year

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const query = { sellerId, status: 'completed', ...dateFilter };

    const [totalSales, totalRevenue, recentSales] = await Promise.all([
      Sale.countDocuments(query),
      Sale.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Sale.find(query)
        .populate('templateId', 'templateName')
        .populate('buyerId', 'username')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const revenue = recentSales.length > 0 ? recentSales[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalSales,
        totalRevenue: Math.round(revenue * 100) / 100,
        period
      },
      recentSales
    });
  } catch (error) {
    console.error('Error getting sales stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update sale status
const updateSaleStatus = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { status } = req.body;
    const sellerId = req.user.userId;

    const sale = await Sale.findOne({ _id: saleId, sellerId });
    if (!sale) {
      return res.status(404).json({ success: false, error: "Sale not found" });
    }

    sale.status = status;
    await sale.save();

    // Update stats if status changed to completed
    if (status === 'completed') {
      await StatsService.updateUserStats(sellerId);
    }

    res.status(200).json({ 
      success: true, 
      message: "Sale status updated successfully",
      sale 
    });
  } catch (error) {
    console.error('Error updating sale status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get detailed user stats
const getUserDetailedStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own stats or if they have permission
    if (req.user.userId !== userId) {
      // For now, allow public access to stats
      // You might want to add more sophisticated permission checks
    }

    const stats = await StatsService.getUserDetailedStats(userId);
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting detailed stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Manually trigger stats update
const updateUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const stats = await StatsService.updateUserStats(userId);
    
    res.status(200).json({
      success: true,
      message: "Stats updated successfully",
      stats
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createSale,
  getSellerSales,
  getSalesStats,
  updateSaleStatus,
  getUserDetailedStats,
  updateUserStats
};   
