const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const mongoose = require('./config/db');
const app = express();
const expressSession = require('express-session');
const passport = require('./config/passport');
const flash = require('connect-flash'); 
const blogRoutes = require('./routes/blogRoutes');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({ secret: 'my secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error'); 
  next();
});


app.set('view engine', 'ejs');


app.use('/', userRoutes);
app.use('/', userRoutes);
app.use('/', blogRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/login`);
});
