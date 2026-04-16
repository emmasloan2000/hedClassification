import express from 'express';
import { getOfficerDashboardApi, getViewStudentsApi} from '../controllers/officerApiController.js';
import {isOfficer, isAssigned} from '../../web/middleware/middleware.js';
//import { getViewOfficers } from '../controllers/adminController.js';

const router = express.Router();

router.get("/", isOfficer, getOfficerDashboardApi);

router.get("/viewstudents/:programme_id", isOfficer, isAssigned, getViewStudentsApi);









export default router;