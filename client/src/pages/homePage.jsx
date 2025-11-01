import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import CustomerChat from "../components/CustomerChat";
import "../App.css";

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token and get user data
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("https://gaming-102m.onrender.com/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem("token");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <img src={logo} alt="AURA 999+" className="logo" />
            <div className="nav-links">
              <button onClick={() => scrollToSection("home")}>Home</button>
              <button onClick={() => scrollToSection("features")}>Games</button>
              <button onClick={() => scrollToSection("stats")}>Stats</button>
              <button onClick={() => scrollToSection("cta")}>Contact</button>
            </div>
            <div className="auth-buttons">
              {user ? (
                <>
                  <span className="user-name">Hi, {user.name}</span>
                  <button className="btn-secondary" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => navigate("/signup")}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="highlight">AURA 999+</span>
            </h1>
            <p className="hero-subtitle">
              The Ultimate Betting Experience - Where Fortune Meets Strategy
            </p>
            <div className="hero-buttons">
              <button
                className="btn-primary large"
                onClick={() => (user ? navigate("/game") : navigate("/login"))}
              >
                Start Playing
              </button>
              <button className="btn-outline large">Watch Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Why Choose AURA 999+?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Real-Time Gaming</h3>
              <p>Experience live multiplayer betting with instant results</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Secure Wallet</h3>
              <p>Safe deposits and withdrawals with multiple payment options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Big Wins</h3>
              <p>Compete for massive jackpots and exclusive rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Active Players</p>
            </div>
            <div className="stat-item">
              <h3>₹10M+</h3>
              <p>Total Winnings</p>
            </div>
            <div className="stat-item">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" id="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Win Big?</h2>
            <p>
              Join thousands of players and start your winning journey today!
            </p>
            <button
              className="btn-primary large"
              onClick={() => (user ? navigate("/game") : navigate("/login"))}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src={logo} alt="AURA 999+" className="footer-logo" />
              <p>The ultimate destination for online betting and gaming.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#games">Games</a>
              <a href="#about">About Us</a>
              <a href="#support">Support</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#terms">Terms of Service</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#responsible">Responsible Gaming</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 AURA 999+. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CustomerChat />
    </div>
  );
}

export default HomePage;
