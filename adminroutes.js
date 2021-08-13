const express = require ('express');

 const { pool } = require("./config/dbconfig")

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

//console.log(uuid());

//get all
app.get('/admindashboard',async(req, res)=>{
   try{
    const allkeys = await pool.query('SELECT * FROM keystorage')
    res.json(allkeystorage.rows)

}catch(err){
    console.log(err.message);
}


});

// get

app.get('/userroutes/id',async(req, res)=>{
    try{
    const {id} = req.params;
    const userkey = await pool.query('SELECT * FROM keystorage where keystorage_id = $1 '[id])
    
        res.json(allkeystorage.rows)
}  catch (err) {
    console.error(err.message);
}
});

//create
app.post('/userroutes',async(req, res)=>{
    console.log(req.body);
    try{
    const status = req.body;
    const create = await pool.query('INSERT INTO keystorage (access_key,status) VALUES($1,$2) RETURNING * ',[uuid(),status])

    res.json(status)
} catch(err){
    console.error(err.message);
}
});




//update 
app.put('/admindashboard/id', async(req,res)=>{
    try{
        const {id} = req.params;
        const{status} = req.body;

        const updatekey = await pool.query("update keystorage SET status = $1 WHERE id =$2", [status,id])
        
        res.json("update succesful")
    
    }catch(err){
        console.log(err.message);

    }
})

app.get('/users/login', checkAuthenticated, (req, res) => {
    
    res.render("login.ejs")
});


//delete
app.delete('/admindashboard/id', async(req,res)=>{
    try{
        const {id} = req.params;
    

        const deletekey = await pool.query("DELETE FROM keystorage  WHERE id =$1", [id])
        
        res.json("delete succesful")
    
    }catch(err){
        console.log(err.message);

    }
})


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





  module.exports = initialize;

