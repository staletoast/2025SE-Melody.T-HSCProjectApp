from flask import Flask
from flask import redirect
from flask import render_template
from flask import request
from flask import jsonify
import requests
from flask_wtf import CSRFProtect
from flask_csp.csp import csp_header
import logging
from flask import session, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
import random
import os

import userManagement as dbHandler

# Code snippet for logging a message
# app.logger.critical("message")

app_log = logging.getLogger(__name__)
logging.basicConfig(
    filename="security_log.log",
    encoding="utf-8",
    level=logging.DEBUG,
    format="%(asctime)s %(message)s",
)

# Generate a unique basic 16 key: https://acte.ltd/utils/randomkeygen
app = Flask(__name__)
app.secret_key = b"_53oi3uriq9pifpff;apl"
csrf = CSRFProtect(app)


# Redirect index.html to domain root for consistent UX
@app.route("/index", methods=["GET"])
@app.route("/index.htm", methods=["GET"])
@app.route("/index.asp", methods=["GET"])
@app.route("/index.php", methods=["GET"])
@app.route("/index.html", methods=["GET"])
def root():
    return redirect("/", 302)


@app.route("/", methods=["POST", "GET"])
@csp_header(
    {
        # Server Side CSP is consistent with meta CSP in layout.html
        "base-uri": "'self'",
        "default-src": "'self'",
        "style-src": "'self'",
        "script-src": "'self'",
        "img-src": "'self' data:",
        "media-src": "'self'",
        "font-src": "'self'",
        "object-src": "'self'",
        "child-src": "'self'",
        "connect-src": "'self'",
        "worker-src": "'self'",
        "report-uri": "/csp_report",
        "frame-ancestors": "'none'",
        "form-action": "'self'",
        "frame-src": "'none'",
    }
)
def index():
    # Redirect to home if user is already logged in
    if "user_id" in session:
        return redirect("/home")
    return render_template("/index.html")


@app.route("/privacy.html", methods=["GET"])
def privacy():
    return render_template("/privacy.html")


# example CSRF protected form
@app.route("/form.html", methods=["POST", "GET"])
def form():
    if request.method == "POST":
        email = request.form["email"]
        text = request.form["text"]
        return render_template("/form.html")
    else:
        return render_template("/form.html")


# Endpoint for logging CSP violations
@app.route("/csp_report", methods=["POST"])
@csrf.exempt
def csp_report():
    app.logger.critical(request.data.decode())
    return "done"


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]
        confirm = request.form["confirm_password"]
        if not username or not password or not confirm:
            return render_template("register.html", error="All fields required.")
        if password != confirm:
            return render_template("register.html", error="Passwords do not match.")
        con = dbHandler.sql.connect("databaseFiles/database.db")
        cur = con.cursor()
        cur.execute("SELECT id FROM users WHERE username=?", (username,))
        if cur.fetchone():
            con.close()
            return render_template("register.html", error="Username already exists.")
        pw_hash = generate_password_hash(password)
        cur.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, pw_hash))
        con.commit()
        con.close()
        return redirect("/login")
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"].strip()
        password = request.form["password"]
        con = dbHandler.sql.connect("databaseFiles/database.db")
        cur = con.cursor()
        cur.execute("SELECT id, password_hash FROM users WHERE username=?", (username,))
        user = cur.fetchone()
        con.close()
        if user and check_password_hash(user[1], password):
            session["user_id"] = user[0]
            session["username"] = username
            return redirect("/home")
        else:
            return render_template("login.html", error="Invalid credentials.")
    return render_template("login.html")


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect("/login")


@app.route("/home")
def home():
    if "user_id" not in session:
        return redirect("/login")
    return render_template("home.html", active_tab="home")


@app.route("/collection")
def collection():
    if "user_id" not in session:
        return redirect("/login")
    return render_template("collection.html", active_tab="collection")


@app.route("/account", methods=["GET", "POST"])
def account():
    if "user_id" not in session:
        return redirect("/login")
    error = None
    success = None
    if request.method == "POST":
        current = request.form["current_password"]
        new = request.form["new_password"]
        con = dbHandler.sql.connect("databaseFiles/database.db")
        cur = con.cursor()
        cur.execute("SELECT password_hash FROM users WHERE id=?", (session["user_id"],))
        user = cur.fetchone()
        if not user or not check_password_hash(user[0], current):
            error = "Current password incorrect."
        else:
            cur.execute("UPDATE users SET password_hash=? WHERE id=?", (generate_password_hash(new), session["user_id"]))
            con.commit()
            success = "Password changed successfully."
        con.close()
    return render_template("account.html", username=session.get("username"), error=error, success=success, active_tab="account")


@app.route("/api/collection")
def api_collection():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    con = dbHandler.sql.connect("databaseFiles/database.db")
    cur = con.cursor()
    cur.execute("SELECT creature_id FROM user_creatures WHERE user_id=?", (session["user_id"],))
    unlocked = set(row[0] for row in cur.fetchall())
    cur.execute("SELECT id, name, image, description FROM creatures")
    creatures = []
    for row in cur.fetchall():
        creatures.append({
            "id": row[0],
            "name": row[1],
            "image": url_for('static', filename=row[2]),
            "description": row[3],
            "unlocked": row[0] in unlocked
        })
    con.close()
    return jsonify({
        "creatures": creatures,
        "unlocked_count": len(unlocked),
        "total_count": len(creatures)
    })


@app.route("/api/session_complete", methods=["POST"])
def api_session_complete():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    con = dbHandler.sql.connect("databaseFiles/database.db")
    cur = con.cursor()
    # Log session
    cur.execute("INSERT INTO study_sessions (user_id, duration) VALUES (?, ?)", (session["user_id"], request.json.get("duration", 1800)))
    # Unlock a random creature not yet unlocked
    cur.execute("SELECT creature_id FROM user_creatures WHERE user_id=?", (session["user_id"],))
    unlocked = set(row[0] for row in cur.fetchall())
    cur.execute("SELECT id FROM creatures")
    all_ids = [row[0] for row in cur.fetchall()]
    locked = [cid for cid in all_ids if cid not in unlocked]
    if locked:
        new_id = random.choice(locked)
        cur.execute("INSERT INTO user_creatures (user_id, creature_id) VALUES (?, ?)", (session["user_id"], new_id))
        con.commit()
        con.close()
        return jsonify({"unlocked": True, "creature_id": new_id})
    con.commit()
    con.close()
    return jsonify({"unlocked": False})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
