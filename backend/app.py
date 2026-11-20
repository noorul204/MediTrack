
import os
import sqlite3
import secrets
from pathlib import Path
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


# =====================================
# FLASK CONFIGURATION
# =====================================

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = "meditrack-development-secret-change-before-deployment"

admin_serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])

DATABASE = Path(__file__).resolve().parent / "meditrack.db"

# Admin credentials for this local learning project
ADMIN_EMAIL = "admin@meditrack.com"
ADMIN_PASSWORD = "Admin@12345"


# =====================================
# DATABASE CONNECTION
# =====================================

def get_db():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    with get_db() as db:

        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('patient', 'doctor'))
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                specialization TEXT NOT NULL,
                qualification TEXT,
                experience INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                doctor_id INTEGER NOT NULL,
                appointment_date TEXT NOT NULL,
                reason TEXT,
                status TEXT DEFAULT 'Pending',
                FOREIGN KEY (patient_id) REFERENCES users(id),
                FOREIGN KEY (doctor_id) REFERENCES doctors(id)
            )
        """)

    print("MediTrack database initialized successfully!")


# =====================================
# ADMIN AUTHENTICATION
# =====================================

def admin_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Admin login required"
            }), 401

        token = auth_header.split(" ", 1)[1]

        try:
            payload = admin_serializer.loads(token, max_age=3600)

            if payload.get("role") != "admin":
                raise BadSignature("Invalid role")

        except (BadSignature, SignatureExpired):
            return jsonify({
                "success": False,
                "message": "Invalid or expired admin session"
            }), 401

        return func(*args, **kwargs)

    return wrapper


# =====================================
# HOME AND CONNECTION TEST
# =====================================

@app.route("/")
def home():
    return "MediTrack Backend is Working!"


@app.route("/api/test")
def test():
    return jsonify({
        "success": True,
        "message": "React and Flask are connected successfully!"
    })


# =====================================
# USER REGISTRATION
# =====================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "patient").strip().lower()

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All required fields must be filled"
        }), 400

    if role not in ["patient", "doctor"]:
        return jsonify({
            "success": False,
            "message": "Invalid role"
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 6 characters"
        }), 400

    specialization = data.get("specialization", "").strip()
    qualification = data.get("qualification", "").strip()
    experience = data.get("experience", 0)

    if role == "doctor" and not specialization:
        return jsonify({
            "success": False,
            "message": "Doctor specialization is required"
        }), 400

    try:
        experience = int(experience)

        if experience < 0:
            return jsonify({
                "success": False,
                "message": "Experience cannot be negative"
            }), 400

    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Experience must be a number"
        }), 400

    hashed_password = generate_password_hash(password)

    try:
        with get_db() as db:

            cursor = db.execute("""
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)
            """, (name, email, hashed_password, role))

            user_id = cursor.lastrowid

            if role == "doctor":

                db.execute("""
                    INSERT INTO doctors
                    (user_id, specialization, qualification, experience)
                    VALUES (?, ?, ?, ?)
                """, (
                    user_id,
                    specialization,
                    qualification,
                    experience
                ))

        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "user_id": user_id
        }), 201

    except sqlite3.IntegrityError:

        return jsonify({
            "success": False,
            "message": "Email already registered"
        }), 409


# =====================================
# USER LOGIN
# =====================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    with get_db() as db:

        user = db.execute("""
            SELECT * FROM users WHERE email = ?
        """, (email,)).fetchone()

    if user is None or not check_password_hash(user["password"], password):

        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    })


# =====================================
# GET ALL DOCTORS
# =====================================

@app.route("/api/doctors", methods=["GET"])
def get_doctors():

    with get_db() as db:

        doctors = db.execute("""
            SELECT
                doctors.id,
                users.name,
                users.email,
                doctors.specialization,
                doctors.qualification,
                doctors.experience
            FROM doctors
            JOIN users ON doctors.user_id = users.id
        """).fetchall()

    return jsonify({
        "success": True,
        "doctors": [dict(doctor) for doctor in doctors]
    })


# =====================================
# BOOK APPOINTMENT
# =====================================

@app.route("/api/appointments", methods=["POST"])
def book_appointment():

    data = request.get_json(silent=True) or {}

    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    appointment_date = data.get("appointment_date", "").strip()
    reason = data.get("reason", "").strip()

    if not patient_id or not doctor_id or not appointment_date:
        return jsonify({
            "success": False,
            "message": "Patient, doctor and appointment date are required"
        }), 400

    try:

        with get_db() as db:

            patient = db.execute("""
                SELECT id FROM users
                WHERE id = ? AND role = 'patient'
            """, (patient_id,)).fetchone()

            doctor = db.execute("""
                SELECT id FROM doctors WHERE id = ?
            """, (doctor_id,)).fetchone()

            if not patient or not doctor:
                return jsonify({
                    "success": False,
                    "message": "Invalid patient or doctor"
                }), 404

            cursor = db.execute("""
                INSERT INTO appointments
                (patient_id, doctor_id, appointment_date, reason)
                VALUES (?, ?, ?, ?)
            """, (patient_id, doctor_id, appointment_date, reason))

            appointment_id = cursor.lastrowid

        return jsonify({
            "success": True,
            "message": "Appointment booked successfully!",
            "appointment_id": appointment_id
        }), 201

    except sqlite3.Error:

        return jsonify({
            "success": False,
            "message": "Unable to book appointment"
        }), 500


# =====================================
# GET PATIENT APPOINTMENTS
# =====================================

@app.route("/api/appointments/<int:patient_id>", methods=["GET"])
def get_appointments(patient_id):

    with get_db() as db:

        appointments = db.execute("""
            SELECT
                appointments.id,
                appointments.appointment_date,
                appointments.reason,
                appointments.status,
                users.name AS doctor_name,
                doctors.specialization
            FROM appointments
            JOIN doctors ON appointments.doctor_id = doctors.id
            JOIN users ON doctors.user_id = users.id
            WHERE appointments.patient_id = ?
            ORDER BY appointments.id DESC
        """, (patient_id,)).fetchall()

    return jsonify({
        "success": True,
        "appointments": [dict(item) for item in appointments]
    })


# =====================================
# GET DOCTOR APPOINTMENTS
# =====================================

@app.route("/api/doctor/appointments/<int:user_id>", methods=["GET"])
def get_doctor_appointments(user_id):

    with get_db() as db:

        doctor = db.execute("""
            SELECT id FROM doctors WHERE user_id = ?
        """, (user_id,)).fetchone()

        if not doctor:
            return jsonify({
                "success": False,
                "message": "Doctor account not found"
            }), 404

        appointments = db.execute("""
            SELECT
                appointments.id,
                appointments.appointment_date,
                appointments.reason,
                appointments.status,
                patients.name AS patient_name,
                patients.email AS patient_email
            FROM appointments
            JOIN users AS patients
                ON appointments.patient_id = patients.id
            WHERE appointments.doctor_id = ?
            ORDER BY appointments.id DESC
        """, (doctor["id"],)).fetchall()

    return jsonify({
        "success": True,
        "appointments": [dict(item) for item in appointments]
    })


# =====================================
# UPDATE APPOINTMENT STATUS
# =====================================

@app.route("/api/appointments/<int:appointment_id>/status", methods=["PATCH"])
def update_appointment_status(appointment_id):

    data = request.get_json(silent=True) or {}

    doctor_user_id = data.get("doctor_user_id")
    status = data.get("status", "").strip().title()

    allowed_statuses = ["Confirmed", "Completed", "Cancelled"]

    if not doctor_user_id or status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid doctor or appointment status"
        }), 400

    with get_db() as db:

        doctor = db.execute("""
            SELECT id FROM doctors WHERE user_id = ?
        """, (doctor_user_id,)).fetchone()

        if not doctor:
            return jsonify({
                "success": False,
                "message": "Doctor account not found"
            }), 404

        appointment = db.execute("""
            SELECT id FROM appointments
            WHERE id = ? AND doctor_id = ?
        """, (appointment_id, doctor["id"])).fetchone()

        if not appointment:
            return jsonify({
                "success": False,
                "message": "Appointment not found for this doctor"
            }), 404

        db.execute("""
            UPDATE appointments
            SET status = ?
            WHERE id = ?
        """, (status, appointment_id))

    return jsonify({
        "success": True,
        "message": f"Appointment {status.lower()} successfully!"
    })


# =====================================
# ADMIN LOGIN
# =====================================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if (
        not secrets.compare_digest(email, ADMIN_EMAIL)
        or not secrets.compare_digest(password, ADMIN_PASSWORD)
    ):
        return jsonify({
            "success": False,
            "message": "Invalid admin credentials"
        }), 401

    token = admin_serializer.dumps({
        "role": "admin",
        "email": ADMIN_EMAIL
    })

    return jsonify({
        "success": True,
        "message": "Admin login successful",
        "token": token,
        "user": {
            "name": "Administrator",
            "email": ADMIN_EMAIL,
            "role": "admin"
        }
    })


# =====================================
# ADMIN DASHBOARD STATISTICS
# =====================================

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():

    with get_db() as db:

        patients = db.execute("""
            SELECT COUNT(*) AS total
            FROM users WHERE role = 'patient'
        """).fetchone()["total"]

        doctors = db.execute("""
            SELECT COUNT(*) AS total
            FROM doctors
        """).fetchone()["total"]

        appointments = db.execute("""
            SELECT COUNT(*) AS total
            FROM appointments
        """).fetchone()["total"]

        pending = db.execute("""
            SELECT COUNT(*) AS total
            FROM appointments WHERE status = 'Pending'
        """).fetchone()["total"]

        confirmed = db.execute("""
            SELECT COUNT(*) AS total
            FROM appointments WHERE status = 'Confirmed'
        """).fetchone()["total"]

        completed = db.execute("""
            SELECT COUNT(*) AS total
            FROM appointments WHERE status = 'Completed'
        """).fetchone()["total"]

    return jsonify({
        "success": True,
        "stats": {
            "patients": patients,
            "doctors": doctors,
            "appointments": appointments,
            "pending": pending,
            "confirmed": confirmed,
            "completed": completed
        }
    })


# =====================================
# ADMIN VIEW ALL USERS
# =====================================

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users():

    with get_db() as db:

        users = db.execute("""
            SELECT
                users.id,
                users.name,
                users.email,
                users.role,
                doctors.specialization
            FROM users
            LEFT JOIN doctors ON users.id = doctors.user_id
            ORDER BY users.id DESC
        """).fetchall()

    return jsonify({
        "success": True,
        "users": [dict(user) for user in users]
    })


# =====================================
# ADMIN VIEW ALL APPOINTMENTS
# =====================================

@app.route("/api/admin/appointments", methods=["GET"])
@admin_required
def admin_appointments():

    with get_db() as db:

        appointments = db.execute("""
            SELECT
                appointments.id,
                appointments.appointment_date,
                appointments.reason,
                appointments.status,
                patients.name AS patient_name,
                patients.email AS patient_email,
                doctors_users.name AS doctor_name,
                doctors.specialization
            FROM appointments
            JOIN users AS patients
                ON appointments.patient_id = patients.id
            JOIN doctors
                ON appointments.doctor_id = doctors.id
            JOIN users AS doctors_users
                ON doctors.user_id = doctors_users.id
            ORDER BY appointments.id DESC
        """).fetchall()

    return jsonify({
        "success": True,
        "appointments": [dict(item) for item in appointments]
    })


# =====================================
# RUN APPLICATION
# =====================================

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
