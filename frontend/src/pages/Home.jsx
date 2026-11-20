
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [backendMessage, setBackendMessage] = useState("Connecting to backend...");
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/test")
      .then((response) => {
        if (!response.ok) throw new Error("Backend error");
        return response.json();
      })
      .then((data) => {
        setBackendMessage(data.message);
        setBackendConnected(true);
      })
      .catch(() => {
        setBackendMessage("Backend connection failed");
        setBackendConnected(false);
      });
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">🩺 YOUR HEALTHCARE PARTNER</span>

          <h1>
            Your Health,
            <span> Our Priority.</span>
          </h1>

          <p>
            Find trusted doctors, book appointments effortlessly,
            and take control of your healthcare journey with MediTrack.
          </p>

          <div className="hero-buttons">
            <Link to="/doctors" className="primary-btn">
              Find a Doctor →
            </Link>

            <Link to="/appointment" className="secondary-btn">
              Book Appointment
            </Link>
          </div>

          <div className="backend-status">
            <span className={backendConnected ? "status-dot online" : "status-dot offline"}></span>
            <span>
              {backendConnected ? "Backend Connected" : backendMessage}
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            <span className="hero-medical-icon">🩺</span>
          </div>
          <div className="floating-card">
            <span>💚</span>
            <div>
              <strong>Your Health Matters</strong>
              <small>Care made simpler</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span>OUR SERVICES</span>
          <h2>Why Choose MediTrack?</h2>
          <p>Everything you need for a simpler healthcare experience.</p>
        </div>

        <div className="feature-container">
          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Expert Doctors</h3>
            <p>Connect with qualified and experienced healthcare professionals.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Appointments</h3>
            <p>Book and manage your doctor appointments with ease.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Medical Records</h3>
            <p>Keep your medical information organized in one place.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Healthcare</h3>
            <p>Access your healthcare services through your account.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-heading">
          <span>GET STARTED</span>
          <h2>How MediTrack Works</h2>
          <p>Three simple steps to manage your healthcare.</p>
        </div>

        <div className="steps">
          <div className="step">
            <span className="step-number">01</span>
            <h3>Find a Doctor</h3>
            <p>Explore doctors and choose a suitable specialization.</p>
          </div>

          <div className="step">
            <span className="step-number">02</span>
            <h3>Book Appointment</h3>
            <p>Select a doctor and submit your appointment request.</p>
          </div>

          <div className="step">
            <span className="step-number">03</span>
            <h3>Manage Your Care</h3>
            <p>Track your appointments through your dashboard.</p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <h2>Take the First Step Towards Better Healthcare</h2>
        <p>Join MediTrack and make managing appointments easier.</p>
        <Link to="/register">Get Started Today →</Link>
      </section>
    </div>
  );
}

export default Home;
