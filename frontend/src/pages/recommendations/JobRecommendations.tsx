import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

interface MatchDetails {
  skillMatch: {
    score: number;
    matchedSkills: string[];
    totalSkills: number;
  };
  experienceMatch: {
    score: number;
    userExperience: string;
    requiredExperience: string;
  };
  locationMatch: {
    score: number;
    matched: boolean;
  };
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  description: string;
  employerId: {
    firstName: string;
    lastName: string;
    profile?: {
      company?: string;
    };
  };
}

interface Recommendation {
  _id: string;
  jobId: Job;
  matchScore: number;
  matchDetails: MatchDetails;
  isViewed: boolean;
  isSaved: boolean;
  createdAt: string;
}

const JobRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');

  const fetchRecommendations = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const endpoint = activeTab === 'saved'
        ? '/api/recommendations/saved'
        : `/api/recommendations?limit=20&minScore=40&refresh=${refresh}`;

      const response = await axios.get(`http://localhost:8080${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setRecommendations(response.data.data);

      if (refresh && response.data.newRecommendations > 0) {
        toast.success(`Found ${response.data.newRecommendations} new recommendations!`);
      }
    } catch (error: any) {
      console.error('Fetch recommendations error:', error);
      toast.error(error.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeTab]);

  const handleRefresh = () => {
    fetchRecommendations(true);
  };

  const handleSaveJob = async (recId: string, currentSaveState: boolean) => {
    try {
      await axios.put(
        `http://localhost:8080/api/recommendations/${recId}/save`,
        { isSaved: !currentSaveState },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setRecommendations(prev =>
        prev.map(rec =>
          rec._id === recId ? { ...rec, isSaved: !currentSaveState } : rec
        )
      );

      toast.success(!currentSaveState ? 'Job saved!' : 'Job unsaved!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleViewJob = async (recId: string, jobId: string) => {
    try {
      await axios.put(
        `http://localhost:8080/api/recommendations/${recId}/view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }

    navigate(`/jobs/${jobId}`);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Recommendations</h1>
              <p className="text-gray-600 mt-2">
                Jobs matched to your skills and profile
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
            </button>
          </div>

          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Recommendations
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'saved'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Jobs
            </button>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No recommendations found</h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'saved'
                ? "You haven't saved any jobs yet"
                : 'Update your profile with skills and preferences to get personalized recommendations'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchScoreColor(
                          rec.matchScore
                        )}`}
                      >
                        {rec.matchScore}% Match
                      </span>
                      <span className="text-sm text-gray-600">
                        {getMatchLabel(rec.matchScore)}
                      </span>
                      {!rec.isViewed && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {rec.jobId.title}
                    </h3>

                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {rec.jobId.employerId?.profile?.company || rec.jobId.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {rec.jobId.location}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {rec.jobId.type}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Match Details:</h4>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Skills: </span>
                          <span className="font-medium text-gray-900">
                            {rec.matchDetails.skillMatch.matchedSkills.length}/
                            {rec.matchDetails.skillMatch.totalSkills} matched
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Experience: </span>
                          <span className="font-medium text-gray-900">
                            {rec.matchDetails.experienceMatch.score}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location: </span>
                          <span className="font-medium text-gray-900">
                            {rec.matchDetails.locationMatch.matched ? 'Match' : 'Different'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {rec.matchDetails.skillMatch.matchedSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Matched Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.matchDetails.skillMatch.matchedSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSaveJob(rec._id, rec.isSaved)}
                    className="ml-4"
                  >
                    <svg
                      className={`w-6 h-6 ${
                        rec.isSaved
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      fill={rec.isSaved ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleViewJob(rec._id, rec.jobId._id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobRecommendations;
