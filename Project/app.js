const http=require("http");
const express=require("express");
const multer=require("multer");
const body_parser=require("body-parser");
const authRouter=require('./routes/auth');
const homeRouter=require('./routes/home');
const forgotRouter=require("./routes/forgot");
const adminRouter=require("./routes/event");
const ExpenseRouter=require("./routes/expense");
const FundRouter=require("./routes/fund");
const path=require("path");
const session=require("express-session");
const app=express();
const flash=require("connect-flash");
const filestorage=multer.diskStorage(
    {
        destination:(req,file,cb)=>{
           cb(null,"images");
        },
        filename:(req,file,cb)=>{
            cb(null,file.originalname);
        }
    }
)
const mongoconnect=require("./db").MongoConnect;
app.use(multer({storage:filestorage}).single("upload"))
app.use(flash());
app.set("view engine","ejs");
app.set("views","views");


app.use(session({secret:"aman",resave:false,saveUninitialized:false}));
app.use(express.static(path.join(__dirname,"views")));
app.use(express.static(path.join(__dirname,"/views/admin")));
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
app.use(ExpenseRouter);
app.use(FundRouter);

mongoconnect(()=>{
    app.listen(3000);
});










