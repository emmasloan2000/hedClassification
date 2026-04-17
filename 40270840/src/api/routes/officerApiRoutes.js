import express from 'express';
import { getViewStudentsApi, getOfficerDashboardApi, getStudentRecordApi, postUpdateStudentPersonalDetailsApi, postOverrideClassificationApi, postEditModulesApi, postApproveClassApi, postSoftDeleteStudentApi, postAddStudentApi} from '../controllers/officerApiController.js';
import {isOfficer, isAssigned} from '../../web/middleware/middleware.js';


const router = express.Router();

router.get("", isOfficer, getOfficerDashboardApi);

router.get("/viewstudents/:programme_id", isOfficer, isAssigned, getViewStudentsApi);

router.get("/studentrecord/:programme_id/:student_id", isOfficer, isAssigned, getStudentRecordApi);

router.post("/editpersonaldetails/:programme_id/:student_id", isOfficer, isAssigned, postUpdateStudentPersonalDetailsApi);

router.post("/override/:programme_id/:student_id", isOfficer, isAssigned, postOverrideClassificationApi);

router.post("/editmodulemarks/:programme_id/:student_id", isOfficer, isAssigned, postEditModulesApi);

router.post("/approve/:programme_id/:student_id", isOfficer, isAssigned, postApproveClassApi);

router.post("/delete-student/:programme_id/:student_id", isOfficer, isAssigned, postSoftDeleteStudentApi);

router.post("/addstudent/:programme_id", isOfficer, isAssigned, postAddStudentApi);






export default router;