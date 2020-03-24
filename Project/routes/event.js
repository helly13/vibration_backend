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
       spon1=[spon,"xyz"];
      db.collection("Sponsers").find({Sponser_name:{$in:spon1}}).toArray((err,data)=>{
       
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





router.get("/view_Event",(req,res,next)=>{
       if(req.session.username)
       {
            const db=getdb();
            db.collection("Main_Event").find({}).toArray((err,data)=>{
              res.render("admin/show/view_Event",{
                     Event:data
              });
            });

          
       }  
       else
       {
              return res.redirect("/login");
       }
});



router.get("/view_Participants",(req,res,next)=>{
       if(req.session.username)
       { 
                const name=req.query.Event_name;
                const db=getdb();
                db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:name}}}]).toArray((err,data)=>{
                     
                     res.render("admin/show/view_Participants",{
                            detail:data

                     });
                 });
       }
       else
       {
              res.redirect("/login");
       }
});



router.get("/view_Volunteer",(req,res,next)=>{
       if(req.session.username)
       { 
                const name=req.query.Event_name;
                const db=getdb();
                db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:name}}}]).toArray((err,data)=>{
                    
                     res.render("admin/show/view_Volunteer",{
                            detail:data

                     });
                 });
       }
       else
       {
              res.redirect("/login");
       }
});


router.get("/view_Sponsers",(req,res,get)=>{
if(req.session.username)
{
       const name=req.query.Event_name;
       const db=getdb();
       db.collection("Main_Event").aggregate([{$unwind:"$Sub_Events"},{$match:{"Sub_Events.Event_name":{$eq:name}}}]).toArray((err,data)=>{
             
              res.render("admin/show/view_Sponsers",{
                     detail:data
              });
       });
} 
else
{
       res.redirect("/login");
}
});

router.get("/edit_Event",(req,res,next)=>{
       if(req.session.username)
       {
              const name=req.query.Event_name;
              const db=getdb();
              db.collection("Main_Event").aggregate([{$unwind:"$Sub_Events"},{$match:{"Sub_Events.Event_name":{$eq:name}}}]).toArray((err,data)=>{
                     db.collection("Sponsers").find({}).toArray((err,data1)=>{
                             res.render("admin/edit/edit_Event",{
                                    sponser:data1,
                                    detail:data,
                                    message:req.flash("success")
                             });
                     });
                 });
                 
       }
       else
       {
              res.redirect("/login");
       }
});


router.post("/edit_Event",(req,res,next)=>{
       const cat=req.body.cat;
       const event_name=req.body.event_name;
       const venue=req.body.venue
       const time=req.body.time;
       const date=req.body.date;
       const judges=req.body.judges;
       const spon=req.body.sponsers;
       const pdf=req.body.pdf;
       const db=getdb();
       console.log(spon);
       console.log(judges + " " + spon + " "  );
       db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
              "Category_name":cat,
              "Sub_Events.$.Event_name":event_name,
              "Sub_Events.$.Venue":venue,
              "Sub_Events.$.Date":date,
              "Sub_Events.$.time":time,
              "Sub_Events.$.Judges":judges,
              "Sub_Events.$.Sponsers":spon,
              "Sub_Events.$.pdf":pdf

       }},(err,data)=>{
              if(err)
              {
                     console.log("error");
              }
              else
              {
                     console.log("Updated");
                     res.redirect("/edit_Event?Event_name="+ req.query.Event_name);
              }
       })
})
module.exports=router;