import mongoose from 'mongoose';

const mentorshipSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
});

export default mongoose.model('Mentorship', mentorshipSchema);
