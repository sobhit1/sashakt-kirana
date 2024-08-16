import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/route.js';
dotenv.config();

const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to the database
connectDB();

app.use('/', router);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
