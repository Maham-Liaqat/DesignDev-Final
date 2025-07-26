const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URL);

mongoose.connection.once('open', async () => {
  try {
    console.log('🔧 Fixing email index in seller collection...');
    const db = mongoose.connection.db;
    const collection = db.collection('sellers'); // <-- collection name is 'sellers'

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Check if there's a unique index on email
    const emailIndex = indexes.find(index =>
      index.key && index.key.email === 1 && index.unique === true
    );

    if (emailIndex) {
      console.log('❌ Found unique index on email field. Dropping it...');
      await collection.dropIndex(emailIndex.name);
      console.log('✅ Unique index on email dropped successfully!');
    } else {
      console.log('✅ No unique index found on email field.');
    }

    // Create a new non-unique index for better performance
    console.log('📈 Creating new non-unique index on email...');
    await collection.createIndex({ email: 1, createdAt: -1 });
    console.log('✅ New index created successfully!');

    console.log('🎉 Email index fix completed! Users can now upload multiple templates.');
  } catch (error) {
    console.error('❌ Error fixing email index:', error);
  } finally {
    mongoose.connection.close();
  }
}); 