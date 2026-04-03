import express from "express";
import session from 'express-session';
import path from "path";
import bcrypt from 'bcrypt';
import { fileURLToPath } from "url";
import db from '../config/db.js';
import MySQLStoreFactory from 'express-mysql-session';


const MySQLStore = MySQLStoreFactory(session);
const app = express();
const PORT = 3000;
const sessionStore = new MySQLStore({}, db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//add session middleware later
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'thisisasecret',
  store: sessionStore,
  saveUninitialized: false,
  resave: false,
  cookie: { secure: false }
})
);

//global route protection
app.use((req, res, next) => {
  console.log(`Checking Access for: ${req.path}`);
  if (req.path === "/" || req.path === "/login"){
    return next();
  }

  if (req.path.includes('.')) return next();

  if (req.session.user){
    console.log(`User ${req.session.user.username} is authorized for ${req.path}`);
    return next();
  }
  console.log(`!!! Unauthorized access to ${req.path}. Redirecting to login.`);
  res.redirect("/");
});

const isAdmin = (req, res, next) => {
  console.log(req.session);
  if (req.session.user && req.session.user.role_id === 1){
    next();
  } else {
    res.redirect("/");
  }
};

const isOfficer = (req, res, next) => {
  if (req.session.user && req.session.user.role_id === 2){
    next();
  } else {
    res.redirect("/");
  }
};

app.get("/", (req, res) => {

  res.render("login.ejs");
});


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});


app.post("/login", async (req, res) => {

  const { userF, passF } = req.body;

  try {
    const checkUser = `SELECT * FROM users WHERE username = ?`;
    const [rows] = await db.query(checkUser, [userF]);
    if (rows.length === 0) {
      return res.send("User not found");

    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(passF, user.password);
    const userRole = user.role_id;

    if (isMatch) {
      req.session.user = { id: user.id, username: user.username, role_id: user.role_id }
      req.session.save((err) => {

         if (userRole === 1) {
        console.log("redirecting to admin")
        res.redirect("/admin");
      } else {
        res.redirect("/officer");
      }
      });

    } else {
      res.send("Password incorrect");
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }

});

async function getUnassignedProgrammes() {
   const unassignedProgrammesSQL = `SELECT programmes.* FROM programmes
                                  LEFT JOIN user_programmes ON programmes.id = user_programmes.programme_id
                                  WHERE user_programmes.programme_id IS NULL`;

    const [unassignedProgrammes] = await db.query(unassignedProgrammesSQL);
    return unassignedProgrammes;
}


app.get("/admin", isAdmin, async (req, res) => {

  try {
    
    const allClassOfficers = `SELECT * FROM users WHERE users.role_id = 2`;
    const [officers] = await db.query(allClassOfficers);

    const counter = officers.length;

    const allProgrammes = `SELECT * FROM programmes`;
    const [programmes] = await db.query(allProgrammes);

    const pCounter = programmes.length;

    const unassigned = await getUnassignedProgrammes();

    const unassignedCounter = unassigned.length;

    
    res.render("admin.ejs", { counter, pCounter, unassignedCounter });

    
  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");
    
  }


});


app.get("/officer", isOfficer, (req, res) => {

  
    res.render("officer.ejs");
 
  
});


app.get("/admin/addofficer", isAdmin, async (req, res) => {

  try {

    const unassignedProgrammes = await getUnassignedProgrammes();

  res.render("addofficer.ejs", {unassignedProgrammes});
    
  } catch (error) {
    console.error("Database error", error);
    res.status(500).send("error");
  }

});



app.post("/admin/addofficer", isAdmin, async (req,res) => {
  const { first_name, last_name, username, password, programme_ids } = req.body;

  try {
    
  const hashedPass = await bcrypt.hash(password, 10);

  const addOfficerSQL = `INSERT INTO users (fisrt_name, last_name, username, password, role_id) VALUES (?, ?, ?, ?, 2)`;
  const params = [first_name, last_name, username, hashedPass];

  const [result] = await db.query(addOfficerSQL, params); 
  const insertId = result.insertId;

  if (programme_ids){
    const idArray = Array.isArray(programme_ids) ? programme_ids : [programme_ids];

    for (let p_id of idArray){
    let insertProgrammeSQL = `INSERT INTO user_programmes (user_id, programme_id) VALUES (?, ?)`;
    await db.query(insertProgrammeSQL, [insertId, p_id]);
  }

  }

  res.redirect("/admin");

   } catch (error) {
    console.error("Error adding officer");
    res.status(500).send("Database error");
  }

});



app.get("/admin/addprogramme", isAdmin, (req, res) => {

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

  res.render("addprogramme.ejs", { defaults: baseRules });
});



app.post("/admin/addprogramme", isAdmin, async (req,res) => {

  try {

  const { programme_name, y1_weight, y2_weight, y3_weight,
    min_1st, min_2_1, min_2_2, min_3rd, max_failed_credits_allowed, 
    min_compensation_mark, dissertation_min_pass
   } = req.body;

   //Handles weight values that don't total 1. Math.abs bc potential rounding issues.
   const totalWeight = parseFloat(y1_weight)+parseFloat(y2_weight)+ parseFloat(y3_weight);
   const difference = totalWeight - 1.0;
   if (Math.abs(difference) > 0.001){
    return res.status(400).send("Error. Yearly weighting must sum to 1.0")
   }

   const resit_capped = req.body.resit_capped ? 1:0;

  const addProgrammeSQL = `INSERT INTO programmes (programme_name, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [programme_name, y1_weight, y2_weight, y3_weight,
    min_1st, min_2_1, min_2_2, min_3rd, resit_capped, max_failed_credits_allowed, 
    min_compensation_mark, dissertation_min_pass];

  const [result] = await db.query(addProgrammeSQL, params); 

  res.redirect("/admin");

   } catch (error) {
    console.error("Error adding programme");
    res.status(500).send("Database error");
  }

});



app.get("/admin/viewofficers", isAdmin, async (req, res) => {

  const searchQuery = req.query.search || "";

  let selectAllOfficers = `SELECT users.id as user_id, users.first_name, users.last_name, users.username, users.password, 
  GROUP_CONCAT(programmes.programme_name SEPARATOR ', ') as assigned_programmes 
  FROM users
  LEFT JOIN user_programmes ON users.id = user_programmes.user_id
  LEFT JOIN programmes ON user_programmes.programme_id = programmes.id
  WHERE users.role_id = 2`;


  const params = [];

  if (searchQuery){
    selectAllOfficers += ` AND (users.first_name LIKE ? OR users.last_name LIKE ? OR programmes.programme_name LIKE ?)`;
    const term = `%${searchQuery}%`;
    //% wildcard allows for partial matches
    params.push(term, term, term);
  }

  selectAllOfficers += ` GROUP BY users.id`;

  try {
     const [officers] = await db.query(selectAllOfficers, params);
     console.log("Officers Data:", officers);
  res.render("viewofficers", { officers, searchQuery });
  } catch (error) {
    console.log("FULL SQL ERROR:", error.sqlMessage); 
    res.status(500).send("Database Error: " + error.sqlMessage);
  }

});



app.get("/admin/officerinfo/:user_id", isAdmin, async (req, res) => {

  const user_id = req.params.user_id;

  const [info] = await db.query(`SELECT id as user_id, first_name, last_name, username FROM users WHERE id = ? AND role_id = 2`, [user_id]);
  
  const officer = info[0] || {};
  
  const currentProgrammesSQL = `SELECT programmes.id, programmes.programme_name
  FROM programmes
  JOIN user_programmes ON programmes.id = user_programmes.programme_id
  WHERE user_programmes.user_id = ?`;

  const [currentProgrammes] = await db.query(currentProgrammesSQL, [user_id]);

  const unassignedProgrammes = await getUnassignedProgrammes();

  res.render("officerinfo", { officer, unassignedProgrammes, currentProgrammes});

});



app.post("/admin/officerinfo/:user_id", isAdmin, async (req,res) => {

  const user_id = req.params.user_id;
  const { first_name, last_name, username, password, programme_ids } = req.body;

  try{

  let editOfficerSQL = `UPDATE users SET first_name = ?, last_name = ?, username = ?`;
  let params = [first_name, last_name, username];

  if (password && password.trim() != ""){

    const hashedPass = await bcrypt.hash(password, 10);
    editOfficerSQL += `, password = ?`;
    params.push(hashedPass);

  } 

  editOfficerSQL += ` WHERE id = ?`;
  params.push(user_id);

  await db.query(editOfficerSQL, params);

  await db.query(`DELETE FROM user_programmes WHERE user_id = ?`, [user_id]);

   if (programme_ids){
    const idArray = Array.isArray(programme_ids) ? programme_ids : [programme_ids];

    for (let p_id of idArray){
    await db.query(`INSERT INTO user_programmes (user_id, programme_id) VALUES (?, ?)`, [user_id, p_id]);
  }

  }

  res.redirect("/admin/viewofficers");

   } catch (error) {
    console.error("Error updating officer");
    res.status(500).send("Database error");
  }

});


app.get("/admin/viewprogrammes", isAdmin, async (req, res) => {

  const searchQuery = req.query.search || "";

  let selectAllProgrammes = `SELECT * FROM programmes WHERE 1 = 1`;


  const params = [];

  if (searchQuery){
    selectAllProgrammes += ` AND (programmes.programme_name LIKE ?)`;
    const term = `%${searchQuery}%`;
    //% wildcard allows for partial matches
    params.push(term);
  }

  try {
     const [programmes] = await db.query(selectAllProgrammes, params);
     console.log("Programmes Data:", programmes);
  res.render("viewprogrammes", { programmes, searchQuery });
  } catch (error) {
    console.log("FULL SQL ERROR:", error.sqlMessage); 
    res.status(500).send("Database Error: " + error.sqlMessage);
  }

});


app.get("/admin/programmeinfo/:programme_id", isAdmin, async (req, res) => {

  const programme_id = req.params.programme_id;

  const [programmeinfo] = await db.query(`SELECT * FROM programmes WHERE id = ?`, [programme_id]);
  
  const programme = programmeinfo[0] || {};

  res.render("programmeinfo", { programme });

});


app.post("/admin/programmeinfo/:programme_id", isAdmin, async (req,res) => {

  const programme_id = req.params.programme_id;
  const { programme_name, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped, 
    max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass } = req.body;

  try{

   const totalWeight = parseFloat(y1_weight)+parseFloat(y2_weight)+ parseFloat(y3_weight);
   const difference = totalWeight - 1.0;

   if (Math.abs(difference) > 0.001){
    return res.status(400).send("Error. Yearly weighting must sum to 1.0")
   }

   const resit_capped = req.body.resit_capped ? 1 : 0;

  let editProgrammeSQL = `UPDATE programmes SET programme_name = ?, y1_weight = ?, y2_weight = ?, y3_weight = ?, min_1st = ?, min_2_1 = ?, min_2_2 = ?, min_3rd = ?, resit_capped = ?, 
    max_failed_credits_allowed = ?, min_compensation_mark = ?, dissertation_min_pass = ? WHERE id = ?`;

  const params = [programme_name, y1_weight, y2_weight, y3_weight, min_1st, min_2_1, min_2_2, min_3rd, resit_capped, 
    max_failed_credits_allowed, min_compensation_mark, dissertation_min_pass, programme_id];

  await db.query(editProgrammeSQL, params);

  res.redirect("/admin/viewprogrammes");

   } catch (error) {
    console.error("Error updating officer");
    res.status(500).send("Database error");
  }

});



//navbar dry
//change name of app.js and entry point in package.json
//messages if no officers found etc.
//viewofficers. button to go back to full list after filtering

app.listen(PORT, (err) => {
  console.log(`listening on port http://localhost:${PORT}`);
});