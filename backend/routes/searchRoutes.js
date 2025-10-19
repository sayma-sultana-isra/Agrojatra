import express from 'express';
import {
  unifiedSearch,
  searchByRole,
  searchCompanies
} from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/unified', unifiedSearch);
router.get('/users/:role', searchByRole);
router.get('/companies', searchCompanies);

export default router;
