import * as OfficerModel from '../model/officerModel.js';
import db from '../../config/db.js';
import { calculateClassification } from '../../utils/classification.js';


export const getOfficerDashboard = async (req, res) => {

  try {

    const searchQuery = req.query.search || "";

    const user_id = req.session.user.id;

    const currentUser = await OfficerModel.getCurrentUser(user_id);

    const myProgrammes = await OfficerModel.getOfficerProgrammeStats(user_id);

    res.render("officer.ejs", { myProgrammes: myProgrammes || [], currentUser: currentUser, currentSearch: searchQuery });


  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");

  }


};


export const getViewStudents = async (req, res) => {

  const programme_id = req.params.programme_id;
  const searchQuery = req.query.search || "";
  const filterValue = req.query.filter || "";

  try {

    const apiUrl = `http://localhost:4000/api/viewstudents/${programme_id}?search=${searchQuery}&filter=${filterValue}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    res.render("viewstudents.ejs", { programme_id: programme_id, studentList: data.studentList, currentSearch: searchQuery, currentFilter: filterValue });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).send("Communication with API failed");
  }

};




export const getStudentRecord = async (req, res) => {

  const student_id = req.params.student_id;

  const programme_id = req.params.programme_id;

  try {

    const modules = await OfficerModel.getProgrammeModules(programme_id);

    const grades = await OfficerModel.getStudentGrades(student_id);

    const student = grades[0];

    const rules = await OfficerModel.getProgrammeClassRules(programme_id);

    const result = calculateClassification(grades, rules[0]);

    const classification = result.proposedClassification || "Pending";

    const hasMC = student.mitigating_circumstances === 1 || student.mitigating_circumstances === true;

    let newStatus = student.review_status;

    if ((result.isBorderline || hasMC) && student.review_status !== 'Approved') {
      newStatus = 'Flagged';
    }

    await OfficerModel.updateStudentClassification(classification, student_id, newStatus);

    student.review_status = newStatus;

    if (student.is_manual_override === 0) {
      student.proposed_classification = classification;
      student.final_classification = classification;
    }

    res.render("studentrecord.ejs", { programme_id: programme_id, student_id: student_id, grades: grades, rules: rules, result: result, student: student, modules: modules });

  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");

  }

};


export const postUpdateStudentPersonalDetails = async (req, res) => {


  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;

  const { action, student_number, first_name, last_name, mitigating_circumstances } = req.body;

  try {

    if (action === 'save') {

      const currentMc = (mitigating_circumstances === '1' || mitigating_circumstances === 'Yes') ? 1 : 0;

      let review_status;

      if (currentMc === 1) {
        review_status = 'Flagged';

      } else {
        review_status = 'Awaiting Approval';

      }

      await OfficerModel.updateStudentPersonalDetails(student_number, first_name, last_name, currentMc, review_status, student_id);

    }

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};


export const postOverrideClassification = async (req, res) => {


  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;

  const { action, review_status, classification, manual_override, rationale } = req.body;

  try {

    if (action === 'save') {

      await OfficerModel.getOverrideClassification(review_status, classification, rationale, student_id);

    }

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};



export const postEditModules = async (req, res) => {


  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;

  let checkboxData = req.body.module_checkbox;

  let selectedModules = [];
  if (checkboxData) {
    selectedModules = Array.isArray(checkboxData) ? checkboxData : [checkboxData];
  }

  try {

    for (const moduleCode of selectedModules) {

      const moduleResult = await OfficerModel.getModuleResult(moduleCode);
      if (moduleResult.length > 0) {
        const moduleId = moduleResult[0].id;
        const markValue = parseFloat(req.body[`mark_${moduleCode}`])
        const isResit = req.body[`resit_${moduleCode}`] === '1' ? 1 : 0;


        await OfficerModel.getaddGrades(student_id, moduleId, markValue, isResit);
      }



    }

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};


export const postApproveClass = async (req, res) => {

  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;

  const { action, review_status, classification, manual_override, rationale } = req.body;

  try {

    await OfficerModel.getUpdateStatus(student_id);

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};


export const postSoftDeleteStudent = async (req, res) => {

  const programme_id = req.params.programme_id;

  const student_id = req.params.student_id;

  try {

    await OfficerModel.getSoftDeleteStudent(student_id);

    res.redirect(`/officer/viewstudents/${programme_id}`);

  } catch (error) {
    res.status(500).send("Error deleting student");
  }
};



export const getAddStudent = async (req, res) => {

  const programme_id = req.params.programme_id;

  res.render("addstudent.ejs", { programme_id });

};



export const postAddStudent = async (req, res) => {

  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;


  try {

    const { student_number, first_name, last_name, current_level, mitigating_circumstances
    } = req.body;

    const cohortYear = await OfficerModel.getCohortYear(programme_id);

    let mc = 0;

    if (mitigating_circumstances === 'Yes') {
      mc = 1;
    }

    const newStudentId = await OfficerModel.getAddStudent(student_number, first_name, last_name, current_level, programme_id, mc, cohortYear);

    res.redirect(`/officer/viewstudents/${programme_id}/${newStudentId}`);

  } catch (error) {
    console.error("Database error details: ", error.message);
    res.status(500).send("Database error: " + error.message);
  }

};













