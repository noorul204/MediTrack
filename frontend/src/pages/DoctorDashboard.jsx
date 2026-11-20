
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("mediTrackUser") || "null");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    if (!user || user.role !== "doctor") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/doctor/appointments/${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      } else {
        setMessage(data.message || "Unable to load appointments.");
      }
    } catch (error) {
      setMessage("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id, user?.role]);

  const updateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctor_user_id: user.id,
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        await fetchAppointments();
      } else {
        setMessage(data.message || "Unable to update appointment.");
      }
    } catch (error) {
      setMessage("Cannot connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || user.role !== "doctor") {
    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Doctor Login Required</h2>
          <p>Please log in using your doctor account.</p>
          <Link to="/login" className="login-submit">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="doctors-page">
      <div className="doctors-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {user.name}! Manage your patient appointments here.</p>
      </div>

      <div className="doctor-section">
        <h2>Patient Appointments</h2>

        {message && (
          <p className="login-message" role="status">
            {message}
          </p>
        )}

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="no-doctors">
            <h3>No appointments yet</h3>
            <p>Patient bookings will appear here.</p>
          </div>
        ) : (
          <div className="doctor-grid">
            {appointments.map((appointment) => (
              <div className="doctor-card" key={appointment.id}>
                <div className="doctor-avatar">👤</div>

                <h3>{appointment.patient_name}</h3>

                <p className="doctor-specialty">
                  {appointment.patient_email}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {appointment.appointment_date}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {appointment.reason || "Not provided"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {appointment.status}
                </p>

                {appointment.status === "Pending" && (
                  <div className="appointment-actions">
                    <button
                      onClick={() =>
                        updateStatus(appointment.id, "Confirmed")
                      }
                      disabled={updatingId === appointment.id}
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(appointment.id, "Cancelled")
                      }
                      disabled={updatingId === appointment.id}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === "Confirmed" && (
                  <button
                    onClick={() =>
                      updateStatus(appointment.id, "Completed")
                    }
                    disabled={updatingId === appointment.id}
                  >
                    Mark Completed
                  </button>
                )}

                {updatingId === appointment.id && (
                  <p>Updating...</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default DoctorDashboard;
