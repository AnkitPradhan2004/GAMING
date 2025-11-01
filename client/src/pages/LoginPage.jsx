import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { API_BASE_URL } from "../config/api";
import "./AuthPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("Error logging in");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Back to Home
      </button>
      <div className="auth-container">
        <div className="auth-header">
          <img src={logo} alt="AURA 999+" className="auth-logo" />
          <h1>Welcome Back</h1>
          <p>Login to continue your winning journey</p>
        </div>

        <div className="auth-form">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              Don't have an account?
              <button onClick={() => navigate("/signup")} className="link-btn">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
