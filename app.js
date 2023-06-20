const express = require('express'),
      bodyParser = require('body-parser'),
      mysql = require('mysql'),
      cookieParser = require('cookie-parser'),
      dotenv = require('dotenv'),
      path = require('path'),
      app = express();
const PORT = process.env.PORT || 3030;

dotenv.config({ path: './.env'});

const db = mysql.createConnection({
  host: "techclubnmims",
  user: "techclubnmims",
  password: "techclubnmims",
  database: "respawndb"
}); 

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.use(function(req, res, next){
	res.locals.user = false;
	res.locals.message = false;
	next();
});

// app.get('/', (req, res) =>{
// 	res.send('working fine');
// });

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

//app.listen(2000, 'respawntwo.com', ()=>{
//	console.log('server running.');
//});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
