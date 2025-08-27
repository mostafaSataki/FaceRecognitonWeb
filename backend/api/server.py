"""
Face Recognition API Server
سرویس وب برای موتور تشخیص چهره
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """بررسی سلامت سرویس"""
    return jsonify({
        'status': 'healthy',
        'message': 'Face Recognition API is running',
        'version': '1.0.0'
    })

@app.route('/api/enroll', methods=['POST'])
def enroll_face():
    """انرولمنت چهره جدید"""
    try:
        # TODO: پیاده‌سازی انرولمنت چهره
        return jsonify({
            'success': True,
            'message': 'Face enrolled successfully',
            'person_id': 'temp_id'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    """تشخیص چهره"""
    try:
        # TODO: پیاده‌سازی تشخیص چهره
        return jsonify({
            'success': True,
            'person_id': 'temp_id',
            'confidence': 0.95,
            'matched': True
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/persons', methods=['GET'])
def get_persons():
    """دریافت لیست افراد"""
    try:
        # TODO: پیاده‌سازی دریافت لیست افراد
        return jsonify({
            'success': True,
            'persons': []
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/persons/<person_id>', methods=['DELETE'])
def delete_person(person_id):
    """حذف شخص"""
    try:
        # TODO: پیاده‌سازی حذف شخص
        return jsonify({
            'success': True,
            'message': 'Person deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)