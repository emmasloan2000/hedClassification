

export const getAdminDashboard = async (req, res) => {

  try {


    const response = await fetch(`http://localhost:4000/api/admin`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      }
    );

    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();


    res.render("admin.ejs", { counter: data.counter, pCounter: data.pCounter, unassignedCounter: data.unassignedCounter });


  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");

  }


};

export const getAddOfficer = async (req, res) => {


  try {

    const response = await fetch(`http://localhost:4000/api/admin/addofficer`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      }
    );

    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("addofficer.ejs", { unassignedProgrammes: data.unassignedProgrammes });

  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");
  }

};



export const postAddOfficer = async (req, res) => {


  try {

    const response = await fetch(`http://localhost:4000/api/admin/addofficer`,
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


    res.redirect("/admin");

  } catch (error) {
    console.error("Error adding officer");
    res.status(500).send("Database error");
  }

};


export const getAddProgramme = async (req, res) => {

  try {

    const response = await fetch(`http://localhost:4000/api/admin/addprogramme`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      });
    
    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("addprogramme.ejs", { defaults: data.defaults, officers: data.officers });

  } catch (error) {
    console.error("Error adding officer");
    res.status(500).send("Database error");
  }
};


export const postAddProgramme = async (req, res) => {

  try {

     const response = await fetch(`http://localhost:4000/api/admin/addprogramme`,
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

    res.redirect(`/admin/programmeinfo/${data.newProgrammeId}`);

  } catch (error) {
    console.error("Database error details: ", error.message);
    res.status(500).send("Database error: " + error.message);
  }

};


export const getViewOfficers = async (req, res) => {

  const searchQuery = req.query.search || "";
  const filterValue = req.query.filter || "";

  try {

  const response = await fetch(`http://localhost:4000/api/admin/viewofficers?search=${searchQuery}&filter=${filterValue}`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      });
    
    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("viewofficers", { officers: data.officers, currentSearch: data.currentSearch, currentFilter: data.currentFilter });

  } catch (error) {
    res.status(500).send("Database Error: " + error.message);
  }

};


export const getOfficerInfo = async (req, res) => {

  const user_id = req.params.user_id;

  try {

 const response = await fetch(`http://localhost:4000/api/admin/officerinfo/${user_id}`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      });
    
    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

  res.render("officerinfo", { officer: data.officer, unassignedProgrammes: data.unassignedProgrammes, currentProgrammes: data.currentProgrammes });

  } catch (error) {
    res.status(500).send("Database Error: " + error.message);
  }

};


export const postEditOfficer = async (req, res) => {

  const user_id = req.params.user_id;

  try {
 const response = await fetch(`http://localhost:4000/api/admin/officerinfo/${user_id}`,
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

    res.redirect("/admin/viewofficers");

  } catch (error) {
    console.error("Error updating officer");
    res.status(500).send("Database error");
  }

};


export const getViewProgrammes = async (req, res) => {

  const searchQuery = req.query.search || "";
  const filterValue = req.query.filter || "";

  try {

     const response = await fetch(`http://localhost:4000/api/admin/viewprogrammes`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      });
    
    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("viewprogrammes", { programmes: data.programmes, currentSearch: data.currentSearch, currentFilter: data.currentFilter });

  } catch (error) {
    console.log("Database Error", error.sqlMessage);
    res.status(500).send("Database Error: " + error.sqlMessage);
  }

};


export const getProgrammeInfo = async (req, res) => {

  const programme_id = req.params.programme_id;

  try {

    const response = await fetch(`http://localhost:4000/api/admin/programmeinfo/${programme_id}`,
      {
        headers: {
          'Cookie': req.headers.cookie
        }
      });
    
    if (!response.ok) throw new Error("API Response Error");

    const data = await response.json();

    res.render("programmeinfo", { programme: data.programme, officers: data.officers, modules: data.modules });

  } catch (error) {
    console.log("Database Error", error.sqlMessage);
    res.status(500).send("Database Error: " + error.sqlMessage);
  }

};


export const postEditProgramme = async (req, res) => {

  const programme_id = req.params.programme_id;

  try {

   const response = await fetch(`http://localhost:4000/api/admin/programmeinfo/${programme_id}`,
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

    res.redirect(`/admin/programmeinfo/${programme_id}`);

  } catch (error) {
    console.error("Error updating programme");
    res.status(500).send("Database error: Check inputs carefully");
  }

};


export const postManageModules = async (req, res) => {

  const programme_id = req.params.programme_id;

  try {

 const response = await fetch(`http://localhost:4000/api/admin/managemodules/${programme_id}`,
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

    res.redirect(`/admin/programmeinfo/${programme_id}`);
  } catch (error) {
    console.error("Error updating programme");
    res.status(500).send("Database error");
  }

};










