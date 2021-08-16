const express = require ('express');

 const { pool } = require("./config/dbconfig")
 const bcrypt = require('bcrypt');
 const passport = require('passport');
 const flash = require('express-flash');
const session = require ('express-session');


require("dotenv").config();

const userroutes = require('./routes/userroutes');
const adminroutes = require('./routes/adminroutes');

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


app.use('/users', userroutes)
app.use('/admin', adminroutes)





 app.get('/users/logout', (req, res) => {
     req.logout();
     req.flash("success_msg","you are logged out")
     res.redirect('/users/login')
  });

  app.get('/admin/logout', (req, res) => {
    req.logout();
    req.flash("success_msg","you are logged out")
    res.redirect('/admin/adminlogin')
 });







app.listen(PORT,()=>(
    console.log(`server is running ${PORT}`)
));


