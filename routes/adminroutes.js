const express = require ('express');

 const { pool } = require("../config/dbconfig")

 const bcrypt = require('bcrypt');
 const passport = require('passport');
//require("dotenv").config();

const app = express.Router();



const initialized = require('../config/adminpassportconfig');
  initialized(passport);

  app.use(passport.initialize());

  app.get('/adminlogin', checkAuthenticated ,(req, res) => {
     res.render("admin")
     });
 app.get('/admindashboard', checkNotAuthenticated ,(req, res) => {
    res.render("admindashboard")
 });
 app.get('/admindashboard', function(req, res, next) {
    pool.query(`SELECT * FROM userdata`,  (err, results,fields) => {
        if (err) {
          return done(err);
        }
        res.render('userdata',{tit})
      });
 })
 app.post("/adminlogin",
    passport.authenticate("local", {
      successRedirect: "/admin/admindashboard",
      failureRedirect: "/admin/adminlogin",
      failureFlash: true
    })
  );

 function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/admin/admindashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/admin/adminlogin");
  }


  module.exports = app;