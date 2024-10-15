const user = require('../models/userModel');
const bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 10;
const randomstring = require('randomstring');
const transporter = require('../config/nodemailer')

// Registration page
const signupController = (req, res) => {
    res.render('signup');
}

// Handle registration form
const postSignupController = async (req, res) => {
    if (req.body.password === req.body.confirmPassword) {
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        const userData = {
            fname: req.body.fname,
            email: req.body.email,
            password: hash
        }
        const newUser = new user(userData);
        await newUser.save();

        res.redirect('/login');
    } else {
        res.send('Passwords do not match');
    }
}

// Login page
const loginController = (req, res) => {
    res.render('login');
}

// Handle login with Passport.js
const postLoginController = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
});

// Dashboard page after login
const dashboardController = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.user });
}

// Profile page
const profileController = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('profile', { user: req.user });
}

const logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
};

const updatePass = (req, res) => {
    res.render('update-pass');
}

const postUpdatePass = async(req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        console.log('Missing fields during password change');
        req.flash('error', 'Missing fields during password change');
        return res.redirect('/change-password');
    }

    if (newPassword !== confirmPassword) {
        console.log('Passwords do not match');
        req.flash('error', 'Passwords do not match');
        return res.redirect('/change-password');
    }

    // Check if user exists
    const existingUser = req.user;
    if (!existingUser) {
        console.log('User not found');
        req.flash('error', 'User not found');
        return res.redirect('/signup');
    }

    try {
        const isMatch = await bcrypt.compare(oldPassword, existingUser.password);
        if (!isMatch) {
            console.log('Incorrect old password');
            req.flash('error', 'Incorrect old password');
            return res.redirect('/change-password');
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        existingUser.password = hashedPassword;

        await existingUser.save();

        console.log('Password changed successfully', existingUser);

        req.flash('success', 'Password changed successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.log('Error during password change:', err);
        req.flash('error', 'Error during password change');
        res.redirect('/change-password');
    }

}

// Forget Password Controllers
const forgetPasswordValidateController = (req, res) => res.render('forget-password-validate');

const forgetPasswordValidatePostController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.log('Email is required');
    req.flash('error', 'Email is required');
    return res.redirect('/forget-password-validate');
  }

  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      console.log('User not found');
      req.flash('error', 'User not found');
      return res.redirect('/signup');
    }

    const resetLink = `http://localhost:3000/forget-password/${existingUser._id}`; // Instead of OTP

    const token = randomstring.generate(10);
    existingUser.token = token;
    await existingUser.save();
    console.log('User token:', existingUser.token);

    // Generate and send OTP [ Not Used ]
    // OTP = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    // console.log('OTP generated:', OTP);

    console.log('Reset Link: ', resetLink);

    let mailOptions = {
      from: 'rb063257@gmail.com',
      to: existingUser.email,
      subject: 'Password Reset Link',
      text: `Please! click on this link to reset your password:
        <a href="${resetLink}">Reset Password</a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {

        console.log("Please check your email", error);
        req.flash('error', 'Please check your email');
        return res.redirect('/forget-password-validate');
      }
      console.log(`Message is sent on ${existingUser.email}`);
      req.flash('success', 'Please check your email');

    });

    return res.redirect(`/forget-password-validate`);
  } catch (err) {
    console.log('Error finding user:', err);
    req.flash('error', 'User not exists');
    return res.redirect('/forget-password-validate');
  }
};

// OTP Validate [ Not Used ]
// const otpValidateController = (req, res) => res.render('otp-validate');

// const otpValidatePostController = (req, res) => {
//   const { otp } = req.body;

//   if (!otp) {
//     console.log('OTP is required');
//     return res.redirect('/otp-validate');
//   }

//   if (otp !== OTP) {
//     console.log('Invalid OTP');
//     return res.redirect('/otp-validate');
//   }

//   console.log('OTP validated successfully');
//   res.redirect('/forget-password');
// };

// Forget Password Page
const forgetPasswordController = async (req, res) => {
  const userId = req.params.id;

  try {
    const existingUser = await user.findById(userId);

    //Check if token is valid and not null
    if (!existingUser.token) {
      console.log('Token is not valid or expired');
      req.flash('error', 'Link is not valid or expired');
      return res.redirect('/page404');
    }
    console.log('Token Validated:', existingUser.token);


    if (!existingUser) {
      console.log('User not found');
      req.flash('error', 'User not found');
      return res.redirect('/page404');
    }

    return res.render('forget-password', { userId });
  } catch (err) {
    console.log('Error finding user:');
    req.flash('error', 'User not found');
    return res.redirect('/page404');
  }
};

// Forget Password Post Controller
const forgetPasswordPostController = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const userId = req.params.id;

  if (!password || !confirmPassword) {
    console.log('Missing fields during password change');
    req.flash('error', 'Missing fields during password change');
    return res.redirect(`/forget-password/${userId}`);
  }

  if (password !== confirmPassword) {
    console.log('Passwords do not match');
    req.flash('error', 'Passwords do not match');
    return res.redirect(`/forget-password/${userId}`);
  }

  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      console.log('User not found');
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }

    // Now set token to null
    existingUser.token = null;
    console.log('Token Expired:', existingUser.token);

    existingUser.password = await bcrypt.hash(password, saltRounds);
    await existingUser.save();

    console.log('Password changed successfully', existingUser);
    req.flash('success', 'Password changed successfully');
    res.redirect('/login');
  } catch (err) {
    console.log('Error during password change:', err);
    req.flash('error', 'Error during password change');
    return res.redirect(`/forget-password/${userId}`);
  }
};

// Page404 Controller
const page404Controller = (req, res) => {
  req.flash('error', 'Page not found');
  res.render('page404');
}


module.exports = {
    signupController,
    postSignupController,
    loginController,
    postLoginController,
    dashboardController,
    profileController,
    logout,
    updatePass,
    postUpdatePass,
    forgetPasswordValidateController,
    forgetPasswordValidatePostController,
    // otpValidateController, [ Not Used ]
    // otpValidatePostController, [ Not Used ]
    forgetPasswordController,
    forgetPasswordPostController,
    page404Controller
};
