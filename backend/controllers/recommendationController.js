import JobRecommendation from '../models/JobRecommendation.js';
import Job from '../models/Job.js';
import User from '../models/user.js';
import Application from '../models/Application.js';
import { calculateJobMatch, rankJobs, filterRelevantJobs } from '../services/jobMatchingService.js';

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, minScore = 40, refresh = false } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (refresh === 'true') {
      await JobRecommendation.deleteMany({ userId });
    }

    let existingRecommendations = await JobRecommendation
      .find({ userId })
      .populate({
        path: 'jobId',
        match: { isActive: true },
        populate: { path: 'employerId', select: 'firstName lastName profile.company' }
      })
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));

    existingRecommendations = existingRecommendations.filter(rec => rec.jobId !== null);

    if (existingRecommendations.length >= parseInt(limit) && refresh !== 'true') {
      return res.json({
        success: true,
        data: existingRecommendations,
        count: existingRecommendations.length
      });
    }

    const activeJobs = await Job.find({ isActive: true })
      .populate('employerId', 'firstName lastName profile.company');

    const appliedJobIds = await Application
      .find({ applicantId: userId })
      .distinct('jobId');

    const jobsToMatch = activeJobs.filter(job =>
      !appliedJobIds.some(id => id.toString() === job._id.toString())
    );

    const recommendations = [];

    for (const job of jobsToMatch) {
      const existingRec = await JobRecommendation.findOne({ userId, jobId: job._id });

      if (!existingRec) {
        const matchResult = calculateJobMatch(user, job);

        if (matchResult.matchScore >= parseInt(minScore)) {
          const recommendation = await JobRecommendation.create({
            userId,
            jobId: job._id,
            matchScore: matchResult.matchScore,
            matchDetails: matchResult.matchDetails
          });

          recommendations.push({
            ...recommendation.toObject(),
            jobId: job
          });
        }
      }
    }

    const allRecommendations = [...existingRecommendations, ...recommendations];
    const rankedRecommendations = rankJobs(allRecommendations).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: rankedRecommendations,
      count: rankedRecommendations.length,
      newRecommendations: recommendations.length
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job recommendations',
      error: error.message
    });
  }
};

export const getRecommendationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recommendation = await JobRecommendation
      .findOne({ _id: id, userId })
      .populate({
        path: 'jobId',
        populate: { path: 'employerId', select: 'firstName lastName profile' }
      });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    if (!recommendation.isViewed) {
      recommendation.isViewed = true;
      await recommendation.save();
    }

    res.json({
      success: true,
      data: recommendation
    });

  } catch (error) {
    console.error('Get recommendation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation',
      error: error.message
    });
  }
};

export const markRecommendationAsViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recommendation = await JobRecommendation.findOneAndUpdate(
      { _id: id, userId },
      { isViewed: true },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation
    });

  } catch (error) {
    console.error('Mark as viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recommendation',
      error: error.message
    });
  }
};

export const saveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isSaved } = req.body;

    const recommendation = await JobRecommendation.findOneAndUpdate(
      { _id: id, userId },
      { isSaved: isSaved !== undefined ? isSaved : true },
      { new: true }
    ).populate({
      path: 'jobId',
      populate: { path: 'employerId', select: 'firstName lastName profile.company' }
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation,
      message: isSaved ? 'Job saved successfully' : 'Job unsaved successfully'
    });

  } catch (error) {
    console.error('Save recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save recommendation',
      error: error.message
    });
  }
};

export const getSavedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedRecommendations = await JobRecommendation
      .find({ userId, isSaved: true })
      .populate({
        path: 'jobId',
        match: { isActive: true },
        populate: { path: 'employerId', select: 'firstName lastName profile.company' }
      })
      .sort({ updatedAt: -1 });

    const validRecommendations = savedRecommendations.filter(rec => rec.jobId !== null);

    res.json({
      success: true,
      data: validRecommendations,
      count: validRecommendations.length
    });

  } catch (error) {
    console.error('Get saved recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved recommendations',
      error: error.message
    });
  }
};

export const provideFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const recommendation = await JobRecommendation.findOneAndUpdate(
      { _id: id, userId },
      { feedbackRating: rating },
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

export const getRecommendationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalRecommendations = await JobRecommendation.countDocuments({ userId });
    const viewedCount = await JobRecommendation.countDocuments({ userId, isViewed: true });
    const savedCount = await JobRecommendation.countDocuments({ userId, isSaved: true });
    const appliedCount = await JobRecommendation.countDocuments({ userId, isApplied: true });

    const avgScore = await JobRecommendation.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalRecommendations,
        viewed: viewedCount,
        saved: savedCount,
        applied: appliedCount,
        averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0
      }
    });

  } catch (error) {
    console.error('Get recommendation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation statistics',
      error: error.message
    });
  }
};
