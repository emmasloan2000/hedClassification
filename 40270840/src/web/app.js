import express from "express";
import session from "express-session";
import path from "path";
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
    })
);

app.get("/", (req, res) => {
  
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {

  const {userF, passF} = req.body;

  try{
    const checkUser = `SELECT * FROM users WHERE username = ?`;
    const [rows] = await db.query(checkUser, [userF]);
    if (rows.length === 0){
      return res.send("User not found");

    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(passF, user.password);
    const userRole = user.role_id;

    if (isMatch){
      req.session.user = {id: user.id, username: user.username, role: user.role_id}
      if (userRole === 1){
        res.redirect();
      } else {
        res.redirect();
      }

    } else {
      res.send("Password incorrect");
    }

  } catch (err){
    res.status(500).send(err);
  }

});

//remember to lock the routes

app.listen(PORT, (err) => {
  console.log(`listening on port http://localhost:${PORT}`);
});