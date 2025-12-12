from flask import request, jsonify
from db import get_db
import shortuuid

def handle_generated_new_short_url():
    body = request.get_json()
    if not body or not body.get('url'):
        return jsonify({'error': 'url is required'}), 400

    short_id = shortuuid.uuid()[:8]  # Generate short ID
    redirect_url = body['url']
    client = None

    try:
        pool = get_db()
        client = pool.getconn()
        print("Acquired connection for inserting URL")

        with client.cursor() as cursor:
            insert_query = 'INSERT INTO urls (shortid, redirecturl) VALUES (%s, %s) RETURNING id'
            cursor.execute(insert_query, (short_id, redirect_url))
            result = cursor.fetchone()
            client.commit()

            print(f"Inserted URL with ID: {result[0]}")
            return jsonify({'message': 'Short URL created!', 'id': short_id}), 201

    except Exception as error:
        print(f"Error saving URL: {error}")
        if client:
            client.rollback()
        
        # Check for duplicate entry error
        if 'duplicate key' in str(error).lower() or 'unique constraint' in str(error).lower():
            return jsonify({'error': 'Short ID already exists. Please try again.'}), 409
        return jsonify({'error': 'Failed to create short URL'}), 500
    finally:
        if client:
            print("Releasing connection after inserting URL")
            pool.putconn(client)

def handle_get_analytics(short_id):
    if not short_id:
        return jsonify({'error': 'Short ID is required'}), 400

    client = None
    try:
        pool = get_db()
        client = pool.getconn()
        print("Acquired connection for getting analytics")

        with client.cursor() as cursor:
            # Find the URL first
            find_url_query = 'SELECT id, shortid, redirecturl, createdat, updatedat FROM urls WHERE shortid = %s'
            cursor.execute(find_url_query, (short_id,))
            url_row = cursor.fetchone()

            if not url_row:
                return jsonify({'error': 'Short URL not found'}), 404

            url_id, short_id_db, redirect_url, created_at, updated_at = url_row

            # Get visit history
            find_history_query = 'SELECT visit_timestamp FROM visit_history WHERE url_id = %s ORDER BY visit_timestamp DESC'
            cursor.execute(find_history_query, (url_id,))
            history_rows = cursor.fetchall()

            analytics = [{'timestamp': str(row[0])} for row in history_rows]

            return jsonify({
                'ShortID': short_id_db,
                'realUrlLink': redirect_url,
                'CreateUrlTime': str(created_at) if created_at else None,
                'UpdateUrlTime': str(updated_at) if updated_at else None,
                'totalClicks': len(history_rows),
                'analytics': analytics,
            })

    except Exception as error:
        print(f"Error getting analytics: {error}")
        return jsonify({'error': 'Failed to retrieve analytics'}), 500
    finally:
        if client:
            print("Releasing connection after getting analytics")
            pool.putconn(client)

