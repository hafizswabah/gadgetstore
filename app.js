require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const expresslayouts = require('express-ejs-layouts')
const session = require('express-session')
const morgan = require('morgan')
const MongoStore = require('connect-mongo');

const mongodb = require('./config/mongodbConnect')
const userRouter = require('./Router/UserRouter')
const adminRouter = require('./Router/adminRouter')

const path = require("path")
 
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "/public")))
mongodb()

app.get("/check",(req,res)=>{
    console.log("version 1 running")
})

app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_CONFIG})
}));
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
})

app.use('/', userRouter)
app.use('/admin', adminRouter)




app.listen(8888, () => { console.log('server is running at', 7777) })