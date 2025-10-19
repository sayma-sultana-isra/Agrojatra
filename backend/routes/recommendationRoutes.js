import express from 'express';
import {
  getRecommendations,
  getRecommendationById,
  markRecommendationAsViewed,
  saveRecommendation,
  getSavedRecommendations,
  provideFeedback,
  getRecommendationStats
} from '../controllers/recommendationController.js';
// Correctly import verifyToken
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Use verifyToken instead of authenticate
router.get('/', verifyToken, getRecommendations);
router.get('/saved', verifyToken, getSavedRecommendations);
router.get('/stats', verifyToken, getRecommendationStats);
router.get('/:id', verifyToken, getRecommendationById);
router.put('/:id/view', verifyToken, markRecommendationAsViewed);
router.put('/:id/save', verifyToken, saveRecommendation);
router.post('/:id/feedback', verifyToken, provideFeedback);

export default router;