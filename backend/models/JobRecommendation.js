import mongoose from 'mongoose';

const jobRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchDetails: {
    skillMatch: {
      score: Number,
      matchedSkills: [String],
      totalSkills: Number
    },
    experienceMatch: {
      score: Number,
      userExperience: String,
      requiredExperience: String
    },
    locationMatch: {
      score: Number,
      matched: Boolean
    }
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  isApplied: {
    type: Boolean,
    default: false
  },
  isSaved: {
    type: Boolean,
    default: false
  },
  feedbackRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

jobRecommendationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
jobRecommendationSchema.index({ userId: 1, matchScore: -1 });

export default mongoose.model('JobRecommendation', jobRecommendationSchema);
