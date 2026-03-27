import express from "express";
//import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//add session middleware later
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  
  res.render("login");
});

app.listen(PORT, (err) => {
  console.log(`listening on port http://localhost:${PORT}`);
});