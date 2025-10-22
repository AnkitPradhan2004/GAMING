const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateToken } = require('../utils/jwt');
const { sendOTP } = require('../utils/twilio');

const googleAuth = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.deleteMany({ phone });
    await OTP.create({ phone, otp });
    
    const sent = await sendOTP(phone, otp);
    
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    
    const otpRecord = await OTP.findOne({ phone, otp });
    
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ phone });
    
    if (!user) {
      user = await User.create({ phone, name: name || 'User' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });
    
    const token = generateToken(user._id);
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { googleAuth, sendPhoneOTP, verifyPhoneOTP };