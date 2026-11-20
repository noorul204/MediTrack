
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Doctors() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const [sort, setSort] = useState("default");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/doctors")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch doctors");
        }
        return response.json();
      })
      .then((data) => {
        setDoctors(data.doctors || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to connect to the backend.");
        setLoading(false);
      });
  }, []);

  const specializations = [
    ...new Set(
      doctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    ),
  ].sort();

  const filteredDoctors = useMemo(() => {
    let result = doctors.filter((doctor) => {
      const name = (doctor.name || "").toLowerCase();
      const specialty = (doctor.specialization || "").toLowerCase();
      const qualification = (doctor.qualification || "").toLowerCase();
      const keyword = search.toLowerCase();

      const matchesSearch =
        name.includes(keyword) ||
        specialty.includes(keyword) ||
        qualification.includes(keyword);

      const matchesSpecialization =
        specialization === "All" ||
        doctor.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });

    if (sort === "high") {
      result.sort(
        (a, b) => Number(b.experience || 0) - Number(a.experience || 0)
      );
    } else if (sort === "low") {
      result.sort(
        (a, b) => Number(a.experience || 0) - Number(b.experience || 0)
      );
    }

    return result;
  }, [doctors, search, specialization, sort]);

  const clearFilters = () => {
    setSearch("");
    setSpecialization("All");
    setSort("default");
  };

  return (
    <div className="doctors-page">

      <section className="doctors-header">
        <span className="doctors-tag">MEDTRACK HEALTHCARE</span>

        <h1>Find Your Doctor</h1>

        <p>
          Connect with experienced healthcare professionals
          and find the right doctor for your needs.
        </p>

        <input
          type="text"
          placeholder="🔍 Search by doctor name, specialty or qualification..."
          className="doctor-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="doctor-section">

        <div className="doctor-filter-bar">
          <div className="filter-group">
            <label htmlFor="specialization">Specialization</label>
            <select
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="All">All Specializations</option>

              {specializations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort by Experience</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="high">Highest Experience</option>
              <option value="low">Lowest Experience</option>
            </select>
          </div>

          <button className="clear-filter-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="doctor-results-heading">
          <div>
            <h2>Available Doctors</h2>
            <p>Choose a healthcare professional for your needs.</p>
          </div>

          <span className="doctor-count">
            {filteredDoctors.length} Doctors Found
          </span>
        </div>

        {loading ? (
          <div className="no-doctors">
            <h3>Loading doctors...</h3>
            <p>Please wait while we retrieve the doctor list.</p>
          </div>
        ) : error ? (
          <div className="no-doctors">
            <h3>Connection Error</h3>
            <p>{error}</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="doctor-grid">
            {filteredDoctors.map((doctor) => (
              <div className="doctor-card" key={doctor.id}>

                <div className="doctor-avatar">👨‍⚕️</div>

                <span className="doctor-available">
                  ● Registered Doctor
                </span>

                <h2>Dr. {doctor.name}</h2>

                <p className="doctor-specialty">
                  {doctor.specialization || "General Practitioner"}
                </p>

                <div className="doctor-details">
                  <p>
                    🎓 {doctor.qualification || "Healthcare Professional"}
                  </p>

                  <p>
                    ⏳ {doctor.experience || 0} Years Experience
                  </p>
                </div>

                <Link
                  to="/appointment"
                  className="doctor-book-btn"
                >
                  Book Appointment →
                </Link>

              </div>
            ))}
          </div>
        ) : (
          <div className="no-doctors">
            <h3>No Doctors Found</h3>
            <p>
              Try changing your search or specialization filter.
            </p>
            <button onClick={clearFilters}>Clear Filters</button>
          </div>
        )}

      </section>
    </div>
  );
}

export default Doctors;
