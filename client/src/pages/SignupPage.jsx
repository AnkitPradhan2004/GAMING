import { useState } from 'react'
import logo from '../assets/logo.jpg'
import './AuthPage.css'

const SignupPage = ({ onLogin, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    otp: ''
  })
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:3000/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      })
      
      if (response.ok) {
        setStep('otp')
        alert('OTP sent successfully!')
      } else {
        alert('Failed to send OTP')
      }
    } catch (error) {
      alert('Error sending OTP')
    }
    
    setLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:3000/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.phone, 
          otp: formData.otp,
          name: formData.name 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('token', data.token)
        onLogin(data.user)
      } else {
        alert(data.error || 'Invalid OTP')
      }
    } catch (error) {
      alert('Error verifying OTP')
    }
    
    setLoading(false)
  }

  const handleGoogleSignup = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img src={logo} alt="AURA 999+" className="auth-logo" />
          <h1>Join AURA 999+</h1>
          <p>Create your account and start winning today</p>
        </div>

        <div className="auth-form">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary full-width" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary full-width" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary full-width"
                onClick={() => setStep('phone')}
              >
                Change Details
              </button>
            </form>
          )}

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="btn-google" onClick={handleGoogleSignup}>
            <span>🔍</span>
            Sign up with Google
          </button>

          <div className="auth-switch">
            <p>Already have an account? 
              <button onClick={onSwitchToLogin} className="link-btn">Login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage