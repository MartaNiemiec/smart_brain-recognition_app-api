const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors'); // when we need to communicate with outside word using HTTP then Chrome for security reason are blocking the connection. And that's called 'Access Control Allow Origin'. So to connect localhost we need to do something called CORS(the error message is "set the request's mode to no-cors")
// The same-origin policy is an important concept in the web application security model. Under the policy, a web browser permits scripts contained in a first web page to access data in a second web page, but only if both web pages have the same origin. An origin is defined as a combination of URI scheme, host name, and port number. This policy prevents a malicious script on one page from obtaining access to sensitive data on another web page through that page's Document Object Model...  (https://en.wikipedia.org/wiki/Same-origin_policy)
//https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1', //127.0.0.1 = localhost
    user : 'marta',
    password : 'test',
    database : 'smart-brain'
  }
});

db.select('*').from('users').then(data => {
  // console.log(data)
});


const app = express();

app.use(bodyParser.json());
app.use(cors());


app.get('/', (req, res) => {
  res.send(database.users);
})


app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(req.body.password, data[0].hash); // comparing imputed password with the hash //return true or false
    if (isValid) {
      return db.select('*').from('users')
      .where('email', '=', req.body.email)
      .then(user => {
        res.json(user[0])  //user is an object so it has to be added [0] 
      })
      .catch(err => res.status(400).json('unable to get user'))
    } else {
    res.status(400).json('wrong credentials')
    }
  })
  .catch(err => res.status(400).json('wrong credentials'))
})


app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {   // transaction to do more than two things at once // then has to use "trx" insted of "db"
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')  // insetring hash and email into login table
    .returning('email') // returning email
    .then(loginEmail => { // now we are using email as loginEmail
      console.log("typeof loginEmail  ", typeof loginEmail[0]);
      return trx('users') // returning another trx transaction
        .returning('*')
        .insert({   // and interint to the users table
          email: loginEmail[0], // loginEmail is an object so we have to add [0] to change it into a string
          name: name,
          joined: new Date()
        })
        .then(user => {     // response with json
          res.json(user[0]);  
        })
    })
    .then(trx.commit) // to add everything we have to commit
    .catch(trx.rollback)  // if anything fals it rollback the changes
  })
    .catch(err => res.status(400).json('unable to register'))
})


app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if (user.length) {  // if there isn't an empty array
        res.json(user[0]);
      } else {
        res.status(400).json('Not found');
      }
    })
    .catch(err => res.status(400).json('error getting user'))
})


app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)  //increment by 1
  .returning('entries')
  .then(entries => res.json(entries[0]))
  .catch(err => res.status(400).json('unable to get entries'))
})







app.listen(3000, () => {
  console.log('app is runnng on port 3000');
})

/*
/         --> res = this is working
/signin   --> POST = succes/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user(update/count)
*/