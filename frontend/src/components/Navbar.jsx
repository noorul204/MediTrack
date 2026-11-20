
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mediTrackUser") || "null");
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      try {
        setUser(
          JSON.parse(localStorage.getItem("mediTrackUser") || "null")
        );
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("mediTrackAuthChange", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("mediTrackAuthChange", updateUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mediTrackUser");
    setUser(null);
    window.dispatchEvent(new Event("mediTrackAuthChange"));
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        MediTrack<span>+</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/doctors" className={linkClass}>
          Doctors
        </NavLink>

        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>

        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>
      </div>

      <div className="nav-actions">
        {user ? (
          <>
            {user.role === "patient" && (
              <>
                <NavLink to="/appointment" className={linkClass}>
                  Book Appointment
                </NavLink>

                <NavLink to="/dashboard" className={linkClass}>
                  My Dashboard
                </NavLink>
              </>
            )}

            {user.role === "doctor" && (
              <NavLink to="/doctor-dashboard" className={linkClass}>
                Doctor Dashboard
              </NavLink>
            )}

            <button
              className="nav-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>

            <NavLink to="/register" className="nav-register">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
