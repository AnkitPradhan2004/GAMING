const express = require('express');
const passport = require('passport');
const { googleAuth, sendPhoneOTP, verifyPhoneOTP } = require('../controllers/authController');

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuth
);

// Phone OTP routes
router.post('/phone/send-otp', sendPhoneOTP);
router.post('/phone/verify-otp', verifyPhoneOTP);

module.exports = router;