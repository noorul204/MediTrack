function Contact() {
  return (
    <div className="contact-page">

      {/* Contact Header */}
      <section className="contact-hero">
        <h1>Contact Us</h1>

        <p>
          We're here to help. Get in touch with the MediTrack team.
        </p>
      </section>

      {/* Contact Content */}
      <section className="contact-section">

        <div className="contact-container">

          {/* Contact Information */}
          <div className="contact-info">

            <h2>Get in Touch</h2>

            <p>
              Have a question, suggestion, or need help with MediTrack?
              We'd love to hear from you.
            </p>

            <div className="contact-item">
              <span>📧</span>
              <div>
                <h3>Email</h3>
                <p>support@meditrack.com</p>
              </div>
            </div>

            <div className="contact-item">
              <span>📞</span>
              <div>
                <h3>Phone</h3>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="contact-item">
              <span>📍</span>
              <div>
                <h3>Address</h3>
                <p>Madurai, Tamil Nadu, India</p>
              </div>
            </div>

            <div className="contact-item">
              <span>🕒</span>
              <div>
                <h3>Working Hours</h3>
                <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="contact-form-container">

            <h2>Send Us a Message</h2>

            <form>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="5"
                  placeholder="Write your message..."
                ></textarea>
              </div>

              <button type="submit" className="contact-button">
                Send Message
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  )
}

export default Contact