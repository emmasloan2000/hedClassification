import db from '../../config/db.js';

export const getUnassignedProgrammes = async () => {
  const unassignedProgrammesSQL = `SELECT programmes.* FROM programmes
                                  LEFT JOIN user_programmes ON programmes.id = user_programmes.programme_id
                                  WHERE user_programmes.programme_id IS NULL`;

  const [unassignedProgrammes] = await db.query(unassignedProgrammesSQL);
  return unassignedProgrammes;
};

export const getAllClassOfficers = async () => {
      const allClassOfficers = `SELECT id, users.first_name, users.last_name, users.username FROM users WHERE users.role_id = 2`;
        const [officers] = await db.query(allClassOfficers);
        return officers;
}

export const getAllProgrammes = async () => {
       const allProgrammes = `SELECT * FROM programmes`;
        const [programmes] = await db.query(allProgrammes);
        return programmes;
}

export const addOfficer = async (first_name, last_name, username, hashedPass) => {
     const addOfficerSQL = `INSERT INTO users (first_name, last_name, username, password, role_id) VALUES (?, ?, ?, ?, 2)`;
        const params = [first_name, last_name, username, hashedPass];
    
        const [result] = await db.query(addOfficerSQL, params);
        return result.insertId;
}

export const assignProgrammeToUser = async (userId, programmeId) => {
      let insertProgrammeSQL = `INSERT INTO user_programmes (user_id, programme_id, academic_year) SELECT ?, id, academic_year
        FROM programmes WHERE id = ?`;
        return await db.query(insertProgrammeSQL, [userId, programmeId]);
}

export const addprogramme = async (programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight,
      min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed,
      min_compensation_mark, dissertation_min_pass) => {

        const addProgrammeSQL = `INSERT INTO programmes (programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          const [result] = await db.query(addProgrammeSQL, [programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight,
            min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed,
            min_compensation_mark, dissertation_min_pass]);

            return result.insertId;
  
}

export const addProgrammeToUserProgrammes = async (user_id, newProgrammeId, academic_year) => {

    const sql = `INSERT INTO user_programmes (user_id, programme_id, academic_year) VALUES (?, ?, ?)`
      return await db.query(sql, [user_id, newProgrammeId, academic_year]);
}



export const getAllProgrammesWithOfficers = async (searchQuery = "", filterValue = "") => {

  let selectAllProgrammes = `SELECT programmes.id AS id, programmes.programme_name, programmes.award_type, programmes.pathway, programmes.academic_year, programmes.y1_weight, programmes.y2_weight, programmes.y3_weight,
    programmes.min_1st, programmes.min_2_1, programmes.min_2_2, programmes.min_3rd, programmes.max_failed_credits_allowed, 
    programmes.min_compensation_mark, programmes.dissertation_min_pass, users.first_name, users.last_name 
  FROM programmes
  LEFT JOIN user_programmes ON programmes.id = user_programmes.programme_id
  LEFT JOIN users ON user_programmes.user_id = users.id
  WHERE programmes.is_deleted = 0`;

  const params = [];

  if (filterValue === "Unassigned") {
    selectAllProgrammes += " AND user_programmes.user_id IS NULL";
  } else if (filterValue === "Assigned") {
    selectAllProgrammes += ` AND user_programmes.user_id IS NOT NULL`
  }

  if (searchQuery) {
    console.log("Model received search term, adding to SQL...");
    selectAllProgrammes += ` AND (programmes.programme_name LIKE ? OR programmes.award_type LIKE ? OR programmes.academic_year LIKE ?)`;
    const term = `%${searchQuery}%`;
    //% wildcard allows for partial matches
    params.push(term, term, term);
  }

  const [rows] = await db.query(selectAllProgrammes, params);
  return rows;
}



export const getAllOfficersAndTheirProgrammes = async (searchQuery, filterValue) => {

    
      let selectAllOfficers = `SELECT users.id as user_id, users.first_name, users.last_name, users.username, users.password, 
      GROUP_CONCAT(programmes.programme_name SEPARATOR ', ') as assigned_programmes,
      COUNT(user_programmes.programme_id) AS assignment_count 
      FROM users
      LEFT JOIN user_programmes ON users.id = user_programmes.user_id
      LEFT JOIN programmes ON user_programmes.programme_id = programmes.id
      WHERE users.role_id = 2 AND users.is_deleted = 0`;
    
    
      const params = [];
    
      if (searchQuery) {
        selectAllOfficers += ` AND (users.first_name LIKE ? OR users.last_name LIKE ? OR programmes.programme_name LIKE ?)`;
        const term = `%${searchQuery}%`;
        //% wildcard allows for partial matches
        params.push(term, term, term);
      }
    
      selectAllOfficers += ` GROUP BY users.id`;
    
      if (filterValue === "Without Assignments") {
        selectAllOfficers += " HAVING assignment_count = 0";
      } else if (filterValue === "With Assignments") {
        selectAllOfficers += ` HAVING assignment_count > 0`
      }
    
      const [rows] = await db.query(selectAllOfficers, params);
      return rows;

}

export const getCurrentOfficer = async (user_id) => {

      const [info] = await db.query(`SELECT id as user_id, first_name, last_name, username FROM users WHERE id = ? AND role_id = 2`, [user_id]);
    
      return info;
}


export const getCurrentOfficersProgrammes = async (user_id) => {

     const currentProgrammesSQL = `SELECT programmes.id, programmes.programme_name, programmes.award_type, programmes.pathway, programmes.academic_year
      FROM programmes
      JOIN user_programmes ON programmes.id = user_programmes.programme_id
      WHERE user_programmes.user_id = ?`;
    
      const [currentProgrammes] = await db.query(currentProgrammesSQL, user_id);

      return currentProgrammes;
    
}


export const editOfficer = async (id, first_name, last_name, username) => {
    
          let editOfficerSQL = `UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE id = ?`;
          let params = [first_name, last_name, username, id];

           return await db.query(editOfficerSQL, params);
    
      
}


export const editOfficerWithPassword = async (id, first_name, last_name, username, hashedPass) => {

   let editOfficerSQL = `UPDATE users SET first_name = ?, last_name = ?, username = ?, password = ? WHERE id = ?`;
          let params = [first_name, last_name, username,hashedPass, id];

          return await db.query(editOfficerSQL, params);

}


export const updateOfficerAssignments = async (user_id, programme_ids) => {

     await db.query(`DELETE FROM user_programmes WHERE user_id = ?`, [user_id]);
    
          if (programme_ids) {
            const idArray = Array.isArray(programme_ids) ? programme_ids : [programme_ids];
    
            for (let p_id of idArray) {
              await db.query(`INSERT INTO user_programmes (user_id, programme_id, academic_year) SELECT ?, id, academic_year
              FROM programmes WHERE id = ?`, [user_id, p_id]);
            }
    
          }
}


export const softDeleteOfficer = async (user_id) => {

    return await db.query(`UPDATE users SET is_deleted = 1 WHERE id = ?`, [user_id]);

}


export const getProgrammeWithOfficersById = async (id) => {

  const selectProgrammeWithOfficerById = `SELECT programmes.id AS programme_id, programmes.programme_name, programmes.award_type, programmes.pathway, programmes.academic_year, programmes.y1_weight, programmes.y2_weight, programmes.y3_weight,
    programmes.min_1st, programmes.min_2_1, programmes.min_2_2, programmes.min_3rd, programmes.resit_capped, programmes.max_failed_credits_allowed, 
    programmes.min_compensation_mark, programmes.dissertation_min_pass, users.first_name, users.last_name 
  FROM programmes
  LEFT JOIN user_programmes ON programmes.id = user_programmes.programme_id
  LEFT JOIN users ON user_programmes.user_id = users.id
  WHERE programmes.id = ?`;

  const [rows] = await db.query(selectProgrammeWithOfficerById, [id]);
  return rows[0];
}


export const getProgrammeModules = async (programme_id) => {

    const [modules] = await db.query(`SELECT * FROM modules WHERE programme_id = ?`, [programme_id]);
    return modules;

}


export const editProgramme = async (programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped,
              max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass, programme_id) => {
    
         let editProgrammeSQL = `UPDATE programmes SET programme_name = ?, award_type = ?, pathway = ?, academic_year = ?, y1_weight = ?, y2_weight = ?, y3_weight = ?, min_1st = ?, min_2_1 = ?, min_2_2 = ?, min_3rd = ?, resit_capped = ?, 
            max_failed_credits_allowed = ?, min_compensation_mark = ?, dissertation_min_pass = ? WHERE id = ?`;
        
            const params = [programme_name, award_type, pathway, academic_year, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped,
              max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass, programme_id];
        
            return await db.query(editProgrammeSQL, params);
    
      
};



export const updateProgrammeAssignments = async (user_id, programme_id, academic_year) => {

           await db.query(`DELETE FROM user_programmes WHERE programme_id = ?`, [programme_id]);
          
              if (user_id) {
                return await db.query(
                  `INSERT INTO user_programmes (user_id, programme_id, academic_year) VALUES (?, ?, ?)`, [user_id, programme_id, academic_year]);
              }
          
}


export const softDeleteProgramme = async (programme_id) => {

    return await db.query('UPDATE programmes SET is_deleted = 1 WHERE id = ?', [programme_id]);

}


export const updateModules = async (module, programme_id) => {

    return await db.query(`UPDATE modules SET level = ?, module_code = ?, module_name = ?, credits = ?
            WHERE id = ? AND programme_id = ?`, [module.level, module.module_code, module.module_name, module.credits, module.id, programme_id]);

}



export const addModules = async (module, programme_id) => {

          return await db.query(`INSERT INTO modules (level, module_code, module_name, credits, programme_id) VALUES (?, ?, ?, ?, ?)`,
            [module.level, module.module_code, module.module_name, module.credits, programme_id]);
    
}