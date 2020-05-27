const express=require("express");
const path=require("path");
const mongodb=require("mongodb");
const getdb=require("../db").getdb;
const router=express();


router.get("/admin_core",(req,res,next)=>{
  if(req.session.username)
  {
       let stu_cnt;
       let exp_cnt;
       let fund;
             const db=getdb();
          db.collection("Student").findOne({email:req.session.username},(err,data)=>{
                 const com_id=data.com_id;
               
                
                
                 db.collection("Committee").findOne({_id:com_id},(err,data2)=>{
                        
                        if(data2.type=='Core')
                        {
                            db.collection("Funds").findOne({committee_id:com_id},(err,data3)=>{
                               
                               
                                   fund=data3.total_fund;
                            
                            });
                        }
                        else
                        {
                               db.collection("Funds").findOne({committee_id:com_id},(err,data4)=>{
                                      fund=data4.fund_allocated;
                            
                               })
                        }
                        db.collection("Student").find({com_id:com_id}).count((err,data5)=>{
                     
                          
                           db.collection("Expenses").find({committee_id:com_id}).count((err,data1)=>{
                            res.render("admin/index",{
                                   user:req.session.username,
                                   fund:fund,
                                   stu_cnt:data5,
                                   exp_cnt:data1
                               })
                            
                         });
                         
                     });
                       
                 })

          })
       
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
       const pdf=req.body.upload;

      var db=getdb();
      if(!Array.isArray(spon))
      {
             if(spon==undefined)
             {
                    spon1=[];
             }
             else
             {
             spon1=[spon,"xyz"];
             }
      }
      else
      {
             spon1=spon;
      }
     
       
      db.collection("Sponsers").find({Sponser_name:{$in:spon1}}).toArray((err,data)=>{
       if(data==null)
       {
              data=[];
       }
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
              const part=[];
                const name=req.query.Event_name;
                const db=getdb();
                db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:name}}}]).toArray((err,data)=>{
                    req.session.info=data;
                     res.redirect("/process_participants");
                            
                      })
                   
                     
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
                    
                     req.session.info=data;
                     res.redirect("/process_volunteer");
                     });
       }
       else
       {
              res.redirect("/login");
       }
});


router.get("/process_volunteer",(req,res,next)=>{
       if(req.session.username)
       {
       const db=getdb();
       const info=req.session.info;
       console.log(info);
       let stud=[];
       for(let i=0; i<info.length; i++)
       {
              info[i].Sub_Events.Volunteer.forEach(data=>{
                     
                     const id2=mongodb.ObjectID('5e79bd7bc5808a541b546d48');
                     const id1=mongodb.ObjectID(data);
                     stud.push(id1);
                     stud.push(id2);
                       

              })
              
              
       }
      
     
    
       db.collection("Student").find({_id:{$in:stud}}).toArray((err,data2)=>{
              
              if(err)
              console.log("error")
              else 
              res.render("admin/show/view_Volunteer",{
                     detail:data2
              })
       })
}
else
{
       res.redirect("/login");
}
});
router.get("/process_participants",(req,res,next)=>{
       if(req.session.username)
       {
       const db=getdb();
       const info=req.session.info;
       console.log(info);
       let stud=[];
       for(let i=0; i<info.length; i++)
       {
              info[i].Sub_Events.participation.forEach(data=>{
                     
                     const id2=mongodb.ObjectID('5e79bd7bc5808a541b546d48');
                     const id1=mongodb.ObjectID(data);
                     stud.push(id1);
                     stud.push(id2);
                       

              })
              
              
       }
      
     
    
       db.collection("Student").find({_id:{$in:stud}}).toArray((err,data2)=>{
              
              if(err)
              console.log("error")
              else 
              res.render("admin/show/view_Participants",{
                     detail:data2
              })
       })
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
       let spon=req.body.sponsers;
       const pdf=req.file.path;
       const db=getdb();
       if(!Array.isArray(spon))
       {
              if(spon==undefined)
              {
                     spon1=[];
              }
              else
              {
              spon1=[spon,"xyz"];
              }
       }
       else
       {
              spon1=spon;
       }
   
      
       console.log(pdf);

       db.collection("Sponsers").find({Sponser_name:{$in:spon1}}).toArray((err,data1)=>{
              
       db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
              "Category_name":cat,
              "Sub_Events.$.Event_name":event_name,
              "Sub_Events.$.Venue":venue,
              "Sub_Events.$.Date":date,
              "Sub_Events.$.time":time,
              "Sub_Events.$.Judges":judges,
               "Sub_Events.$.Sponsers":data1,
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

});
});



module.exports=router;