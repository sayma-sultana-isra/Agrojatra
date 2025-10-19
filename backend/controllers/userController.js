import User from '../models/user.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import CV from '../models/CV.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:userId
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get follower and following counts
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    // Get posts count
    const postsCount = await Post.countDocuments({ author: userId });

    // Check if current user is following this user
    const isFollowing = await Follow.exists({
      follower: currentUserId,
      following: userId
    });

    // Check if user has CV
    const hasCV = await CV.exists({ user: userId });

    res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        followersCount,
        followingCount,
        postsCount,
        isFollowing: !!isFollowing,
        hasCV: !!hasCV
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q, role, university, company } = req.query;
    const currentUserId = req.user.id;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search query
    const searchQuery = {
      _id: { $ne: currentUserId }, // Exclude current user
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'profile.bio': { $regex: q, $options: 'i' } },
        { 'profile.skills': { $in: [new RegExp(q, 'i')] } }
      ]
    };

    // Add filters
    if (role) {
      searchQuery.role = role;
    }
    if (university) {
      searchQuery['profile.university'] = { $regex: university, $options: 'i' };
    }
    if (company) {
      searchQuery['profile.company'] = { $regex: company, $options: 'i' };
    }

    const users = await User.find(searchQuery)
      .select('-password')
      .limit(50);

    // Get follow status for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const isFollowing = await Follow.exists({
          follower: currentUserId,
          following: user._id
        });
        return {
          ...user.toJSON(),
          isFollowing: !!isFollowing
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithFollowStatus
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const alumni = await User.countDocuments({ role: 'alumni' });
    const employers = await User.countDocuments({ role: 'employer' });

    res.status(200).json({
      success: true,
      totalUsers,
      students,
      alumni,
      employers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
