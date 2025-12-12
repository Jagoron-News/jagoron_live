from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import os
from dotenv import load_dotenv
from db import connect_db, get_db
from routes.url import url_bp

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Add this to handle OPTIONS for all routes
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response, 200

# Connect to PostgreSQL
try:
    connect_db()
    print("PostgreSQL DB connected successfully")
except Exception as err:
    print(f"PostgreSQL connection error: {err}")
    exit(1)

# Register blueprints
app.register_blueprint(url_bp, url_prefix='/url')

@app.route('/', methods=['GET'])
def home():
    return redirect('https://jagoronnews.com', code=301)

@app.route('/<short_id>', methods=['GET'])
def redirect_url(short_id):
    if not short_id:
        return "Short ID is required", 400

    client = None
    try:
        pool = get_db()
        client = pool.getconn()
        print(f"Acquired PG connection for shortId: {short_id}")

        with client.cursor() as cursor:
            cursor.execute("BEGIN")
            
            # Find the URL
            find_url_query = "SELECT id, redirecturl FROM urls WHERE shortid = %s"
            cursor.execute(find_url_query, (short_id,))
            result = cursor.fetchone()

            if not result:
                cursor.execute("ROLLBACK")
                print(f"Short ID not found: {short_id}")
                return "Short URL not found", 404

            url_id, redirect_url = result

            # Insert visit history
            insert_visit_query = "INSERT INTO visit_history (url_id, visit_timestamp) VALUES (%s, NOW())"
            cursor.execute(insert_visit_query, (url_id,))

            cursor.execute("COMMIT")
            print(f"Redirecting {short_id} to {redirect_url}")
            return redirect(redirect_url, code=302)

    except Exception as error:
        print(f"Error handling redirect: {error}")
        if client:
            try:
                with client.cursor() as cursor:
                    cursor.execute("ROLLBACK")
            except:
                pass
        return "Internal server error", 500
    finally:
        if client:
            pool.putconn(client)

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=PORT, debug=True)

