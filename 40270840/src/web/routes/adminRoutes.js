import express from 'express';
import {getAddOfficer, getAddProgramme, getAdminDashboard, getOfficerInfo, getProgrammeInfo, getViewOfficers, getViewProgrammes, postAddOfficer, postAddProgramme, postEditOfficer, postEditProgramme, postManageModules} from '../controllers/adminController.js';
import {isAdmin} from '../middleware/middleware.js';

const router = express.Router();

router.get("/", isAdmin, getAdminDashboard);

router.get("/addofficer", isAdmin, getAddOfficer);

router.post("/addofficer", isAdmin, postAddOfficer);

router.get("/addProgramme", isAdmin, getAddProgramme);

router.post("/addProgramme", isAdmin, postAddProgramme);

router.get("/viewofficers", isAdmin, getViewOfficers);

router.get("/officerinfo/:user_id", isAdmin, getOfficerInfo);

router.post("/officerinfo/:user_id", isAdmin, postEditOfficer);

router.get("/viewprogrammes", isAdmin, getViewProgrammes);

router.get("/programmeinfo/:programme_id", isAdmin, getProgrammeInfo);

router.post("/programmeinfo/:programme_id", isAdmin, postEditProgramme);

router.post("/managemodules/:programme_id", isAdmin, postManageModules);



export default router;