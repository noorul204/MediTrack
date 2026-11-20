
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function PatientDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = JSON.parse(
    localStorage.getItem("mediTrackUser") || "null"
  );

  useEffect(() => {
    if (!user || user.role !== "patient") {
      setMessage("Please log in with your patient account.");
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:5000/api/appointments/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load appointments");
        }
        return response.json();
      })
      .then((data) => {
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Unable to load appointments. Please try again.");
        setLoading(false);
      });
  }, [user?.id, user?.role]);

  if (!user || user.role !== "patient") {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Patient Dashboard</h1>
          <p>{message}</p>
          <button
            className="login-submit"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctors-page">
      <section className="doctors-header">
        <h1>Welcome, {user.name}! 👋</h1>
        <p>Your personal healthcare dashboard</p>

        <Link to="/appointment">
          <button>+ Book New Appointment</button>
        </Link>
      </section>

      <section className="doctor-section">
        <h2>My Appointments</h2>

        {loading ? (
          <p>Loading appointments...</p>
        ) : message ? (
          <p>{message}</p>
        ) : appointments.length === 0 ? (
          <div>
            <p>You haven't booked any appointments yet.</p>
            <Link to="/appointment">Book your first appointment</Link>
          </div>
        ) : (
          <div className="doctor-grid">
            {appointments.map((appointment) => (
              <div className="doctor-card" key={appointment.id}>
                <div className="doctor-avatar">📅</div>

                <h2>Dr. {appointment.doctor_name}</h2>

                <p className="doctor-specialty">
                  {appointment.specialization}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {appointment.appointment_date}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {appointment.reason || "Not specified"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {appointment.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PatientDashboard;
