import { useState } from 'react'
import './CustomerChat.css'

const CustomerChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm here to help with withdrawal, deposit, or betting issues. How can I assist you?", sender: 'support', time: new Date().toLocaleTimeString() }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const quickIssues = [
    'Withdrawal Problem',
    'Deposit Issue', 
    'Betting Error',
    'Account Balance',
    'Game Not Loading',
    'Contact Human Support'
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    
    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    }
    
    setMessages([...messages, newMessage])
    setInputMessage('')
    
    setTimeout(() => {
      let reply = "Thank you for contacting us. Our team will assist you shortly."
      
      if (inputMessage.toLowerCase().includes('withdraw')) {
        reply = "For withdrawal issues, please provide your transaction ID. Processing time is 24-48 hours. If urgent, call: +91-9876543210"
      } else if (inputMessage.toLowerCase().includes('deposit')) {
        reply = "For deposit issues, please check your payment method and try again. Contact your bank if needed. Support: +91-9876543210"
      } else if (inputMessage.toLowerCase().includes('bet')) {
        reply = "For betting issues, please provide the game ID and bet amount. We'll investigate immediately. Urgent help: +91-9876543210"
      } else if (inputMessage.toLowerCase().includes('not resolved') || inputMessage.toLowerCase().includes('still issue')) {
        reply = "I understand your concern. Please contact our human support team directly at +91-9876543210 (24/7 available) or email: support@aura999.com"
      }
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: reply,
        sender: 'support',
        time: new Date().toLocaleTimeString()
      }])
    }, 1000)
  }

  const handleQuickIssue = (issue) => {
    setInputMessage(`I need help with: ${issue}`)
  }

  return (
    <>
      <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h4>Customer Support</h4>
          <button onClick={() => setIsOpen(!isOpen)} className="chat-toggle">
            {isOpen ? '✕' : '💬'}
          </button>
        </div>
        
        {isOpen && (
          <div className="chat-body">
            <div className="quick-issues">
              {quickIssues.map((issue, index) => (
                <button 
                  key={index}
                  onClick={() => handleQuickIssue(issue)}
                  className="quick-issue-btn"
                >
                  {issue}
                </button>
              ))}
            </div>
            
            <div className="messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{message.time}</div>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
      
      {!isOpen && (
        <button 
          className="chat-fab"
          onClick={() => setIsOpen(true)}
        >
          💬
        </button>
      )}
    </>
  )
}

export default CustomerChat