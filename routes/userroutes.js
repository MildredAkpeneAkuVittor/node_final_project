const express = require ('express');

 const { pool } = require("../config/dbconfig")

 const bcrypt = require('bcrypt');
 const passport = require('passport');
//require("dotenv").config();

const app = express.Router();

const initialized = require('../config/passportconfig');
  initialized(passport);

//middleware




app.use(passport.initialize());

//get

app.get('/',  (req, res) => {
    res.render("index")
});
app.get('/register', checkAuthenticated,  (req, res) => {
    res.render("register.ejs")
});
app.get('/login', checkAuthenticated, (req, res) => {
    
    res.render("login.ejs")
});
// app.get('/userdashboard', checkNotAuthenticated,  (req, res) => {
//     res.render("userdashboard.ejs");
// });


app.get('/userdashboard', checkNotAuthenticated, async function  (req, res) {
    const keys = await pool.query( 'SELECT access_key,status,start_date, EXTRACT(DAY FROM start_date) AS expiry_date FROM keystorage ORDER BY id DESC');
    const allKeys = keys.rows;
     res.render("userdashboard", {allKeys})
    
});

//get all
// app.get('/admindashboard',(req, res)=>{
//    try{
//  const keystorage = pool.query(`SELECT * FROM keystorage`);
//     res.json(keystorage.rows)

// }catch(err){
//     console.log(err.message);
// }


// });





//create
app.post("/register",  async function (req,res) {

   
    let { username, useremail, schoolname, userpassword, userpassword2 } = req.body;

    console.log({
      username,
      schoolname,
      useremail,
      userpassword,
      userpassword2
  });

    let errors = [];
    

     if(!username || !useremail || !schoolname || !userpassword || !userpassword2){
        errors.push("Please enter all fields")
    }
       if(userpassword.length < 6){
        errors.push("invalid password, should be at least 6 characters")

       }
      if (userpassword !== userpassword2){
        errors.push("Passwords donot match")
      }
      if (errors.lenght>0){
          res.render('register',{errors,name,email,schoolname,userpassword,userpassword2})
      }
      else{
          //validation passed

          let hashedpassword = await bcrypt.hash(userpassword,10);
          console.log(hashedpassword);

          pool.query(
            `SELECT * FROM userdata
            WHERE email = $1`,
          [useremail],
          (err, results) => {
            if (err) {
              console.log(err);
            }
            console.log(results.rows); 
            if (results.rows.length > 0) {
                return res.render("register", {
                  message: "Email already registered"
                });
              } else {
                pool.query(
                  `INSERT INTO userdata (name, schoolname, email, password)
                      VALUES ($1, $2, $3,$4)
                      RETURNING id, password`,
                  [username, schoolname, useremail, hashedpassword],
                  (err, results) => {
                    if (err) {
                      throw err;
                    }
                    console.log(results.rows);
                    req.flash("success_msg", "You are now registered. Please log in");
                    res.redirect("/users/login");
                  }
                );
              }
            } 
        
          );
      } 

});

app.post("/login",
    passport.authenticate("local", {
      successRedirect: "/users/userdashboard",
      failureRedirect: "/users/login",
      failureFlash: true
    })
  );
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/userdashboard");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }
  app.get('/users/logout', (req, res) => {
    req.logout();
    req.flash("success_msg","you are logged out")
    res.redirect('/users/login')
 });

//  app.get('/admin/admindashboard', function(req, res) {
//     const sql = 'SELECT * FROM keystorage ORDER BY id ASC';
//     pool.query(sql, (error, results) => {
//         if (error) {
//             throw error;
//         }
//         res.render("allItemInfo.ejs", {todoDbList: results.rows})
//     })
// });

app.post('/userdashboard',(req, res)=>{
    
    

    function keyGenerator(){   
        let putSpace = 3
        let keyArray = [];
        let hexRef = [1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','0'];
        for(let i = 0; i < 16; i++){
            let thisIndex = Math.floor((Math.random() * 15) + 1);
            keyArray.push(hexRef[thisIndex]);
            if(i === putSpace){
              keyArray.push(" ")
              putSpace+=4
            }
        }
        return keyArray.join("");
    }
    keyGenerator();
  
    try{
    
     pool.query(`INSERT INTO keystorage (access_key,status) VALUES($1,$2) RETURNING access_key `,[keyGenerator(),"active"],
     (err,results)=>{
        if(err){
          console.log(err)
        }
        const ack = results.rows;
        res.render('userdashboard',{ack})
     })
  
    
  } catch(err){
    console.error(err.message);
  }
  });
  
 










module.exports = app
