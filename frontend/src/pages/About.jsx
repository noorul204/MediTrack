function About() {
  return (
    <div className="about-page">

      {/* About Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About MediTrack</h1>

          <p>
            Making healthcare management simple, accessible,
            and convenient for everyone.
          </p>
        </div>
      </section>

      {/* About MediTrack */}
      <section className="about-section">

        <div className="about-content">

          <div className="about-text">
            <h2>What is MediTrack?</h2>

            <p>
              MediTrack is a healthcare management platform designed
              to make it easier for patients and doctors to manage
              healthcare services in one place.
            </p>

            <p>
              Patients can discover doctors, view their information,
              book appointments, and manage their healthcare details
              through a simple and user-friendly platform.
            </p>

            <p>
              Our goal is to reduce the complexity of healthcare
              management and provide a convenient digital experience
              for both patients and healthcare professionals.
            </p>
          </div>

          <div className="about-box">
            <div className="about-icon">🏥</div>
            <h3>Healthcare Made Simple</h3>
            <p>
              Connecting patients and healthcare professionals
              through technology.
            </p>
          </div>

        </div>

      </section>

      {/* Mission & Vision */}
      <section className="mission-section">

        <h2>Our Mission & Vision</h2>

        <div className="mission-container">

          <div className="mission-card">
            <div className="mission-icon">🎯</div>

            <h3>Our Mission</h3>

            <p>
              To simplify healthcare management by providing
              an easy-to-use platform that helps patients connect
              with doctors and manage their appointments efficiently.
            </p>
          </div>

          <div className="mission-card">
            <div className="mission-icon">🌟</div>

            <h3>Our Vision</h3>

            <p>
              To create a connected healthcare experience where
              technology makes quality healthcare easier to access
              and manage.
            </p>
          </div>

        </div>

      </section>

      {/* Why MediTrack */}
      <section className="why-section">

        <h2>Why Choose MediTrack?</h2>

        <div className="why-container">

          <div className="why-card">
            <span>👨‍⚕️</span>
            <h3>Qualified Doctors</h3>
            <p>
              Find experienced healthcare professionals
              across different specialties.
            </p>
          </div>

          <div className="why-card">
            <span>📅</span>
            <h3>Easy Booking</h3>
            <p>
              Manage your appointments conveniently
              from one platform.
            </p>
          </div>

          <div className="why-card">
            <span>🔒</span>
            <h3>Secure Platform</h3>
            <p>
              Designed with patient privacy and secure
              healthcare management in mind.
            </p>
          </div>

          <div className="why-card">
            <span>💻</span>
            <h3>Easy to Use</h3>
            <p>
              A simple and user-friendly experience
              for patients and doctors.
            </p>
          </div>

        </div>

      </section>

    </div>
  )
}

export default About