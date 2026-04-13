import express from 'express';
import { getAddStudent, getOfficerDashboard, getStudentRecord, getViewStudents, postAddStudent, postApproveClass, postEditModules, postOverrideClassification, postSoftDeleteStudent, postUpdateStudentPersonalDetails } from '../controllers/officerController.js';
import {isOfficer} from '../middleware/middleware.js';
import { getViewOfficers } from '../controllers/adminController.js';

const router = express.Router();

router.get("/", isOfficer, getOfficerDashboard);

router.get("/viewstudents/:programme_id", isOfficer, getViewStudents);

router.get("/viewstudents/:programme_id/:student_id", isOfficer, getStudentRecord);

router.post("/editpersonaldetails/:programme_id/:student_id", isOfficer, postUpdateStudentPersonalDetails);

router.post("/override/:programme_id/:student_id", isOfficer, postOverrideClassification);

router.post("/editmodulemarks/:programme_id/:student_id", isOfficer, postEditModules);

router.post("/approve/:programme_id/:student_id", isOfficer, postApproveClass);

router.post("/delete-student/:programme_id/:student_id", isOfficer, postSoftDeleteStudent);

router.get("/addstudent/:programme_id", isOfficer, getAddStudent);

router.post("/addstudent/:programme_id", isOfficer, postAddStudent);







export default router;