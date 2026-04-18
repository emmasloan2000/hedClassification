import express from "express";
import db from "../config/db.js";
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import officerApiRoutes from './routes/officerApiRoutes.js';
import adminApiRoutes from './routes/adminApiRoutes.js';

const MySQLStore = MySQLStoreFactory(session);
const api = express();
const PORT = 4000;
const sessionStore = new MySQLStore({}, db);

api.use(express.json());

api.use(session({
  secret: 'thisisasecret',
  store: sessionStore,
  saveUninitialized: false,
  resave: false,
  rolling: true,
  cookie: { secure: false,  maxAge: 10 * 60 * 1000}
})
);

api.use("/api/officer", officerApiRoutes);
api.use("/api/admin", adminApiRoutes);



api.listen(PORT, () => {
    console.log(`API started on port ${PORT}`);
})