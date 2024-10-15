const express = require('express');
const passport = require('passport');
const {
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
    forgetPasswordController,
    forgetPasswordPostController,
    page404Controller
} = require('../controllers/userController');

const router = express.Router();

router.get('/signup', signupController);
router.post('/signup', postSignupController);

router.get('/login', loginController);
router.post('/login', postLoginController);

router.get('/dashboard', ensureAuthenticated, dashboardController);
router.get('/profile', ensureAuthenticated, profileController);

router.get('/logout', ensureAuthenticated, logout );

router.get('/update-pass',ensureAuthenticated, updatePass);
router.post('/update-pass',ensureAuthenticated,postUpdatePass);

// Forget Password Validate
router.get('/forget-password-validate', forgetPasswordValidateController);
router.post('/forget-password-post-validate', forgetPasswordValidatePostController);

// router.get('/forget-password', forgetPasswordController); [ Not Used ]
// router.post('/forget-password-post', forgetPasswordPostController); [ Not Used ]
router.get('/forget-password/:id',forgetPasswordController); // [ Link Route ]
router.post('/forget-password-post/:id', forgetPasswordPostController); // [ Link Route ]

// Page404
router.get('/page404', page404Controller);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
