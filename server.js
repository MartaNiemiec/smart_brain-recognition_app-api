const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors'); // when we need to communicate with outside word using HTTP then Chrome for security reason are blocking the connection. And that's called 'Access Control Allow Origin'. So to connect localhost we need to do something called CORS(the error message is "set the request's mode to no-cors")
// The same-origin policy is an important concept in the web application security model. Under the policy, a web browser permits scripts contained in a first web page to access data in a second web page, but only if both web pages have the same origin. An origin is defined as a combination of URI scheme, host name, and port number. This policy prevents a malicious script on one page from obtaining access to sensitive data on another web page through that page's Document Object Model...  (https://en.wikipedia.org/wiki/Same-origin_policy)
//https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1', //127.0.0.1 = localhost
    user : 'marta',
    password : 'test',
    database : 'smart-brain'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working')})
// app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) })
app.post('/signin', signin.handleSignin(db, bcrypt))  // first is running handleSignin function with (db, bcrypt) and then it automatically receives (req, res).
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })  // register.handleRegister(req, res, db, bcrypt) -> this is dependency injection we're injecting whatever dependencies this handle register function needs. Its like: signin.handleSignin(db, bcrypt)(req,res)
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })
app.put('/image', (req, res) => { image.handleImage(req, res, db) })
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })

app.listen(process.env.PORT || 3000, () => {
  console.log(`app is runnng on port ${process.env.PORT}`);
})

/*
/         --> res = this is working
/signin   --> POST = succes/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user(update/count)
*/