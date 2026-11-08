import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>PureNest Clean Co.</h3>
            <p>Professional home, office and Airbnb cleaning across Dubai, Abu Dhabi, Riyadh and Doha. Trained, insured and background-checked teams.</p>
            <p>WhatsApp: +91 78765 20226<br />Email: goyalkumar.work@gmail.com</p>
          </div>
          <div>
            <h4>Explore</h4>
            <p><a href="#services-section">Services</a><br /><a href="#estimator">Instant Price</a><br /><a href="#booking">Book a Clean</a><br /><a href="#pricing">Pricing &amp; Plans</a><br /><a href="#reviews-section">Reviews</a></p>
          </div>
          <div>
            <h4>Company</h4>
            <p><Link to="/admin">Admin Login</Link><br /><a href="#my-bookings">My Bookings</a><br /><a href="#chat">Talk to Mia</a><br /><a href="#areas">Areas Covered</a></p>
          </div>
        </div>
        <div className="footer-bottom">© 2026 PureNest Clean Co. All rights reserved. By Goyal Kumar</div>
      </div>
    </footer>
  )
}
