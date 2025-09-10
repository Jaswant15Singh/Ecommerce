const bcrypt = require('bcryptjs'); // Use bcryptjs for hashing the password

module.exports.hashPassword = async (password) => {
  const saltRounds = 10; // Number of salt rounds to use
  const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password
  return hashedPassword; // Return the hashed password
};


module.exports.isAuthenticated =(req, res, next)=> {
  if (req.session && req.session.user) {
    console.log("req.session:", req.session);
    console.log("req.session.user:", req.session.user);
    return next();  // Proceed if the user is authenticated
  } else {
    res.redirect('/admin/login');  // Redirect to login if not authenticated
  }
}

