import * as OfficerModel from '../../web/model/officerModel.js';
import { calculateClassification } from '../../utils/classification.js';


export const getOfficerDashboardApi = async (req, res) => {

  try {

    const searchQuery = req.query.search || "";

    const user_id = req.session.user.id;

    //const user_id = 2;

    const currentUser = await OfficerModel.getCurrentUser(user_id);

    const myProgrammes = await OfficerModel.getOfficerProgrammeStats(user_id, searchQuery);

    res.json({ myProgrammes: myProgrammes || [], currentUser: currentUser, currentSearch: searchQuery });


  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");

  }


};



    export const getViewStudentsApi = async (req, res) => {

        try {

        const programme_id = req.params.programme_id;
          const searchQuery = req.query.search || "";
          const filterValue = req.query.filter || "";
        
          const studentList = await OfficerModel.getAllStudentsOnProgramme(programme_id, searchQuery, filterValue);
        
          res.json({programme_id, studentList});
        

        } catch (error) {
    res.status(500).json({ error: "Database fetch failed" });
  }

         
        };


        export const getStudentRecordApi = async (req, res) => {
        
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
        
            res.json( { programme_id: programme_id, student_id: student_id, grades: grades, rules: rules, result: result, student: student, modules: modules });
        
          } catch (error) {
            console.error("Database error", error);
            res.status(500).send("error");
        
          }
        
        };



        export const postUpdateStudentPersonalDetailsApi = async (req, res) => {
        
        
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
        
            res.json({success: true, message: "Record Updated"});
        
          } catch (error) {
            console.error("Error updating record");
            res.status(500).send("Database error");
          }
        
        };


        export const postOverrideClassificationApi = async (req, res) => {
        
        
          const programme_id = req.params.programme_id;
          const student_id = req.params.student_id;
        
          const { action, review_status, classification, manual_override, rationale } = req.body;
        
          try {
        
            if (action === 'save') {
        
              await OfficerModel.getOverrideClassification(review_status, classification, rationale, student_id);
        
            }
        
            res.json({success:true, message: "Record updated"});
        
          } catch (error) {
            console.error("Error updating record");
            res.status(500).send("Database error");
          }
        
        };



        export const postEditModulesApi = async (req, res) => {
        
        
          const programme_id = req.params.programme_id;
          const student_id = req.params.student_id;
        
          let checkboxData = req.body.module_checkbox;
        
          const selectedModules = checkboxData ? (Array.isArray(checkboxData) ? checkboxData : [checkboxData]) : [];
        
          try {
            const programmeModules = await OfficerModel.getProgrammeModules(programme_id);
        
            for (const module of programmeModules) {
        
              const moduleResult = await OfficerModel.getModuleResult(module.module_code);
              if (moduleResult.length > 0) {
                const moduleId = moduleResult[0].id;
                const isChecked = selectedModules.includes(module.module_code);

                if (isChecked){
                const markValue = parseFloat(req.body[`mark_${module.module_code}`])
                const isResit = req.body[`resit_${module.module_code}`] === '1' ? 1 : 0;
                await OfficerModel.getaddGrades(student_id, moduleId, markValue, isResit);
              } else {
                await OfficerModel.removeGrade(student_id, moduleId);
              }
            }
            }
        
            res.json({success: true, message: "Record updated"});
        
          } catch (error) {
            console.error("Error updating record");
            res.status(500).send("Database error");
          }
        
        };


        export const postApproveClassApi = async (req, res) => {
        
          const programme_id = req.params.programme_id;
          const student_id = req.params.student_id;
        
          const { action, review_status, classification, manual_override, rationale } = req.body;
        
          try {
        
            await OfficerModel.getUpdateStatus(student_id);
        
            res.json({success: true, message: "record updated"});
        
          } catch (error) {
            console.error("Error updating record");
            res.status(500).send("Database error");
          }
        
        };


        export const postSoftDeleteStudentApi = async (req, res) => {
        
          const programme_id = req.params.programme_id;
        
          const student_id = req.params.student_id;
        
          try {
        
            await OfficerModel.getSoftDeleteStudent(student_id);
        
            res.json({success: true, message: "Record updated"});
        
          } catch (error) {
            res.status(500).send("Error deleting student");
          }
        };

        

    export const postAddStudentApi = async (req, res) => {
    
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
    
        res.json({success:true, message: "Student Added", newStudentId});
    
      } catch (error) {
        console.error("Database error details: ", error.message);
        res.status(500).send("Database error: " + error.message);
      }
    
    };