import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* 1. SaaS Marketing Navigation Bar */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" className="landing-leaf-svg">
                <path
                  d="M12 3V6M8.5 4.5L10 6.5M15.5 4.5L14 6.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 10C4 8.89543 4.89543 8 6 8H18C19.1046 8 20 8.89543 20 10V10.5C20 15.5 16.5 20 12 20C7.5 20 4 15.5 4 10.5V10Z"
                  fill="currentColor"
                  fillOpacity="0.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 13C9.5 14.5 10.5 15.5 12 15.5C13.5 15.5 14.5 14.5 15 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="landing-brand-text">
              Pantry<span className="brand-accent">Pal</span>
            </span>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-item">Features</a>
            <a href="#how-it-works" className="landing-nav-item">How it Works</a>
            <a href="#impact" className="landing-nav-item">Impact</a>
          </nav>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn-landing-cta"
              onClick={() => navigate("/signup")}
            >
              Launch App →
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="hero-pill-tag">
            <span className="hero-dot"></span>
            <span>Your Smart Pantry Companion</span>
          </div>

          <h1 className="hero-title display-title">
            Eat fresher. Waste less.<br />
            <span className="hero-highlight">Master your kitchen.</span>
          </h1>

          <p className="hero-description">
            PantryPal is the intelligent food-tech platform that tracks shelf-life, eliminates food waste, suggests delicious chef-quality recipes from ingredients you already have, and keeps your shopping effortless.
          </p>

          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={() => navigate("/login")}
            >
              Browse Recipe Engine
            </button>
          </div>

          {/* Social Proof / Stats Ticker */}
          <div id="how-it-works" className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-number">40%</span>
              <span className="stat-label">Average Food Waste Cut</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">$1,500</span>
              <span className="stat-label">Saved Per Family / Year</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Recipes Instantly Matched</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup: Clean Food-Tech UI Composition */}
        <div className="landing-hero-visual">
          <div className="mockup-frame">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="mockup-title">PantryPal Live Preview</span>
            </div>

            <div className="mockup-body">
              {/* Card 1: Fresh Item Card */}
              <div className="mockup-card">
                <div className="mockup-card-left">
                  <div className="mockup-icon-leaf">🥬</div>
                  <div>
                    <div className="mockup-item-name">Organic Baby Spinach</div>
                    <div className="mockup-item-meta">Produce • 200g</div>
                  </div>
                </div>
                <span className="badge badge-fresh">
                  <span className="status-dot"></span> Fresh
                </span>
              </div>

              {/* Card 2: Expiring Alert Card */}
              <div className="mockup-card highlight-card">
                <div className="mockup-card-left">
                  <div className="mockup-icon-leaf">🥛</div>
                  <div>
                    <div className="mockup-item-name">Greek Whole Milk</div>
                    <div className="mockup-item-meta">Dairy & Eggs • 1L</div>
                  </div>
                </div>
                <span className="badge badge-expiring">
                  <span className="status-dot"></span> 2d left
                </span>
              </div>

              {/* Card 3: Recipe Recommendation Pill */}
              <div className="mockup-recipe-banner">
                <div className="mockup-recipe-badge">✨ Smart Recipe Match</div>
                <p className="mockup-recipe-text">
                  You have <strong>Spinach & Milk</strong>! Make <em>Creamy Garlic Tuscan Pasta</em> tonight.
                </p>
                <div className="mockup-ingredients-tag">
                  <span>✓ 3 in pantry</span>
                  <span>+ 1 staple needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <span className="section-eyebrow">INTELLIGENT WORKFLOW</span>
          <h2 className="section-title display-title">
            Built for modern households who value fresh food
          </h2>
          <p className="section-subtitle">
            Say goodbye to forgotten items rotting in the crisper drawer. PantryPal keeps your pantry organized, smart, and fully connected.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h3 className="feature-title">Smart Inventory Tracking</h3>
            <p className="feature-desc">
              Organize every ingredient by category, custom quantity, and storage unit. Fast search and quick categorization keep stock clear at a glance.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon-box warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
            <h3 className="feature-title">Expiry Monitoring</h3>
            <p className="feature-desc">
              Proactive warning tiers highlight items before they spoil. Avoid costly grocery waste and know exactly what needs to be cooked first.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M17.66 12.34l1.41-1.41M12 22a7 7 0 0 0 7-7c0-2-1.2-3-2-4.5-.8-1.5-1-2.5-1-4.5H8c0 2-.2 3-1 4.5-.8 1.5-2 2.5-2 4.5a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <h3 className="feature-title">Recipe Discovery</h3>
            <p className="feature-desc">
              Powered by Spoonacular, PantryPal cross-references your live stock to recommend delicious meals. Cook what you have with zero guesswork.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h3 className="feature-title">Integrated Shopping List</h3>
            <p className="feature-desc">
              Never forget an essential. Keep an active shopping checklist with instant quantity tracking and one-tap restock directly back to your pantry.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Band */}
      <section id="impact" className="landing-cta-band">
        <div className="cta-band-inner">
          <h2 className="cta-band-title display-title">
            Ready to transform the way you cook and shop?
          </h2>
          <p className="cta-band-subtitle">
            Join thousands of smart cooks saving time, money, and food every single week.
          </p>
          <button
            type="button"
            className="btn-hero-primary"
            onClick={() => navigate("/signup")}
          >
            Launch PantryPal Now →
          </button>
        </div>
      </section>

      {/* 5. Minimal Tasteful Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-left">
            <span className="footer-brand">PantryPal</span>
            <span className="footer-copy">© 2026 PantryPal Technologies. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <Link to="/app/inventory">Inventory</Link>
            <Link to="/app/expiring">Expiring Soon</Link>
            <Link to="/app/recipes">Recipe Ideas</Link>
            <Link to="/app/shopping-list">Shopping List</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
