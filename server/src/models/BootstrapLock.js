import mongoose from 'mongoose';

const bootstrapLockSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const BootstrapLock = mongoose.model('BootstrapLock', bootstrapLockSchema);

export default BootstrapLock;
