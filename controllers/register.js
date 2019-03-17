const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) { // when email, name or password input will be empty
    return res.status(400).json('incorrect form submission');
  }
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
}

module.exports = { handleRegister }