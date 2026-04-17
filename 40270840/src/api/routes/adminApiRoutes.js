import express from 'express';
import { getAddOfficerApi, getAddProgrammeApi, getAdminDashboardApi, getOfficerInfoApi, getProgrammeInfoApi, getViewOfficersApi, getViewProgrammesApi, postAddOfficerApi, postAddProgrammeApi, postEditOfficerApi, postEditProgrammeApi, postManageModulesApi } from '../controllers/adminApiController.js';
import {isAdmin} from '../../web/middleware/middleware.js';

const router = express.Router();

router.get("/", isAdmin, getAdminDashboardApi);

router.get("/addofficer", isAdmin, getAddOfficerApi);

router.post("/addofficer", isAdmin, postAddOfficerApi);

router.get("/addProgramme", isAdmin, getAddProgrammeApi);

router.post("/addProgramme", isAdmin, postAddProgrammeApi);

router.get("/viewofficers", isAdmin, getViewOfficersApi);

router.get("/officerinfo/:user_id", isAdmin, getOfficerInfoApi);

router.post("/officerinfo/:user_id", isAdmin, postEditOfficerApi);

router.get("/viewprogrammes", isAdmin, getViewProgrammesApi);

router.get("/programmeinfo/:programme_id", isAdmin, getProgrammeInfoApi);

router.post("/programmeinfo/:programme_id", isAdmin, postEditProgrammeApi);

router.post("/managemodules/:programme_id", isAdmin, postManageModulesApi);


export default router;