
import { useEffect, useState } from "react";

function Appointment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("mediTrackUser") || "null");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/doctors")
      .then((response) => response.json())
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => setMessage("Unable to load doctors."));
  }, []);

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user || user.role !== "patient") {
      setMessage("Please log in with a patient account to book an appointment.");
      return;
    }

    if (!doctorId || !appointmentDate) {
      setMessage("Please select a doctor and appointment date.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: user.id,
          doctor_id: Number(doctorId),
          appointment_date: appointmentDate,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Appointment booked successfully! 🎉");
        setDoctorId("");
        setAppointmentDate("");
        setReason("");
      } else {
        setMessage(data.message || "Unable to book appointment.");
      }
    } catch (error) {
      setMessage("Backend connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">📅</div>

        <h1>Book Appointment</h1>

        <p className="login-subtitle">
          Schedule your consultation with a doctor
        </p>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>Select Doctor</label>

            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              required
            >
              <option value="">Choose a doctor</option>

              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="login-form-group">
            <label>Appointment Date</label>

            <input
              type="date"
              value={appointmentDate}
              min={getToday()}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Reason for Consultation</label>

            <textarea
              placeholder="Briefly describe your reason for consultation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading || doctors.length === 0}
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>

        {message && (
          <p className="login-message">{message}</p>
        )}
      </div>
    </div>
  );
}

export default Appointment;
