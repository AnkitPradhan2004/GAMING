import { useState } from 'react'
import logo from '../assets/logo.jpg'
import './AuthPage.css'

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
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
          otp: formData.otp 
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

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img src={logo} alt="AURA 999+" className="auth-logo" />
          <h1>Welcome Back</h1>
          <p>Login to continue your winning journey</p>
        </div>

        <div className="auth-form">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
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
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary full-width"
                onClick={() => setStep('phone')}
              >
                Change Phone Number
              </button>
            </form>
          )}

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="btn-google" onClick={handleGoogleLogin}>
            <span>🔍</span>
            Continue with Google
          </button>

          <div className="auth-switch">
            <p>Don't have an account? 
              <button onClick={onSwitchToSignup} className="link-btn">Sign Up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage