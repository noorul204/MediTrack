
import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialization: "",
    qualification: "",
    experience: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    if (formData.role === "doctor" && !formData.specialization.trim()) {
      setMessage("Please enter your specialization.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience || 0,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Account created successfully! 🎉");

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "patient",
          specialization: "",
          qualification: "",
          experience: "",
        });
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      setMessage("Unable to connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-icon">
          🩺
        </div>

        <h1>Create Your Account</h1>

        <p className="register-subtitle">
          Join MediTrack and manage your healthcare easily
        </p>

        <form onSubmit={handleSubmit}>

          <div className="register-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

          <div className="register-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Register As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {formData.role === "doctor" && (
            <>
              <div className="register-form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  placeholder="e.g. Cardiologist"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-form-group">
                <label>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. MBBS, MD"
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </div>

              <div className="register-form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  placeholder="Enter experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        <p className="login-text">
          Already have an account?{" "}
          <a href="/login">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}

export default Register;
