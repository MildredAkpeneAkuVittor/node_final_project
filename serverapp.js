const express = require ('express');

 const { pool } = require("./config/dbconfig")
const admin = require('./adminroutes')
 const bcrypt = require('bcrypt');
 const passport = require('passport');
 const flash = require('express-flash');
const session = require ('express-session');
require("dotenv").config();

//const userroutes = require('./userroutes');

const app = express();

const PORT = process.env.PORT || 4000;

const initialized = require('./config/passportconfig');
  initialized(passport);

//middleware
app.use(express.urlencoded({extended:false}));
app.set ("view engine","ejs");

app.use(session(
    {
        secret: "secret",
        resave:false,
        saveUninitialized: false,
    }
));

app.use(passport.initialize());

app.use(passport.session());


app.use(flash());

app.use(admin.initialize());



app.get('/',  (req, res) => {
    res.render("index")
});
app.get('/users/register', checkAuthenticated,  (req, res) => {
    res.render("register.ejs")
});
app.get('/users/login', checkAuthenticated, (req, res) => {
    
    res.render("login.ejs")
});
app.get('/users/userdashboard',  (req, res) => {
    res.render("userdashboard.ejs");
});
app.get('/users/admin',  (req, res) => {
     res.render("admin")
     });
 app.get('/users/admindashboard', checkNotAuthenticated,  (req, res) => {
    res.render("admindashboard")
 });

 app.get('/users/logout', (req, res) => {
     req.logout();
     req.flash("success_msg","you are logged out")
     res.redirect('/users/login')
  });

  //create
app.post('/users/userdashboard',(req, res)=>{
    
    

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
      res.send(results.rows)
   })

  
} catch(err){
  console.error(err.message);
}
});


//get all
app.get('/admindashboard',(req, res)=>{
  try{
pool.query(`SELECT * FROM keystorage`, (err, results) => {
if(err) { 
  console.log(err)
}
res.send(results.rows)
});
   //res.json(keystorage.rows)

}catch(err){
   console.log(err.message);
}


});


app.post("/users/register",  async function (req,res) {

   
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

app.post("/users/login",
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




app.listen(PORT,()=>(
    console.log(`server is running ${PORT}`)
));


