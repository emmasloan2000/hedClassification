import * as OfficerModel from '../model/officerModel.js';
import db from '../../config/db.js';
import { calculateClassification } from '../../utils/classification.js';


export const getOfficerDashboard = async (req, res) => {

  try {

    const searchQuery = req.query.search || "";

    const user_id = req.session.user.id;

    const response = await fetch(`http://localhost:4000/api/officer?search=${searchQuery}`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      }
    );

    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("officer.ejs", { myProgrammes: data.myProgrammes || [], currentUser: data.currentUser, currentSearch: data.currentSearch });


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

    const response = await fetch(`http://localhost:4000/api/officer/viewstudents/${programme_id}?search=${searchQuery}&filter=${filterValue}`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      }
    );

    const data = await response.json();
    let studentListForGraph = data.studentList;

    const stats = {
      "First Class Honours": 0,
      "Upper Second Class Honours": 0,
      "Lower Second Class Honours": 0,
      "Third Class Honours": 0,
      "Fail": 0,
      "Pending": 0
    };

    //get rules for the classification logic for graph

    if (studentListForGraph.length > 0) {
      const realId = studentListForGraph[0].id;
      const rulesResponse = await fetch(`http://localhost:4000/api/officer/studentrecord/${programme_id}/${realId}`,
        { headers: { 'Cookie': req.headers.cookie } }
      );
      const rulesData = await rulesResponse.json();
      const rules = rulesData.rules[0];


      studentListForGraph.forEach(student => {
        let classification;

        if (student.final_classification && student.is_manual_override) {
          classification = student.final_classification;
        } else {
          const result = calculateClassification(student.grades || [], rules);
          classification = result.proposedClassification || "Pending";
        }

        if (stats.hasOwnProperty(classification)) {
          stats[classification]++;
        } else {
          stats["Pending"]++;
        }


      });
    }

    res.render("viewstudents.ejs", { programme_id: programme_id, stats: stats, studentList: data.studentList, currentSearch: searchQuery, currentFilter: filterValue });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).send("Communication with API failed");
  }

};




export const getStudentRecord = async (req, res) => {

  const student_id = req.params.student_id;

  const programme_id = req.params.programme_id;

  try {

    const response = await fetch(`http://localhost:4000/api/officer/studentrecord/${programme_id}/${student_id}`,
      {
        headers:
          { 'Cookie': req.headers.cookie }
      });

    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("studentrecord.ejs", { programme_id: programme_id, student_id: student_id, grades: data.grades, rules: data.rules, result: data.result, student: data.student, modules: data.modules });

  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");

  }

};


export const postUpdateStudentPersonalDetails = async (req, res) => {


  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;


  try {

    const response = await fetch(`http://localhost:4000/api/officer/editpersonaldetails/${programme_id}/${student_id}`,
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        body: JSON.stringify(req.body)
      });

    if (!response.ok) throw new Error("API Response Error");

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};


export const postOverrideClassification = async (req, res) => {


  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;

  try {

    const response = await fetch(`http://localhost:4000/api/officer/override/${programme_id}/${student_id}`,
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        body: JSON.stringify(req.body)
      });

    if (!response.ok) throw new Error("API Response Error");

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};



export const postEditModules = async (req, res) => {


  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;

  try {

    const response = await fetch(`http://localhost:4000/api/officer/editmodulemarks/${programme_id}/${student_id}`,
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        body: JSON.stringify(req.body)
      });

    if (!response.ok) throw new Error("API Response Error");

    res.redirect(`/officer/viewstudents/${programme_id}/${student_id}`);

  } catch (error) {
    console.error("Error updating record");
    res.status(500).send("Database error");
  }

};


export const postApproveClass = async (req, res) => {

  const programme_id = req.params.programme_id;
  const student_id = req.params.student_id;


  try {

    const response = await fetch(`http://localhost:4000/api/officer/approve/${programme_id}/${student_id}`,
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        body: JSON.stringify(req.body)
      });

    if (!response.ok) throw new Error("API Response Error");

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

    const response = await fetch(`http://localhost:4000/api/officer/delete-student/${programme_id}/${student_id}`,
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        body: JSON.stringify(req.body)
      });

    if (!response.ok) throw new Error("API Response Error");

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

    const response = await fetch(`http://localhost:4000/api/officer/addstudent/${programme_id}`,
      {
        method: 'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie
        },
        body: JSON.stringify(req.body)
      });

    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.redirect(`/officer/viewstudents/${programme_id}/${data.newStudentId}`);

  } catch (error) {
    res.status(500).send("Database error: " + error.message);
  }

};













