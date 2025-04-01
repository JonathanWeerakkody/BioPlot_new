from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import base64
import json
import os
import sys

app = Flask(__name__)
CORS(app)

@app.route('/api/cluster_heatmap', methods=['POST'])
def cluster_heatmap():
    try:
        # Import packages compatible with Python 3.12
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import numpy as np
        import pandas as pd
        import matplotlib.gridspec as gridspec
        from scipy.cluster.hierarchy import linkage, dendrogram
        from scipy.spatial.distance import pdist
        import seaborn as sns
        
        # Get data and options from request
        data = request.json.get('data', '')
        options = request.json.get('options', {})
        
        # Parse data
        lines = data.strip().split('\n')
        
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
        
        # Create DataFrame
        df = pd.DataFrame(data_rows, index=gene_names, columns=sample_line[1:])
        
        # Create group mapping
        groups = {}
        for i in range(1, len(group_line)):
            groups[sample_line[i]] = group_line[i]
        
        # Apply data transformations
        if options.get('logTransform', False):
            # Add a small value to avoid log(0)
            df = np.log2(df + 1)
        
        if options.get('normalizeData', True):
            # Z-score normalization (row-wise)
            df = (df - df.mean(axis=1).values.reshape(-1, 1)) / df.std(axis=1).values.reshape(-1, 1)
        
        # Set up figure dimensions
        width = options.get('width', 800) / 100
        height = options.get('height', 600) / 100
        
        # Get color scheme
        color_scheme = options.get('colorScheme', 'viridis')
        
        # Set distance metric
        distance_metric = options.get('distanceMetric', 'euclidean')
        
        # Set linkage method
        linkage_method = options.get('linkageMethod', 'complete')
        
        # Use seaborn's clustermap for a more modern implementation
        # This handles the clustering and visualization in one step
        g = sns.clustermap(
            df,
            figsize=(width, height),
            cmap=color_scheme,
            method=linkage_method,
            metric=distance_metric,
            xticklabels=True,
            yticklabels=True,
            dendrogram_ratio=(0.15, 0.15),
            cbar_pos=(0.02, 0.8, 0.05, 0.18),
            row_cluster=options.get('showDendrograms', True),
            col_cluster=options.get('showDendrograms', True)
        )
        
        # Set font size
        font_size = options.get('fontSize', 12)
        plt.rcParams.update({'font.size': font_size})
        
        # Rotate x-axis labels
        plt.setp(g.ax_heatmap.get_xticklabels(), rotation=45, ha='right')
        
        # Set title and labels
        g.fig.suptitle(options.get('title', 'Cluster Heatmap'), fontsize=font_size + 4)
        g.fig.text(0.5, 0.01, options.get('subtitle', 'Gene Expression Data'), ha='center', fontsize=font_size + 2)
        
        # Add group annotations if requested
        if options.get('showGroupAnnotations', True):
            # Create a mapping of unique groups to colors
            unique_groups = list(set(groups.values()))
            group_colors = plt.cm.tab10(np.linspace(0, 1, len(unique_groups)))
            group_color_map = {group: color for group, color in zip(unique_groups, group_colors)}
            
            # Get the ordered sample names after clustering
            if options.get('showDendrograms', True):
                ordered_samples = [df.columns[i] for i in g.dendrogram_col.reordered_ind]
            else:
                ordered_samples = df.columns
            
            # Create a color array for the group bar
            group_colors_array = np.array([group_color_map[groups[sample]] for sample in ordered_samples])
            
            # Reshape for imshow
            group_colors_array = group_colors_array.reshape(1, -1, 4)
            
            # Create a new axis for the group bar
            ax_group = g.fig.add_axes([
                g.ax_heatmap.get_position().x0,
                g.ax_heatmap.get_position().y1 + 0.01,
                g.ax_heatmap.get_position().width,
                0.05
            ])
            
            # Plot the group bar
            ax_group.imshow(group_colors_array, aspect='auto')
            ax_group.set_xticks([])
            ax_group.set_yticks([])
            
            # Add a legend for groups
            handles = [plt.Rectangle((0, 0), 1, 1, color=group_color_map[group]) for group in unique_groups]
            ax_group.legend(handles, unique_groups, loc='upper right', title='Group', bbox_to_anchor=(1.15, 1))
        
        # Adjust layout
        plt.tight_layout(rect=[0, 0.03, 1, 0.95])
        
        # Save plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        
        # Encode the image to base64
        plot_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        plt.close()
        
        return jsonify({
            'plot': plot_data,
            'success': True
        })
    except Exception as e:
        return jsonify({'error': str(e), 'success': False})

# Keep existing routes
@app.route('/api/plot', methods=['POST'])
def plot():
    try:
        # Import packages compatible with Python 3.12
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import numpy as np
        import pandas as pd
        
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

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "API is running", "python_version": sys.version})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
