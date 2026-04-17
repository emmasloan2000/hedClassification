import * as OfficerModel from '../model/officerModel.js';

export const protectedRoutes = (req, res, next) => {
  
  if (req.path === "/" || req.path === "/login") {
    return next();
  }

  if (req.path.includes('.')) return next();

  if (req.session.user) {
   
    return next();
  }
  
  res.redirect("/");
};



export const isAdmin = (req, res, next) => {
  
  if (req.session.user && req.session.user.role_id === 1) {
    next();
  } else {
    res.redirect("/");
  }
};


export const isOfficer = (req, res, next) => {

  console.log("Checking session on Port 4000:", req.session.user);
  
  if (req.session.user && req.session.user.role_id === 2) {
    next();
  } else {
    
    res.redirect("/");
  }
};


export const isAssigned = async (req, res, next) => {

  try {

  const programme_id = req.params.programme_id;

  const myProgrammes = await OfficerModel.getOfficerProgrammeStats(req.session.user.id);
  console.log(myProgrammes)
  const hasAccess = myProgrammes.some(programme => String(programme.id) === String(programme_id));


    if (hasAccess) {
      return next();
    } else {
      return res.status(403).send("You are not assigned to this programme.")
    }
    
  } catch(error) {
    console.error("Authorisation error", error);
    return res.status(500).send("Internal Server Error");
  };

}