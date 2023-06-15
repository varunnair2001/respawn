const mysql = require('mysql');

const db = mysql.createConnection({
  host: "techclubnmims",
  user: "techclubnmims",
  password: "techclubnmims",
  database: "respawndb"
});

exports.show = (message, req, res) =>{
    var message;
    var combined_output = {user: req.user, message: message};
    res.render('home', {output: combined_output});
}
