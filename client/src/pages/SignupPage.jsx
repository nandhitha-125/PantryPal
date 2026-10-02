import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./AuthPages.css";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "female",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordCriteria = {
    hasCapital: /[A-Z]/.test(formData.password),
    hasMinLen: formData.password.length >= 8,
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please ensure your password meets all 4 security criteria.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signup(
        formData.name,
        formData.email,
        formData.mobile,
        formData.password,
        formData.gender
      );
      navigate("/app/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">🥬</span>
            <span className="auth-logo-text">
              Pantry<span className="auth-brand-accent">Pal</span>
            </span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start managing your pantry smarter</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-gender">Gender</label>
            <select
              id="signup-gender"
              name="gender"
              className="auth-select"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-mobile">Mobile Number</label>
            <input
              id="signup-mobile"
              name="mobile"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.mobile}
              onChange={handleChange}
              required
              autoComplete="tel"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />

            {/* Password Security Criteria Checklist */}
            <div className="password-criteria-box">
              <span className="criteria-box-title">Password must contain:</span>
              <ul className="criteria-list">
                <li className={passwordCriteria.hasCapital ? "met" : ""}>
                  <span className="criteria-icon">{passwordCriteria.hasCapital ? "✓" : "○"}</span>
                  At least 1 capital letter (A-Z)
                </li>
                <li className={passwordCriteria.hasMinLen ? "met" : ""}>
                  <span className="criteria-icon">{passwordCriteria.hasMinLen ? "✓" : "○"}</span>
                  Minimum length of 8 characters
                </li>
                <li className={passwordCriteria.hasSpecial ? "met" : ""}>
                  <span className="criteria-icon">{passwordCriteria.hasSpecial ? "✓" : "○"}</span>
                  At least 1 special character (!@#$%...)
                </li>
                <li className={passwordCriteria.hasNumber ? "met" : ""}>
                  <span className="criteria-icon">{passwordCriteria.hasNumber ? "✓" : "○"}</span>
                  At least 1 number (0-9)
                </li>
              </ul>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || !isPasswordValid}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

