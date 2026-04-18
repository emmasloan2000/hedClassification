import express from "express";
import session from 'express-session';
import path from "path";
import bcrypt from 'bcrypt';
import { fileURLToPath } from "url";
import db from '../config/db.js';
import MySQLStoreFactory from 'express-mysql-session';


import adminRoutes from './routes/adminRoutes.js';
import officerRoutes from './routes/officerRoutes.js'
import { protectedRoutes, isAdmin, isOfficer } from "./middleware/middleware.js";


const MySQLStore = MySQLStoreFactory(session);
const app = express();
const PORT = 3000;
const sessionStore = new MySQLStore({}, db);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'thisisasecret',
  store: sessionStore,
  saveUninitialized: false,
  resave: false,
  rolling: true,
  cookie: { secure: false,  maxAge: 10 * 60 * 1000}
})
);


app.use(protectedRoutes);

app.use("/admin", adminRoutes);
app.use("/officer", officerRoutes);


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




app.listen(PORT, (err) => {
  console.log(`listening on port http://localhost:${PORT}`);
});