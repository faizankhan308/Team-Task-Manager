import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!uri) {
    throw new Error('MONGO_URI or MONGO_URL is not configured');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

export default connectDB;
