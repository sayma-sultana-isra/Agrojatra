import express from 'express';
import {
  createCompanyProfile,
  getCompanyProfiles,
  getCompanyProfile,
  updateCompanyProfile,
  deleteCompanyProfile,
  getMyCompanyProfiles
} from '../controllers/companyProfileController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCompanyProfiles);
router.get('/:id', getCompanyProfile);

router.use(protect);

router.post('/', authorize('employer', 'admin'), createCompanyProfile);
router.get('/my/profiles', authorize('employer', 'admin'), getMyCompanyProfiles);
router.put('/:id', authorize('employer', 'admin'), updateCompanyProfile);
router.delete('/:id', authorize('employer', 'admin'), deleteCompanyProfile);

export default router;
