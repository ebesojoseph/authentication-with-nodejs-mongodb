const express = require("express");
const app = express();
const { SECRET } = require("../app");
const jwt = require("jsonwebtoken");

module.exports.auth = async (req, res, next) => {
  const user = await jwt.verify(req.session.auth, SECRET);

  console.log(user);
  
  if (user) {
    req.session.user = user;
  } else {
    res.redirect("/signin");
  }
  next();
};
