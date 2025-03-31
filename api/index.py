import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/generate-chart', methods=['POST'])
def generate_chart():
    try:
        data = request.json
        categories = data.get('categories', [])
        values = data.get('values', [])
        options = data.get('options', {})
        chart_type = options.get('chartType', 'bar')
        
        # Create a simple placeholder image instead of using matplotlib
        # This is a temporary solution to avoid dependency issues on Vercel
        # In a production environment, you would use matplotlib to generate actual charts
        
        # Create a simple base64 encoded placeholder image
        placeholder_image = create_placeholder_image(chart_type)
        
        # Return the placeholder image
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{placeholder_image}'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def create_placeholder_image(chart_type):
    # This is a minimal 1x1 pixel transparent PNG image encoded in base64
    # In a production environment, this would be replaced with actual chart generation
    minimal_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    return minimal_png_base64

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
