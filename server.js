const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors'); // when we need to communicate with outside word using HTTP then Chrome for security reason are blocking the connection. And that's called 'Access Control Allow Origin'. So to connect localhost we need to do something called CORS(the error message is "set the request's mode to no-cors")
// The same-origin policy is an important concept in the web application security model. Under the policy, a web browser permits scripts contained in a first web page to access data in a second web page, but only if both web pages have the same origin. An origin is defined as a combination of URI scheme, host name, and port number. This policy prevents a malicious script on one page from obtaining access to sensitive data on another web page through that page's Document Object Model...  (https://en.wikipedia.org/wiki/Same-origin_policy)
//https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS


const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date()
    }
  ]
}


app.get('/', (req, res) => {
  res.send(database.users);
})


app.post('/signin', (req, res) => {
  // Load hash from your password DB.
  bcrypt.compare("apples", '$2a$10$Zm46r4vz7R2HYW7/4pVDeeNAi8FScQOvHoF1Bqrd1tW/zpwEghKVm', function(err, res) {
    // res == true
    console.log('first quess', res);
  });
  bcrypt.compare("veggies", '$2a$10$Zm46r4vz7R2HYW7/4pVDeeNAi8FScQOvHoF1Bqrd1tW/zpwEghKVm', function(err, res) {
    // res == false
    console.log('second quess', res);
  });
  if (req.body.email === database.users[0].email && 
      req.body.password === database.users[0].password) {
    // res.json('success')
    res.json(database.users[0]);
  } else {
    res.status(400).json('error loggin in')
  }
  // res.send('signing')
  res.json('signing')
})


app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  // bcrypt.hash(password, null, null, function(err, hash) {
  //  // Store hash in your password DB.
  //   console.log(hash);
  // });
  database.users.push({
      id: '125',
      name: name,
      email: email,
      entries: 0,
      joined: new Date()
  })
  res.json(database.users[database.users.length-1]);
})


app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  })
  if (!found) {
    res.status(400),json('not found');
  }
})


app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  })
  if (!found) {
    res.status(400),json('not found');
  }
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