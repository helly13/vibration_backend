const app=require("express");
const path=require("path");
const bcrypt=require("bcryptjs");
const nodemailer=require('nodemailer');
const sendgrid=require("nodemailer-sendgrid-transport");

const transport=nodemailer.createTransport(sendgrid({

auth:{
    api_key:"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"
}
}));
const router=app.Router();

const getdb=require("../db").getdb;
router.get("/reg",(req,res,next)=>{
    res.render('reg');
});

router.get("/login",(req,res,next)=>{
    res.render('login',{
        errormessage:req.flash("error")
    });
});


router.post("/login",(req,res,next)=>{ 
     const username=req.body.username;
     const password=req.body.pass;

    const db=getdb();
    const user=db.collection("Student");
    user.findOne({"email":username},(err,data)=>{
          if(!data)
          
           return res.redirect('/login');
          else
          {
              bcrypt.compare(password,data.password).then(domatch=>{
                    if(domatch)
                    {
                    req.session.username=username;  
                    return res.redirect("/home");
                    }
                    else
                    {
                   req.flash("error","Invalid Username or Passsword");
                    return res.redirect("/login");
                    }
              }).catch(err=>{
                  console.log(err);
              });
          } 
           
});

      

     
              
  
     
});

router.post("/reg",(req,res,next)=>{ 
 const name=req.body.name;
 const email=req.body.email;
 const pass=req.body.pass;
 const con=req.body.contact;
 const bit=req.body.bit;
bcrypt.hash(pass,12).then(data=>{
     
const pass1=data;
const data1={
     "name":name,
     "contact":con,
     "email":email,
     "password":pass1,
     "stu_status":bit,
     "product":[{}],
      "volunteer_status":""
      
}

const db=getdb();
db.collection("Student").insertOne(data1,function(err){
    if(err)
    {
        console.log("Error Occured during Insertion");
    }
    console.log("Data Innerted Successfully");
});

});
transport.sendMail({
    to:"201912120@daiict.ac.in",
    from:"aman.sharma122111@gmail.com",
    subject:"Registration Successfull",
    html:"<h2>Thanks for the Registration for Vibrants</h2>"
     
});
return res.redirect('/login');

});


router.get("/about",(req,res,next)=>{
 
 const db=getdb();
 const user=req.session.username;
 db.collection("Student").findOne({"email":user},(err,data)=>{
         const name=data.name;
         const contact=data.contact;
         const bit=data.stu_status;
         let status;
         if(bit==="on")
              status="BIT Student";
         else
           status="NON-BIT Student";     

            res.render("about",{
                username:name,
                email:req.session.username,
                contact:contact,
                status:status
            });

 });
    
});


router.post("/about",(req,res,next)=>{
            
    const email=req.body.email;
    const con=req.body.contact;
   const user=req.session.username;
    const db=getdb();
    const updateon={email:user};
    const newval={$set:{email:email,contact:con }};
db.collection("Student").updateOne(updateon,newval,(err,data)=>{
    if(err)
    {
        console.log("Error in updation");
    }
    else
    {
      
       req.session.username=email;
        return res.redirect("/about");
    }
});

});
module.exports=router;