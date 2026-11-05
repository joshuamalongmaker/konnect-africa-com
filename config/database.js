const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/konnect_africa';
        console.log('Attempting to connect to MongoDB at:', mongoURI);
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Please make sure MongoDB is installed and running.');
        console.log('You can download MongoDB from: https://www.mongodb.com/try/download/community');
        process.exit(1);
    }
};

module.exports = connectDB; 