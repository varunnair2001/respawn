const mysql = require('mysql'),
jwt = require('jsonwebtoken'),
bcrypt = require('bcryptjs'),
{promisify} = require('util'),
pointModel = require('./conversion');

const db = mysql.createConnection({
  host: "techclubnmims",
  user: "techclubnmims",
  password: "techclubnmims",
  database: "respawndb"
});

var games = ['breakout', 'gauntlet', 'mario', 'pacman', 'tetris'];

exports.login = async (req, res)=>{
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).render('login', {message: 'please provide an email and password'});
        } else {
        	 db.query('SELECT * FROM users WHERE email=? OR username=?', [email, email], async (error, results)=>{
            if(results.length===0){
                res.status(401).render('login', {message: 'Email or Password is incorrect'});
            }else if (!(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login', {message: 'Email or Password is incorrect'});
            } else{
                const id = results[0].id;
                const token = jwt.sign({ id }, 'mysupersecretpassword', {
                    expiresIn: '30d'
                });
                const cookieOptions = {
                    expires: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect('/');
            }
        });
        }
       
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res)=>{
    var { username, email, password, passwordConfirm } = req.body;
	email = email + '@nmims.edu.in';
    if(!email || !username || !password){
        res.status(401).render('signup', {message: 'Please fill in all the details'});
    } else if ((email.match(/@/g) || []).length !== 1){
        res.status(401).render('signup', {message: 'Please enter part of email before @nmims.edu.in'});
    } else {
    	db.query('SELECT email FROM users WHERE email=? OR username=?', [email, username], async (error, result)=>{
        if(error){
            console.log(error);
        }
        if(result.length > 0){
            return res.render('signup', {message: 'this email/username is already in use.'});
        } else if(password !== passwordConfirm){
            return res.render('signup', {message: 'passwords do not match.'});
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        db.query('INSERT INTO users SET ?', {username: username, email: email, password: hashedPassword}, (error, results)=>{
            if(error){
                console.log(error);
            }else{
                games.forEach((game)=>{
                	username = username.replace(/ +/g, "");
                    var tableName = username + game;
                    db.query(`CREATE TABLE ${tableName} (id INT AUTO_INCREMENT PRIMARY KEY, datetime INT(13), timedelta INT(13), score INT(11), level INT(11))`, (error, result)=>{
                        if (error){
                            console.log(error);
                        } else {
                            if(games.indexOf(game) === (games.length-1)){
                                var message = {message: 'User Registered!'};
                                pointModel.show(message, req, res);
                            } else {
                                console.log('Table Created');
                            }
                        }
                    });
                });
            }
        });
    });
   	}
}

exports.isLoggedIn = async (req, res, next)=>{
    if(req.cookies.jwt){
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, 'mysupersecretpassword');
            db.query('SELECT * FROM users WHERE id=?', [decoded.id], (error, result)=>{
                if(!result){
                    return next();
                }
                req.user = result[0];
                res.locals.user = req.user;
                return next();
            });
        } catch (error) {
            console.log(error);
        }
    }else{
        next();
    }
}

exports.logout = async (req, res)=>{
    res.clearCookie('jwt');
    res.redirect('/');
}