import express from 'express';
import { getAlumniDashboardData } from '../controllers/alumniController.js';

const router = express.Router();

router.get('/dashboard/:alumniId', getAlumniDashboardData);

export default router; // <--- THIS LINE is the key fix
