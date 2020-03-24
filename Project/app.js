const http=require("http");
const express=require("express");
const body_parser=require("body-parser");
const authRouter=require('./routes/auth');
const homeRouter=require('./routes/home');
const forgotRouter=require("./routes/forgot");
const adminRouter=require("./routes/event");
const path=require("path");
const session=require("express-session");
const app=express();
const flash=require("connect-flash");

const mongoconnect=require("./db").MongoConnect;
app.use(flash());
app.set("view engine","ejs");
app.set("views","views");


app.use(session({secret:"aman",resave:false,saveUninitialized:false}));
app.use(express.static(path.join(__dirname,"views")));
app.use(express.static(path.join(__dirname,"/views/admin")));
app.use(express.static(path.join(__dirname,"/views/admin/view_Participants")));
app.use(body_parser.urlencoded({extended:false}));
app.use((req,res,next)=>{
    if(req.session.username)
    {
res.locals.user=req.session.username;
    }
    next();
});
app.use(authRouter);
app.use(homeRouter);
app.use(forgotRouter);
app.use(adminRouter);


mongoconnect(()=>{
    app.listen(3000);
});










