import * as AdminModel from '../../web/model/adminModel.js';
import bcrypt from 'bcrypt';


export const getAdminDashboardApi = async (req, res) => {

    try {


        const officers = await AdminModel.getAllClassOfficers();

        const counter = officers.length;

        const programmes = await AdminModel.getAllProgrammes();

        const pCounter = programmes.length;

        const unassigned = await AdminModel.getUnassignedProgrammes();

        const unassignedCounter = unassigned.length;


        res.json({ counter, pCounter, unassignedCounter });


    } catch (error) {
        console.error("Database error", error);
        res.status(500).json({success: false, message: "Database error"});

    }
};


export const getAddOfficerApi = async (req, res) => {


    try {

        const unassignedProgrammes = await AdminModel.getUnassignedProgrammes();

        res.json({ unassignedProgrammes });

    } catch (error) {
        console.error("Database error", error);
        res.status(500).json({success: false, message: "Database error"});
    }

};


export const postAddOfficerApi = async (req, res) => {

    const { first_name, last_name, username, password, programme_ids } = req.body;

    try {

        const hashedPass = await bcrypt.hash(password, 10);

        const insertId = await AdminModel.addOfficer(first_name, last_name, username, hashedPass)

        if (programme_ids) {
            const idArray = Array.isArray(programme_ids) ? programme_ids : [programme_ids];

            for (let p_id of idArray) {
                await AdminModel.assignProgrammeToUser(insertId, p_id);
            }

        }

        res.json({ success: true, message: "Added officer" });

    } catch (error) {
        console.error("Error adding officer");
        res.status(500).json({success: false, message: "Database error"});
    }

};


export const getAddProgrammeApi = async (req, res) => {

    const officers = await AdminModel.getAllClassOfficers();


    const baseRules = {
        y1_weight: 0.00,
        y2_weight: 0.30,
        y3_weight: 0.70,
        min_1st: 70,
        min_2_1: 60,
        min_2_2: 50,
        min_3rd: 40,
        resit_capped: true,
        max_failed_credits_allowed: 0,
        min_compensation_mark: 40,
        dissertation_min_pass: 40
    };

    res.json({ defaults: baseRules, officers });
};


export const postAddProgrammeApi = async (req, res) => {

    try {

        const { programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight,
            min_1st, min_2_1, min_2_2, min_3rd, max_failed_credits_allowed,
            min_compensation_mark, dissertation_min_pass, user_id
        } = req.body;

        //Handles weight values that don't total 1. Math.abs bc potential rounding issues.
        const totalWeight = parseFloat(y1_weight) + parseFloat(y2_weight) + parseFloat(y3_weight);
        const difference = totalWeight - 1.0;
        if (Math.abs(difference) > 0.001) {
            return res.status(400).send("Error. Yearly weighting must sum to 1.0")
        }

        const resit_capped = req.body.resit_capped ? 1 : 0;

        const newProgrammeId = await AdminModel.addprogramme(programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight,
            min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed,
            min_compensation_mark, dissertation_min_pass);


        if (user_id) {

            await AdminModel.addProgrammeToUserProgrammes(user_id, newProgrammeId, academic_year);

        }

        res.json({ success: true, message: "Programme added", newProgrammeId });

    } catch (error) {
        console.error("Database error details: ", error.message);
        res.status(500).json({success: false, message: "Database error"});
    }

};


export const getViewOfficersApi = async (req, res) => {

    const searchQuery = req.query.search || "";
    const filterValue = req.query.filter || "";

    try {

        const officers = await AdminModel.getAllOfficersAndTheirProgrammes(searchQuery, filterValue);

        res.json({ officers, currentSearch: searchQuery, currentFilter: filterValue });

    } catch (error) {
        res.status(500).json({success: false, message: "Database error"});
    }

};


export const getOfficerInfoApi = async (req, res) => {

    try {

        const user_id = req.params.user_id;

        const info = await AdminModel.getCurrentOfficer(user_id);

        const officer = info[0] || {};

        const currentProgrammes = await AdminModel.getCurrentOfficersProgrammes(user_id);

        const unassignedProgrammes = await AdminModel.getUnassignedProgrammes();

        res.json({ officer, unassignedProgrammes, currentProgrammes });

    } catch (error) {
        res.status(500).json({success: false, message: "Database error"});
    }

};


export const postEditOfficerApi = async (req, res) => {

  const user_id = req.params.user_id;
  const { action, first_name, last_name, username, password, programme_ids } = req.body;

  try {

    if (action === 'save') {

      if (password && password.trim() != "") {

        const hashedPass = await bcrypt.hash(password, 10);

        await AdminModel.editOfficerWithPassword(user_id, first_name, last_name, username, hashedPass);

      } else {

        await AdminModel.editOfficer(user_id, first_name, last_name, username);

      }

      await AdminModel.updateOfficerAssignments(user_id, programme_ids);

    } else if (action === 'delete') {

      await AdminModel.softDeleteOfficer(user_id);

    }

    res.json({success:true, message: "Officer edited"});

  } catch (error) {
    console.error("Error updating officer");
    res.status(500).json({success: false, message: "Database error"});
  }

};


export const getViewProgrammesApi = async (req, res) => {

  const searchQuery = req.query.search || "";
  const filterValue = req.query.filter || "";

  try {

    const programmes = await AdminModel.getAllProgrammesWithOfficers(searchQuery, filterValue);

    res.json({ programmes, currentSearch: searchQuery, currentFilter: filterValue });

  } catch (error) {
    console.log("Database Error", error.sqlMessage);
    res.status(500).json({success: false, message: "Database error"});
  }

};



export const getProgrammeInfoApi = async (req, res) => {

  const programme_id = req.params.programme_id;

  try {

    const modules = await AdminModel.getProgrammeModules(programme_id);

    const officers = await AdminModel.getAllClassOfficers();

    const programme = await AdminModel.getProgrammeWithOfficersById(programme_id);

    if (!programme) {
      return res.status(404).send("Not found");
    }

    res.json({ programme, officers, modules });

  } catch (error) {
    console.log("Database Error", error.sqlMessage);
    res.status(500).json({success: false, message: "Database error"});
  }

};


export const postEditProgrammeApi = async (req, res) => {


  const programme_id = req.params.programme_id;
  const { action, programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd,
    max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass, user_id } = req.body;

  try {

    if (action === 'save') {

      const totalWeight = parseFloat(y1_weight) + parseFloat(y2_weight) + parseFloat(y3_weight);
      const difference = totalWeight - 1.0;

      if (Math.abs(difference) > 0.001) {
        return res.status(400).send("Error. Yearly weighting must sum to 1.0")
      }

      const resit_capped = req.body.resit_capped ? 1 : 0;

      await AdminModel.editProgramme(programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd,
        resit_capped, max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass, programme_id);

      await AdminModel.updateProgrammeAssignments(user_id, programme_id, academic_year);


    } else if (action === 'delete') {

      await AdminModel.softDeleteProgramme(programme_id);

    }

    res.json({success: true, message: "Programme updated"});

  } catch (error) {
    console.error("Full Error Details:", error);
    res.status(500).json({success: false, message: "Database error"});

}};



export const postManageModulesApi = async (req, res) => {

    const programme_id = req.params.programme_id;

  try {

    const ids = req.body.module_id;
    const levels = req.body.level;
    const codes = req.body.module_code;
    const names = req.body.module_name;
    const credits = req.body.credits;

    const modulesToSave = codes.map((code, index) => {

      return {
        id: ids[index],
        level: levels[index],
        module_code: code,
        module_name: names[index],
        credits: credits[index]
      };
    })

      .filter(module => module.module_code && module.module_code.trim() != "");

    for (const module of modulesToSave) {
      if (module.id && module.id !== '') {

        await AdminModel.updateModules(module, programme_id);

      } else {

        await AdminModel.addModules(module, programme_id);

      }

    }

    res.json({success:true, message: "Modules updated"});
  } catch (error) {
    console.error("Error updating programme");
    res.status(500).json({success: false, message: "Database error"});
  }

};