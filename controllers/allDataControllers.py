from flask import jsonify
from db import get_db

def handle_get_analytics_all_likes():
    client = None
    try:
        pool = get_db()
        client = pool.getconn()
        print("Acquired connection for getting all URLs")

        with client.cursor() as cursor:
            # Fetch all URLs data
            find_all_urls_query = 'SELECT id, shortid, redirecturl, createdat, updatedat FROM urls ORDER BY createdat DESC'
            cursor.execute(find_all_urls_query)
            url_rows = cursor.fetchall()

            # Convert rows to list of dictionaries
            data = []
            for row in url_rows:
                data.append({
                    'id': row[0],
                    'shortId': row[1],
                    'redirectURL': row[2],
                    'createdAt': str(row[3]) if row[3] else None,
                    'updatedAt': str(row[4]) if row[4] else None,
                })

            return jsonify({'Success': True, 'message': 'Fetched all URL data', 'data': data}), 200

    except Exception as err:
        print(f"Error in /alldata: {err}")
        return jsonify({'error': str(err)}), 500
    finally:
        if client:
            print("Releasing connection after getting all URLs")
            pool.putconn(client)

