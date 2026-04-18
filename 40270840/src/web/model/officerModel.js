import db from '../../config/db.js';

export const getCurrentUser = async (user_id) => {

     const currentUserSQL = `SELECT * FROM users WHERE id = ?`;
  
      const [currentUserArray] = await db.query(currentUserSQL, [user_id]);
  
      const currentUser = currentUserArray[0];

      return currentUser;
};


export const getOfficerProgrammeStats = async (user_id, searchQuery) => {

      let dashboardSQL = `SELECT programmes.*, COUNT(students.id) AS total_students, 
        SUM(CASE WHEN students.review_status = 'Flagged' THEN 1 ELSE 0 END) AS flagged_students,
        SUM(CASE WHEN students.review_status = 'Approved' THEN 1 ELSE 0 END) AS approved_students,
        SUM(CASE WHEN students.review_status = 'Awaiting Approval' THEN 1 ELSE 0 END) AS awaiting_students
        FROM programmes 
        JOIN user_programmes ON programmes.id = user_programmes.programme_id
        LEFT JOIN students ON programmes.id = students.programme_id
        WHERE user_programmes.user_id = ?`;

        let params = [user_id];
    
        if (searchQuery) {
        dashboardSQL += ` AND (programmes.programme_name LIKE ? OR programmes.award_type LIKE ? OR programmes.academic_year LIKE ?)`;
        const term = `%${searchQuery}%`;
        //% wildcard allows for partial matches
        params.push(term, term, term);
      }
    
       dashboardSQL += ` GROUP BY programmes.id`;
    
       const [myProgrammes] = await db.query(dashboardSQL, params);

       return myProgrammes;
};


export const getAllStudentsOnProgramme = async (programme_id, searchQuery, filterValue) => {

     let getAllStudentsOnProgramme = `SELECT students.*, programmes.programme_name, programmes.award_type, programmes.pathway, programmes.academic_year FROM students
      LEFT JOIN programmes ON students.programme_id = programmes.id
      WHERE students.programme_id = ? AND students.is_deleted = 0`;
    
      let params = [programme_id];
    
      if (filterValue === "Approved") {
        getAllStudentsOnProgramme += ` AND review_status = 'Approved'`
      } else if (filterValue === "Awaiting Approval") {
        getAllStudentsOnProgramme += ` AND review_status = 'Awaiting Approval'`
      } else if (filterValue === "Manual Review Required"){
        getAllStudentsOnProgramme += ` AND review_status = 'Flagged'`;
      }
    
         if (searchQuery) {
        getAllStudentsOnProgramme += ` AND (students.first_name LIKE ? OR students.last_name LIKE ? OR students.student_number LIKE ?)`;
        const term = `%${searchQuery}%`;
        //% wildcard allows for partial matches
        params.push(term, term, term);
      }
    
      const [studentList] = await db.query(getAllStudentsOnProgramme, params);

      return studentList;

}


export const getProgrammeModules = async (programme_id) => {

    const [modules] = await db.query(`SELECT * FROM modules WHERE programme_id = ?`, [programme_id]);

    return modules;

}

export const getStudentGrades = async (student_id) => {

       let gradesSQL = `SELECT students.id AS student_real_id, students.student_number, students.first_name, students.last_name, students.current_level,
      students.mitigating_circumstances, students.cohort_year, students.proposed_classification, students.final_classification,
      students.is_manual_override, students.rationale, students.review_status,
      grades.*, modules.module_code, modules.module_name, modules.credits, modules.level FROM students
      LEFT JOIN grades ON students.id = grades.student_id
      LEFT JOIN modules ON grades.module_id = modules.id
      WHERE students.id = ?`;
    
      const [grades] = await db.query(gradesSQL, [student_id]);

      return grades;

}

//for graph

export const getAllStudentGrades = async (programme_id) => {

       let gradesSQL = `SELECT students.id AS student_real_id, students.student_number, students.first_name, students.last_name,
      students.final_classification,
      JSON_ARRAYAGG(
      JSON_OBJECT(
      'mark', grades.mark,
      'is_resit', grades.is_resit,
      'module_name', modules.module_name,
      'credits', modules.credits,
      'level', modules.level)
      )AS allGrades
      FROM students
      LEFT JOIN grades ON students.id = grades.student_id
      LEFT JOIN modules ON grades.module_id = modules.id
      WHERE students.programme_id = ?
      GROUP BY students.id`;
    
      const [rows] = await db.query(gradesSQL, [programme_id]);

      return rows;

}


export const getProgrammeClassRules = async (programme_id) => {

     let rulesSQL = `SELECT * FROM programmes WHERE programmes.id = ?`;
    
      const [rules] = await db.query(rulesSQL, [programme_id]);

      return rules;

}


export const updateStudentClassification = async (classification, student_id, newStatus) => {

    return await db.query(
  `UPDATE students SET proposed_classification = ?, final_classification = ?, review_status = ? WHERE id = ? AND is_manual_override = 0`, 
  [classification, classification, newStatus, student_id]
);

}


export const updateStudentPersonalDetails = async (student_number, first_name, last_name, currentMc, review_status, student_id) => {

     const editStudentSQL = `UPDATE students SET student_number = ?, first_name = ?, last_name = ?, mitigating_circumstances = ?, review_status = ? WHERE id = ?`;

     return await db.query(editStudentSQL, [student_number, first_name, last_name, currentMc, review_status, student_id]);

}


export const getOverrideClassification = async (review_status, classification, rationale, student_id) => {

      let editStudentSQL = `UPDATE students SET review_status = ?, final_classification = ?, is_manual_override = 1, rationale = ? WHERE id = ?`;
          let params = [review_status, classification, rationale, student_id];
    
          return await db.query(editStudentSQL, params);

}


export const getModuleResult = async (moduleCode) => {

     const [moduleResult] = await db.query(`SELECT id FROM modules WHERE module_code = ?`, [moduleCode]);

     return moduleResult;

}


export const getaddGrades = async (student_id, moduleId, markValue, isResit) => {

     const marksSQL = `INSERT INTO grades (student_id, module_id, mark, is_resit) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE mark = VALUES(mark), is_resit = VALUES(is_resit)`;
          
          return await db.query(marksSQL, [student_id, moduleId, markValue, isResit])

}

export const removeGrade = async (student_id, module_id) => {
  const deleteGradeSQL = `DELETE FROM grades WHERE student_id = ? AND module_id = ?`;
  return await db.query(deleteGradeSQL, [student_id, module_id]);
};


export const getUpdateStatus = async (student_id) => {

     const editStudentSQL = `UPDATE students SET review_status = 'Approved' WHERE id = ?`;
      return await db.query(editStudentSQL, [student_id]);

}


export const getSoftDeleteStudent = async (student_id) => {

     return await db.query("UPDATE students SET is_deleted = 1 WHERE id = ?", [student_id]);

}


export const getCohortYear = async (programme_id) => {

    const [cohortYears] = await db.query(`SELECT academic_year FROM programmes WHERE id = ?`, [programme_id])
    
    const cohortYear = cohortYears[0].academic_year;

    return cohortYear;

}


export const getAddStudent = async (student_number, first_name, last_name, current_level, programme_id, mc, cohortYear) => {


        const params = [student_number, first_name, last_name, current_level, programme_id, mc, cohortYear];
    
        const addStudentSQL = `INSERT INTO students (student_number, first_name, last_name, current_level, programme_id, 
        mitigating_circumstances, cohort_year, proposed_classification, final_classification, is_manual_override, rationale, review_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, NULL, NULL)`;
    
        const [result] = await db.query(addStudentSQL, params);
    
        const newStudentId = result.insertId;

        return newStudentId;

}