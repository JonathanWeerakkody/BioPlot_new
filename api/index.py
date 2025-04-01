from flask import Flask, request, jsonify
from flask_cors import CORS
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import io
import base64
import json
import os
import sys
from cluster_heatmap import generate_cluster_heatmap

app = Flask(__name__)
CORS(app)

@app.route('/api/cluster_heatmap', methods=['POST'])
def cluster_heatmap():
    try:
        # Get data and options from request
        data = request.json.get('data', '')
        options = request.json.get('options', {})
        
        # Generate the heatmap
        result = generate_cluster_heatmap(data, options)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False})

# Keep existing routes
@app.route('/api/plot', methods=['POST'])
def plot():
    try:
        data = request.json.get('data', '')
        options = request.json.get('options', {})
        
        # Parse data
        lines = data.strip().split('\n')
        headers = lines[0].split('\t')
        
        # Extract x and y values
        x_values = []
        y_values = []
        
        for i in range(1, len(lines)):
            row = lines[i].split('\t')
            if len(row) >= 2:
                x_values.append(row[0])
                y_values.append(float(row[1]))
        
        # Create plot
        plt.figure(figsize=(10, 6))
        
        # Set colors
        color = options.get('barColor', '#4CAF50')
        
        # Create bar chart
        plt.bar(x_values, y_values, color=color)
        
        # Set labels and title
        plt.xlabel(options.get('xAxisLabel', 'X Axis'))
        plt.ylabel(options.get('yAxisLabel', 'Y Axis'))
        plt.title(options.get('title', 'Bar Chart'))
        
        # Rotate x-axis labels if needed
        plt.xticks(rotation=options.get('xAxisRotation', 0))
        
        # Adjust layout
        plt.tight_layout()
        
        # Save plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        
        # Encode the image to base64
        plot_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        plt.close()
        
        return jsonify({
            'plot': plot_data,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
