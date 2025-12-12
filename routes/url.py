from flask import Blueprint, request, jsonify
from controllers.url import handle_generated_new_short_url, handle_get_analytics
from controllers.allDataControllers import handle_get_analytics_all_likes

url_bp = Blueprint('url', __name__)

@url_bp.route('/', methods=['POST'])
def create_short_url():
    return handle_generated_new_short_url()

@url_bp.route('/allData', methods=['GET'])
def get_all_data():
    return handle_get_analytics_all_likes()

@url_bp.route('/analytics/<short_id>', methods=['GET'])
def get_analytics(short_id):
    return handle_get_analytics(short_id)

