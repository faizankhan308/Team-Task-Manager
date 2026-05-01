import mongoose from 'mongoose';

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

  if (!uri) {
    throw new Error(
      'MongoDB connection string is not configured. Set MONGO_URI, MONGO_URL, MONGODB_URI, or DATABASE_URL in Railway service variables.'
    );
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

export default connectDB;
