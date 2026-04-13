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
  console.log(req.session);
  if (req.session.user && req.session.user.role_id === 1) {
    next();
  } else {
    res.redirect("/");
  }
};


export const isOfficer = (req, res, next) => {
  
  if (req.session.user && req.session.user.role_id === 2) {
    next();
  } else {
    
    res.redirect("/");
  }
};