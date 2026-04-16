import express from 'express';
import { getAddStudent, getOfficerDashboard, getStudentRecord, getViewStudents, postAddStudent, postApproveClass, postEditModules, postOverrideClassification, postSoftDeleteStudent, postUpdateStudentPersonalDetails } from '../controllers/officerController.js';
import {isOfficer, isAssigned} from '../middleware/middleware.js';
import { getViewOfficers } from '../controllers/adminController.js';

const router = express.Router();

router.get("/", isOfficer, getOfficerDashboard);

router.get("/viewstudents/:programme_id", isOfficer, isAssigned, getViewStudents);

router.get("/viewstudents/:programme_id/:student_id", isOfficer, isAssigned, getStudentRecord);

router.post("/editpersonaldetails/:programme_id/:student_id", isOfficer, isAssigned, postUpdateStudentPersonalDetails);

router.post("/override/:programme_id/:student_id", isOfficer, isAssigned, postOverrideClassification);

router.post("/editmodulemarks/:programme_id/:student_id", isOfficer, isAssigned, postEditModules);

router.post("/approve/:programme_id/:student_id", isOfficer, isAssigned, postApproveClass);

router.post("/delete-student/:programme_id/:student_id", isOfficer, isAssigned, postSoftDeleteStudent);

router.get("/addstudent/:programme_id", isOfficer, isAssigned, getAddStudent);

router.post("/addstudent/:programme_id", isOfficer, isAssigned, postAddStudent);







export default router;