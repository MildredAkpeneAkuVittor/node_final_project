const express = require ('express');

 const { pool } = require("./config/dbconfig")

 const bcrypt = require('bcrypt');
 const passport = require('passport');
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 4000;

const initialized = require('./config/passportconfig');
  initialized(passport);

//middleware
app.use(express.urlencoded({extended:false}));
app.set ("view engine","ejs");



app.use(passport.initialize());





//get all
app.get('/admindashboard',(req, res)=>{
   try{
 const keystorage = pool.query(`SELECT * FROM keystorage`);
    res.json(keystorage.rows)

}catch(err){
    console.log(err.message);
}


});

// get

app.get('/userdashboard/id',(req, res)=>{
    try{
    
pool.query(`SELECT * FROM keystorage where id = $1 `,[id])
    
        //res.json({message: 'success'})
}  catch (err) {
    console.error(err.message);
}
});

//create
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
    
     pool.query(`INSERT INTO keystorage (access_key,status) VALUES($1,$2) RETURNING * `,[keyGenerator(),"active"])

   // res.json({message: 'success'})
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


app.listen(PORT,()=>(
    console.log(`server is running ${PORT}`)
));

