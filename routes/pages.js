const express = require('express');
const mysql = require('mysql');
const authController = require('../controller/auth');
const pointModel = require('../controller/conversion');

const router = express.Router();

const db = mysql.createConnection({
  host: "techclubnmims",
  user: "techclubnmims",
  password: "techclubnmims",
  database: "respawndb"
});

router.get('/',authController.isLoggedIn, (req, res)=>{
    var message;
    pointModel.show(message,req, res);
});

router.get('/signup', authController.isLoggedIn, (req, res)=>{
    if (req.user){
        res.redirect('back');
    } else {
        res.render('signup');
    }
});

router.get('/login', authController.isLoggedIn, (req, res)=>{
    if (req.user){
        res.redirect('back');
    } else {
        res.render('login');
    }
});

router.get('/dashboard',authController.isLoggedIn, (req, res)=>{
    db.query('SELECT username,SUM(points) AS points from dashboard GROUP BY username ORDER bY points DESC LIMIT 10', (error, output)=>{
        if (error){
            console.log(error);
        } else {
            if (output){
                var styles = [
                    {class: 'Top_1 Top_1_Class', id: 'Container_eu'},
                    {class: 'Top_2 Top_2_Class', id: 'Container_ej'},
                    {class: 'Top_3 Top_3_Class', id: 'Container_ec'},
                    {class: 'Top_4 Top_4_Class', id: 'Container_ea'},
                    {class: 'Top_5 Top_5_Class', id: 'Container_dw'},
                    {class: 'Top_6 Top_6_Class', id: 'Container_dq'},
                    {class: 'Top_7 Top_7_Class', id: 'Container_dk'},
                    {class: 'Top_8 Top_8_Class', id: 'Container_de'},
                    {class: 'Top_9 Top_9_Class', id: 'Container_db'},
                    {class: 'Top_10 Top_10_Class', id: 'Container_c'},
                ];
                var combined_output = {output: output, styles: styles, user: req.user }
                res.render('dashboard', {output: combined_output});
            }
        }
    });
});

router.get('/support',authController.isLoggedIn, (req, res)=>{
	res.render('support');
});

router.get('/story', authController.isLoggedIn, (req, res)=>{
    res.render('story');
});

router.post('/support', authController.isLoggedIn, (req, res)=>{
    const { name, email, subject, content } = req.body;
    if(!email || !name || !subject || !content){
        res.status(401).render('support', {message: 'Please fill in all the details'});
    }
    db.query('INSERT INTO support SET ?', {name: name, mail: email, subject: subject, content: content}, (error, result)=>{
        if (error){
            console.log(error);
        } else {
            console.log('Query registered!');
            res.status(200).render('support', {message: 'Your query has be registered'});
        }
    });
});

router.get('/:game/home', authController.isLoggedIn, (req, res)=>{
    res.render(`games/${req.params.game}/home`, {user: req.user});
});

router.get('/:game', authController.isLoggedIn, (req, res)=>{
    game = req.params.game
    if(req.user){
        db.query('SELECT username,highscore FROM dashboard WHERE game=? ORDER BY highscore DESC', [`${game}`], (error, result)=>{
            if (error){
                console.log(error);
            } else{
                if (result){
                    res.render('games/'+game+'/index', {output: result});
                } else {
                    res.render('games/'+game+'/index', {output: {}});
                }
            }
        });
    }else{
        res.render('login');
    }
});

router.get('/games/:game', authController.isLoggedIn, (req, res)=>{
    db.query('SELECT highscore,level FROM dashboard WHERE username=? AND game=?', [req.user.username, `${req.params.game}`], (error, result)=>{
        if(error){
            console.log(error);
        } else {
            if (result[0]) {
                res.send({highscore: `${result[0].highscore}`, level: `${result[0].level}`});
            } else {
                res.send({highscore: `0`, level: `1`});
            }
        }
    });
});

router.post('/games/:game/:level/:score', authController.isLoggedIn, (req, res)=>{
    var weightages = {mario: 4, pacman: 3, breakout: 1, gauntlet: 2, tetris:5}
    db.query(`SELECT * FROM dashboard WHERE game = ? AND username = ?`, [`${req.params.game}`, `${req.user.username}`], (error, results)=>{
        if(error){
            console.log(error);
        }else if (results[0]){
            db.query(`UPDATE dashboard SET highscore=?, points=?, level=? WHERE username=? AND game=?`, [`${req.params.score}`, `${req.params.score*weightages[`${game}`]}`, `${req.params.level}`, `${req.user.username}`, `${req.params.game}`], (error, results)=>{
                if (error){
                    console.log(error);
                } else {
                    console.log('UPDATED SUCCESSFULLY');
                }
            });
        } else {
            db.query(`INSERT INTO dashboard (username, game, highscore, level, points) VALUES ('${req.user.username}', '${req.params.game}', '${req.params.score}', '${req.params.level}', '${req.params.score*weightages[`${game}`]}')`, (error, results)=>{
                if (error){
                    console.log(error);
                } else {
                    console.log('INSERTED SUCCESSFULLY');
                }
            });
        }
    });
});

router.post('/games/:game/:level/:score/:datetime/:timedelta', authController.isLoggedIn, (req, res)=>{
	console.log(req.params.datetime, req.params.timedelta, req.params.score, req.params.level);
    db.query(`INSERT INTO ${req.user.username+req.params.game} (datetime, timedelta, score, level) VALUES ("${req.params.datetime}", "${req.params.timedelta}", "${req.params.score}", "${req.params.level}")`, (error, results)=>{
        if (error){
            console.log(error);
        } else {
            console.log('INSERTED SUCCESSFULLY');
        }
    });
});
module.exports = router;