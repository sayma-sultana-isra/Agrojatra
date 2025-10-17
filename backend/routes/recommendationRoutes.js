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
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getRecommendations);
router.get('/saved', authenticate, getSavedRecommendations);
router.get('/stats', authenticate, getRecommendationStats);
router.get('/:id', authenticate, getRecommendationById);
router.put('/:id/view', authenticate, markRecommendationAsViewed);
router.put('/:id/save', authenticate, saveRecommendation);
router.post('/:id/feedback', authenticate, provideFeedback);

export default router;
