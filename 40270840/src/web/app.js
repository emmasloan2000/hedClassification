import express from "express";
import session from 'express-session';
import path from "path";
import bcrypt from 'bcrypt';
import { fileURLToPath } from "url";
import db from '../config/db.js';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//add session middleware later
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'thisisasecret',
  saveUninitialized: true,
  resave: false,
  cookie: { secure: false }
})
);

app.get("/", (req, res) => {

  res.render("login.ejs");
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
      req.session.user = { id: user.id, username: user.username, role: user.role_id }
      if (userRole === 1) {
        console.log("redirecting to admin")
        res.redirect("/admin");
      } else {
        res.redirect("/officer");
      }

    } else {
      res.send("Password incorrect");
    }

  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }

});

app.get("/admin", async (req, res) => {

  if (req.session.user && req.session.user.role === 1) {
    const allClassOfficers = `SELECT * FROM users WHERE users.role_id = 2`;
    const [officers] = await db.query(allClassOfficers);

    const counter = officers.length;

    const allProgrammes = `SELECT * FROM programmes`;
    const [programmes] = await db.query(allProgrammes);

    const pCounter = programmes.length;

    const unassignedProgrammesSQL = `SELECT programmes.* FROM programmes
                                  LEFT JOIN user_programmes ON programmes.id = user_programmes.programme_id
                                  WHERE user_programmes.programme_id IS NULL`;

    const [unassignedProgrammes] = await db.query(unassignedProgrammesSQL);
    const unassignedCounter = unassignedProgrammes.length;

    res.render("admin.ejs", { counter, pCounter, unassignedCounter });
  } else {
    res.redirect("/");
  }

});

app.get("/officer", (req, res) => {

  if (req.session.user && req.session.user.role === 2) {
    res.render("officer.ejs");
  } else {
    res.redirect("/");
  }
});

app.get("/admin/addofficer", (req, res) => {

  res.render("addofficer.ejs");
});

app.get("/admin/addprogramme", (req, res) => {

  res.render("addprogramme.ejs");
});

//remember to lock the routes
//add logout route that ends session

app.listen(PORT, (err) => {
  console.log(`listening on port http://localhost:${PORT}`);
});