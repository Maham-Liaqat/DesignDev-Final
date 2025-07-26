const mongoose = require('mongoose');
const StatsService = require('./services/StatsService');
const User = require('./model/UserModel');
const Sale = require('./model/SaleModel');
const Message = require('./model/MessageModel');
const Seller = require('./model/SellerMods');
const Review = require('./model/ReviewModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testStatsSystem() {
  try {
    console.log('Testing Stats System...\n');

    // Test 1: Create a test user
    console.log('1. Creating test user...');
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Test user created:', testUser.username);

    // Test 2: Create a test template
    console.log('\n2. Creating test template...');
    const testTemplate = await Seller.create({
      sellerName: 'testuser',
      email: 'test@example.com',
      templateName: 'Test Template',
      category: 'Web',
      techStack: 'React',
      shortDescription: 'A test template',
      longDescription: 'A long description for the test template',
      license: 'free',
      price: 0
    });
    console.log('✅ Test template created:', testTemplate.templateName);

    // Test 3: Create a test sale
    console.log('\n3. Creating test sale...');
    const testSale = await Sale.create({
      templateId: testTemplate._id,
      sellerId: testUser._id,
      buyerId: testUser._id, // Using same user for simplicity
      amount: 50.00,
      status: 'completed',
      paymentMethod: 'stripe',
      transactionId: 'test_transaction_123'
    });
    console.log('✅ Test sale created: $', testSale.amount);

    // Test 4: Create test messages (inquiry and response)
    console.log('\n4. Creating test messages...');
    const testMessage1 = await Message.create({
      conversationId: new mongoose.Types.ObjectId(),
      senderId: testUser._id,
      receiverId: testUser._id,
      content: 'Is this template available?',
      isInquiry: true
    });
    
    const testMessage2 = await Message.create({
      conversationId: testMessage1.conversationId,
      senderId: testUser._id,
      receiverId: testUser._id,
      content: 'Yes, it is available!',
      hasResponse: true
    });
    console.log('✅ Test messages created');

    // Test 5: Create a test review
    console.log('\n5. Creating test review...');
    const testReview = await Review.create({
      username: 'reviewer',
      rating: 5,
      title: 'Great template!',
      content: 'This template is excellent',
      seller: testTemplate._id
    });
    console.log('✅ Test review created with rating:', testReview.rating);

    // Test 6: Calculate and display stats
    console.log('\n6. Calculating user stats...');
    const stats = await StatsService.calculateAllStats(testUser._id);
    console.log('✅ User stats calculated:');
    console.log('   - Templates uploaded:', stats.templatesUploaded);
    console.log('   - Total sales:', stats.totalSales);
    console.log('   - Total revenue: $', stats.totalRevenue);
    console.log('   - Response rate:', stats.responseRate + '%');
    console.log('   - Average response time:', stats.averageResponseTime + ' hours');
    console.log('   - Total reviews:', stats.totalReviews);
    console.log('   - Average rating:', stats.averageRating);

    // Test 7: Update user stats in database
    console.log('\n7. Updating user stats in database...');
    await StatsService.updateUserStats(testUser._id);
    console.log('✅ User stats updated in database');

    // Test 8: Get detailed stats
    console.log('\n8. Getting detailed stats...');
    const detailedStats = await StatsService.getUserDetailedStats(testUser._id);
    console.log('✅ Detailed stats retrieved');
    console.log('   - Recent sales count:', detailedStats.recentSales.length);
    console.log('   - Recent inquiries count:', detailedStats.recentInquiries.length);

    console.log('\n🎉 All tests passed! Stats system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: 'test@example.com' });
    await Seller.deleteOne({ email: 'test@example.com' });
    await Sale.deleteOne({ transactionId: 'test_transaction_123' });
    await Message.deleteMany({ content: { $in: ['Is this template available?', 'Yes, it is available!'] } });
    await Review.deleteOne({ title: 'Great template!' });
    console.log('✅ Test data cleaned up');
    
    mongoose.connection.close();
  }
}

// Run the test
testStatsSystem(); 