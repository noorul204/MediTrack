
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("mediTrackAdminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const loadDashboard = async () => {
      try {
        const [statsRes, usersRes, appointmentsRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/admin/stats", { headers }),
          fetch("http://127.0.0.1:5000/api/admin/users", { headers }),
          fetch("http://127.0.0.1:5000/api/admin/appointments", { headers }),
        ]);

        if ([statsRes, usersRes, appointmentsRes].some((res) => res.status === 401)) {
          localStorage.removeItem("mediTrackAdminToken");
          localStorage.removeItem("mediTrackUser");
          window.dispatchEvent(new Event("mediTrackAuthChange"));
          navigate("/admin-login");
          return;
        }

        if (!statsRes.ok || !usersRes.ok || !appointmentsRes.ok) {
          throw new Error("Unable to load dashboard information.");
        }

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();
        const appointmentsData = await appointmentsRes.json();

        setStats(statsData);
        setUsers(usersData.users || []);
        setAppointments(appointmentsData.appointments || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("mediTrackAdminToken");
    localStorage.removeItem("mediTrackUser");
    window.dispatchEvent(new Event("mediTrackAuthChange"));
    navigate("/admin-login");
  };

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>;
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">MEDTRACK ADMINISTRATION</p>
          <h1>Admin Dashboard</h1>
          <p>Monitor users and appointments across MediTrack.</p>
        </div>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <section className="admin-stats">
        {[
          ["Total Patients", stats.patients ?? 0],
          ["Total Doctors", stats.doctors ?? 0],
          ["Total Appointments", stats.appointments ?? 0],
          ["Pending", stats.pending ?? 0],
          ["Confirmed", stats.confirmed ?? 0],
          ["Completed", stats.completed ?? 0],
        ].map(([label, value]) => (
          <div className="admin-stat-card" key={label}>
            <p>{label}</p>
            <h2>{value}</h2>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h2>Registered Users</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Specialization</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5">No users registered yet.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="role-badge">{user.role}</span></td>
                    <td>{user.specialization || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section">
        <h2>All Appointments</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr><td colSpan="6">No appointments found.</td></tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.patient_name}</td>
                    <td>{appointment.doctor_name}</td>
                    <td>{appointment.appointment_date}</td>
                    <td>{appointment.reason}</td>
                    <td>{appointment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
