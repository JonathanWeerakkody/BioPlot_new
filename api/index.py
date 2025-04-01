from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import base64
import json
import os
import sys
import subprocess

app = Flask(__name__)
CORS(app)

def generate_simple_heatmap(data_str, options):
    """Generate a simple heatmap without external dependencies."""
    try:
        # Parse data
        lines = data_str.strip().split('\n')
        
        # Extract group and sample names
        group_line = lines[0].split('\t')
        sample_line = lines[1].split('\t')
        
        # Extract data rows
        data_rows = []
        gene_names = []
        for i in range(2, len(lines)):
            row = lines[i].split('\t')
            gene_names.append(row[0])
            data_rows.append([float(x) for x in row[1:]])
        
        # Create HTML for a heatmap using CSS grid
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .heatmap-container {
                    display: grid;
                    grid-template-columns: auto repeat(COLUMN_COUNT, 1fr);
                    grid-gap: 1px;
                    background-color: #f5f5f5;
                    padding: 10px;
                    font-family: Arial, sans-serif;
                }
                .heatmap-header {
                    font-weight: bold;
                    text-align: center;
                    padding: 5px;
                    background-color: #e0e0e0;
                }
                .heatmap-row-label {
                    font-weight: bold;
                    padding: 5px;
                    background-color: #e0e0e0;
                }
                .heatmap-cell {
                    width: 30px;
                    height: 30px;
                    text-align: center;
                    color: white;
                    font-size: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .heatmap-title {
                    font-size: 18px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10px;
                }
                .heatmap-subtitle {
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="heatmap-title">TITLE</div>
            <div class="heatmap-subtitle">SUBTITLE</div>
            <div class="heatmap-container">
                <!-- Headers and cells will be inserted here -->
                GRID_CONTENT
            </div>
        </body>
        </html>
        """
        
        # Replace placeholders
        html = html.replace("TITLE", options.get('title', 'Cluster Heatmap'))
        html = html.replace("SUBTITLE", options.get('subtitle', 'Gene Expression Data'))
        html = html.replace("COLUMN_COUNT", str(len(sample_line) - 1))
        
        # Generate grid content
        grid_content = "<div></div>"  # Empty top-left cell
        
        # Add column headers
        for col in sample_line[1:]:
            grid_content += f'<div class="heatmap-header">{col}</div>'
        
        # Find min and max values for color scaling
        all_values = [val for row in data_rows for val in row]
        min_val = min(all_values)
        max_val = max(all_values)
        
        # Add rows with data
        for i, gene in enumerate(gene_names):
            grid_content += f'<div class="heatmap-row-label">{gene}</div>'
            for val in data_rows[i]:
                # Normalize value between 0 and 1
                norm_val = (val - min_val) / (max_val - min_val) if max_val > min_val else 0.5
                
                # Generate color (red for high, blue for low)
                if norm_val > 0.5:
                    r = 255
                    g = int(255 * (1 - norm_val) * 2)
                    b = int(255 * (1 - norm_val) * 2)
                else:
                    r = int(255 * norm_val * 2)
                    g = int(255 * norm_val * 2)
                    b = 255
                
                color = f"rgb({r}, {g}, {b})"
                grid_content += f'<div class="heatmap-cell" style="background-color: {color};" title="{val}">{val:.1f}</div>'
        
        html = html.replace("GRID_CONTENT", grid_content)
        
        # Save HTML to a temporary file
        temp_html_path = "/tmp/heatmap.html"
        with open(temp_html_path, "w") as f:
            f.write(html)
        
        # Convert HTML to PNG using wkhtmltoimage if available, otherwise return HTML
        try:
            # Check if wkhtmltoimage is installed
            subprocess.run(["which", "wkhtmltoimage"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Convert HTML to PNG
            png_path = "/tmp/heatmap.png"
            subprocess.run(["wkhtmltoimage", "--quality", "90", temp_html_path, png_path], check=True)
            
            # Read PNG file
            with open(png_path, "rb") as f:
                png_data = f.read()
            
            # Encode to base64
            plot_data = base64.b64encode(png_data).decode('utf-8')
            
            # Clean up
            os.remove(temp_html_path)
            os.remove(png_path)
            
            return {
                'plot': plot_data,
                'success': True
            }
        except:
            # If wkhtmltoimage is not available, return HTML
            with open(temp_html_path, "r") as f:
                html_content = f.read()
            
            # Clean up
            os.remove(temp_html_path)
            
            return {
                'html': html_content,
                'success': True
            }
    
    except Exception as e:
        return {
            'error': str(e),
            'success': False
        }

@app.route('/api/cluster_heatmap', methods=['POST'])
def cluster_heatmap():
    try:
        # Get data and options from request
        data = request.json.get('data', '')
        options = request.json.get('options', {})
        
        # Generate the heatmap
        result = generate_simple_heatmap(data, options)
        
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
        
        # Generate HTML for a bar chart
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .chart-container {
                    width: 800px;
                    height: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    height: 400px;
                    border-left: 2px solid #333;
                    border-bottom: 2px solid #333;
                    padding: 20px;
                }
                .bar {
                    margin: 0 10px;
                    width: 40px;
                    background-color: BAR_COLOR;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    color: white;
                    font-weight: bold;
                    padding-top: 5px;
                }
                .x-label {
                    text-align: center;
                    margin-top: 10px;
                    font-size: 12px;
                    transform: rotate(ROTATION_DEGdeg);
                }
                .chart-title {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .y-axis {
                    position: absolute;
                    left: 20px;
                    height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .y-tick {
                    font-size: 12px;
                }
                .x-axis-label {
                    text-align: center;
                    margin-top: 30px;
                    font-weight: bold;
                }
                .y-axis-label {
                    position: absolute;
                    left: -40px;
                    top: 200px;
                    transform: rotate(-90deg);
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="chart-container">
                <div class="chart-title">CHART_TITLE</div>
                <div style="position: relative;">
                    <div class="y-axis-label">Y_AXIS_LABEL</div>
                    <div class="y-axis">
                        Y_TICKS
                    </div>
                    <div class="bar-chart">
                        BAR_ELEMENTS
                    </div>
                </div>
                <div class="x-axis-label">X_AXIS_LABEL</div>
            </div>
        </body>
        </html>
        """
        
        # Find max value for scaling
        max_val = max(y_values) if y_values else 0
        
        # Generate bars
        bar_elements = ""
        for i, (x, y) in enumerate(zip(x_values, y_values)):
            height_percent = (y / max_val * 100) if max_val > 0 else 0
            bar_elements += f"""
            <div style="text-align: center;">
                <div class="bar" style="height: {height_percent}%;">{y}</div>
                <div class="x-label">{x}</div>
            </div>
            """
        
        # Generate Y-axis ticks
        y_ticks = ""
        num_ticks = 5
        for i in range(num_ticks):
            tick_value = max_val * (num_ticks - i - 1) / (num_ticks - 1)
            y_ticks += f'<div class="y-tick">{tick_value:.1f}</div>'
        
        # Replace placeholders
        html = html.replace("BAR_ELEMENTS", bar_elements)
        html = html.replace("CHART_TITLE", options.get('title', 'Bar Chart'))
        html = html.replace("X_AXIS_LABEL", options.get('xAxisLabel', 'X Axis'))
        html = html.replace("Y_AXIS_LABEL", options.get('yAxisLabel', 'Y Axis'))
        html = html.replace("Y_TICKS", y_ticks)
        html = html.replace("BAR_COLOR", options.get('barColor', '#4CAF50'))
        html = html.replace("ROTATION_DEG", str(options.get('xAxisRotation', 0)))
        
        # Save HTML to a temporary file
        temp_html_path = "/tmp/barchart.html"
        with open(temp_html_path, "w") as f:
            f.write(html)
        
        # Convert HTML to PNG using wkhtmltoimage if available, otherwise return HTML
        try:
            # Check if wkhtmltoimage is installed
            subprocess.run(["which", "wkhtmltoimage"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Convert HTML to PNG
            png_path = "/tmp/barchart.png"
            subprocess.run(["wkhtmltoimage", "--quality", "90", temp_html_path, png_path], check=True)
            
            # Read PNG file
            with open(png_path, "rb") as f:
                png_data = f.read()
            
            # Encode to base64
            plot_data = base64.b64encode(png_data).decode('utf-8')
            
            # Clean up
            os.remove(temp_html_path)
            os.remove(png_path)
            
            return jsonify({
                'plot': plot_data,
                'success': True
            })
        except:
            # If wkhtmltoimage is not available, return HTML
            with open(temp_html_path, "r") as f:
                html_content = f.read()
            
            # Clean up
            os.remove(temp_html_path)
            
            return jsonify({
                'html': html_content,
                'success': True
            })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        })

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "API is running", 
        "python_version": sys.version,
        "dependencies": "No external data science libraries required"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
