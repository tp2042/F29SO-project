from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    return jsonify(sign_up(email, password))

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    return jsonify(login(email, password))

# Add other routes as needed

if __name__ == "__main__":
    app.run(debug=True)
