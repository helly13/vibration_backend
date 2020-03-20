const express=require("express");
const getdb=require("../db").getdb;
const router=express();


router.get("/admin_core",(req,res,next)=>{
  if(req.session.username)
  {

       res.render("admin/index",{
              user:req.session.username
       });
  }
  else
  {
         res.redirect("/login");
  }
});

router.get("/add_Event",(req,res,next)=>{

    const db=getdb();
    db.collection("Sponsers").find({}).toArray((err,data)=>{
            res.render("admin/add/add_Event",{
                   sponser:data,
                   message:req.flash("success")
            });
    });
    

});

router.post("/add_Event",(req,res,next)=>{
       const cat=req.body.cat;
       const event_name=req.body.event_name;
       const venue=req.body.venue
       const time=req.body.time;
       const date=req.body.date;
       const judges=req.body.judges;
       const spon=req.body.sponsers;
       const pdf=req.body.pdf;

      var db=getdb();
      db.collection("Sponsers").find({Sponser_name:{$in:spon}}).toArray((err,data)=>{
         
        const store={
                            Event_name:event_name,
                            Venue:venue,
                            Date:date,
                            time:time,
                            participation:[],
                            Judges:judges,
                            Volunteer:[],
                            Sponsers:data,
                            pdf:pdf
                     }

                     
              const updateon={Category_name:cat};
        
         db.collection("Main_Event").updateOne(updateon,{$push:{
                Sub_Events:store
         }},(err,data)=>{
                req.flash("success","Event Added Successfully");
                return res.redirect("/add_Event");
         })
      });


     
});
module.exports=router;