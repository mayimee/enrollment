const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
});

exports.registration = (req, res) => {

    const {first_name, last_name, address, contact_number, birthday, gender, course,  email_address, password, confirm_password} = req.body;

    db.query(`select email_address from student where email_address = ?`, [email_address], async(err, results) =>{
        if(err)
        {
            throw err;
        }

        if (results.length > 0)
        {
            return res.render('registrationform', {message: 'Email entered is already in use.'});
        }
        else if (password !== confirm_password)
        {
            return res.render('registrationform', {message: 'Password entered do not match'});
        }

        let encpass = await bcrypt.hash(password, 8);
        console.log(encpass);

        db.query('insert into student set ?', {first_name: first_name, last_name:last_name,address: address,contact_number:contact_number, birthday:birthday, gender:gender, course:course, email_address:email_address, password:encpass}, (err, results)=>{
            if(err)
            {
                console.log('gender');
                throw err;
            }
            else
            {
                console.log(results);
                
                db.query(`select * from student`, (err, results) => {
                    if(err) throw err;
    
                    res.render('list', {title: 'List of Students', user: results});
                });
            }
        })
    });
}

exports.adminregistration = (req, res) => {

    const {first_name, last_name, email_address, password, confirm_password} = req.body;

    db.query(`select email_address from admin where email_address = ?`, [email_address], async(err, results) =>{
        if(err)
        {
            throw err;
        }

        if (results.length > 0)
        {
            return res.render('adminregform', {message: 'Email entered is already in use.'});
        }
        else if (password !== confirm_password)
        {
            return res.render('adminregform', {message: 'Password entered do not match'});
        }

        let encpass = await bcrypt.hash(password, 8);
        console.log(encpass);

        db.query('insert into admin set ?', {first_name: first_name, last_name:last_name, email_address:email_address, password:encpass}, (err, results)=>{
            if(err)
            {
                throw err;
            }
            else
            {
                console.log(results);
                return res.render('adminregform', {message:'Admin Account has been saved!!'});
            }
        })
    });
}

exports.login = (req, res) => {
    const {email_address, password} = req.body;
    console.log(req.body);

    if (!email_address || !password)
    {
        return res.status(400).render('index', {message: 'Please provide email address and password'});
    }

    db.query(`select * from admin where email_address = ?`, [email_address], async (err, results)=>{
        if (!results || !(await bcrypt.compare(password, results[0].password)))
        {
            res.status(401).render('index', {message:'Email and/or password is incorrect.'});
        }
        else 
        {
            const id = results[0].student_id;
            const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRESIN});
            console.log(token);

            const cookieOp = {
                expires: new Date(Date.now() + process.env.JWT_COOKIEEXPIRES * 24 * 60 * 60 * 1000), httpOnly: true
            };

            res.cookie('jwt', token, cookieOp);

            db.query(`select * from student`, (err, results) => {
                if(err) throw err;

                res.render('list', {title: 'List of Students', user: results});
            });
        }
    })
}

exports.updateform = (req, res) => {
    const email_address = req.params.email_address;

    db.query(`select * from student where email_address = ?`, [email_address], (err, results) => {
        if (err) throw err;

        console.log(results[0]);

        res.render('updateform', {title: 'Edit User', user:results[0]});
    })
}

exports.updateuser = (req, res) => {
    const {first_name, last_name, address, course, contact_number, gender, email_address} = req.body;

    db.query(`update student set first_name='${first_name}', last_name='${last_name}', address='${address}', course='${course}', contact_number='${contact_number}', gender='${gender}' where email_address = '${email_address}'`, (err, results) => {
        if(err) throw err;

        db.query(`select * from student`, (err, results) => {
            res.render('list', {user: results});
        })
    });
}

exports.deleteform = (req, res) => {
    const email_address = req.params.email_address;

    db.query(`select * from student where email_address = ?`, [email_address], (err, results) => {
        if (err) throw err;

        console.log(results[0]);

        res.render('deleteform', {user:results[0]});
    })
}

exports.deleteuser = (req, res) => {
    const {email_address} = req.body;

    db.query(`delete from student where email_address = ?`, [email_address], (err, results) => {
        if(err) throw err;

        db.query(`select * from student`, (err, results) => {
            res.render('list', {title: 'List of Students', user: results});
        })
    });
}