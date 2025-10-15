import express from 'express';
import {
  calculateJobMatches,
  getStudentMatches,
  getJobCandidates,
  getSingleMatch
} from '../controllers/skillMatchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/calculate/:studentId', authMiddleware, calculateJobMatches);
router.get('/student/:studentId', authMiddleware, getStudentMatches);
router.get('/job/:jobId', authMiddleware, getJobCandidates);
router.get('/match/:studentId/:jobId', authMiddleware, getSingleMatch);

export default router;
