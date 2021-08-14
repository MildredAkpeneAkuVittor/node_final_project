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

  app.get('admin/logout', (req, res) => {
    req.logout();
    req.flash("success_msg","you are logged out")
    res.redirect('/admin/adminlogin')
 });

  app.get('/admindashboard', checkNotAuthenticated, async function  (req, res) {
    //   const status
    // if(status==="active"){
    //     pool.query("UPDATE keystorage SET status = 'REVOKED' WHERE id = 3", (err, res) => {
    //         console.log(err, res);
    //         pool.end();
    //       });
            
    //     }
    const keys = await pool.query( 'SELECT access_key,status,start_date, EXTRACT(DAY FROM start_date) AS expiry_date FROM keystorage ORDER BY id DESC');
    const allKeys = keys.rows;
     res.render("admindashboard", {allKeys})
    //  if( 'status' === "active"){
    //     pool.query("UPDATE keystorage SET '' = 'REVOKED' WHERE id = $1", (err, res) => {
    //         console.log(err, res);
    //         pool.end();
    //       });
            
    //     }
    
});

app.put('/admindashboard', (req,res)=>{
    pool.query(`UPDATE student SET status = 'revoked' WHERE action <= 5`, (err, res) => {
        console.log(err, res);
        pool.end();
      });
        
    
    
})
  module.exports = app;