
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid admin credentials");
        return;
      }

      localStorage.setItem("mediTrackAdminToken", data.token);
      localStorage.setItem("mediTrackUser", JSON.stringify(data.user));

      window.dispatchEvent(new Event("mediTrackAuthChange"));
      navigate("/admin-dashboard");
    } catch (err) {
      setError("Cannot connect to the server. Please start the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <p className="admin-eyebrow">MEDTRACK ADMINISTRATION</p>
        <h2>Admin Login</h2>
        <p>Sign in to manage the MediTrack platform.</p>

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
