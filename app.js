const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2');
const { dirname } = require('path');
const app = express();
const hostname = 'localhost';
const port = process.env.port || 5000;
const path = require('path');
const cookie = require('cookie-parser')

dotenv.config({path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect(function(err){
    if (err)
    {
        console.error('error connecting: ' + err.stack);
    }
    else
    {
        console.log("MySQL connected")
    }
})

//setting the handle bars view engine template
app.set('view engine', 'hbs');


//Parse incoming request with json payloads
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Define routes
app.use('/', require('./routes/registrationroutes'));
app.use('/auth', require('./routes/auth'));

//cookie-parser
app.use(cookie());

const publicdir = path.join(__dirname, './public/');
app.use(express.static(publicdir));

app.listen(port, hostname, () =>{
    console.log(`Server running at http://${hostname}:${port}`)
})