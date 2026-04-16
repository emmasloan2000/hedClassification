import * as OfficerModel from '../../web/model/officerModel.js';


export const getOfficerDashboardApi = async (req, res) => {

  try {

    const searchQuery = req.query.search || "";

    const user_id = req.session.user.id;

    const currentUser = await OfficerModel.getCurrentUser(user_id);

    const myProgrammes = await OfficerModel.getOfficerProgrammeStats(user_id);

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