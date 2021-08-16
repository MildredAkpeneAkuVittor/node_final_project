const express = require ('express');

 const { pool } = require("../config/dbconfig")

 const bcrypt = require('bcrypt');
 const passport = require('passport');
//require("dotenv").config();

const app = express.Router();



const initialized = require('../config/passportconfig');
  initialized(passport);

  app.use(passport.initialize());

  app.get('/adminlogin', checkAuthenticated ,(req, res) => {
     res.render("admin")
     });



//  app.post("/adminlogin",
//     passport.authenticate("local", {
//       // successRedirect: "/admin/admindashboard",
//       // failureRedirect: "/admin/adminlogin",
//       // failureFlash: true
//     })
//   );


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
    res.redirect("/adminlogin");
  }
  app.post("/adminlogin",
   passport.authenticate('local'), async(req,res)=> {
    const {useremail}= req.body
    let errors=[]
    let results = await pool.query(`select * FROM userdata WHERE email = $1`, [useremail]);
    try{
      if(results.rows[0].roles ==='admin'){
        
        return res.redirect('admindashboard')
      }
      else{
        errors.push({message:'not authorized'})
        res.render('admin',{errors})
      }
      // return res.redirect('userdashboard')
      
    }
    catch (err){
      console.log("error")
      console.error(err.message)
    }
  
  })
  // // ,
  //     passport.authenticate("local", {
  //       successRedirect: "/admin/admindashboard",
  //       failureRedirect: "/admin/login",
  //       failureFlash: true
  //     })
  //   );
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
    const keys = await pool.query( 'SELECT access_key,status,start_date FROM keystorage ORDER BY id DESC');
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