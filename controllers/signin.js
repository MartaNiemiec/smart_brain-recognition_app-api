const handleSignin = (db, bcrypt) => (req, res) => {  // function returning another function and then run everythong below
  const { email, password } = req.body;
  if (!email || !password) { // when email, name or password input will be empty
    return res.status(400).json('incorrect form submission');
  }
  db.select('email', 'hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
    const isValid = bcrypt.compareSync(password, data[0].hash); // comparing imputed password with the hash //return true or false
    if (isValid) {
      return db.select('*').from('users')
      .where('email', '=', email)
      .then(user => {
        res.json(user[0])  //user is an object so it has to be added [0] 
      })
      .catch(err => res.status(400).json('unable to get user'))
    } else {
    res.status(400).json('wrong credentials')
    }
  })
  .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = { handleSignin }