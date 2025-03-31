import matplotlib.pyplot as plt
import numpy as np
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

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
        
        # Create figure with specified size
        fig_width = options.get('width', 10)
        fig_height = options.get('height', 6)
        fig, ax = plt.subplots(figsize=(fig_width, fig_height), dpi=100)
        
        # Set font properties
        font_family = options.get('fontFamily', 'Arial')
        font_color = options.get('fontColor', '#333333')
        plt.rcParams['font.family'] = font_family
        
        # Apply background color if specified
        bg_color = options.get('backgroundColor', 'white')
        fig.patch.set_facecolor(bg_color)
        
        # Set title if provided
        if 'title' in options:
            title_font_size = options.get('titleFontSize', 16)
            plt.title(options['title'], fontsize=title_font_size, color=font_color)
        
        # Set axis labels if provided
        axis_font_size = options.get('axisFontSize', 14)
        if 'xAxisLabel' in options:
            plt.xlabel(options['xAxisLabel'], fontsize=axis_font_size, color=font_color)
        if 'yAxisLabel' in options:
            plt.ylabel(options['yAxisLabel'], fontsize=axis_font_size, color=font_color)
        
        # Set tick font size
        tick_font_size = options.get('tickFontSize', 12)
        plt.xticks(fontsize=tick_font_size, color=font_color)
        plt.yticks(fontsize=tick_font_size, color=font_color)
        
        # Set grid color if specified
        grid_color = options.get('gridColor', '#CCCCCC')
        ax.grid(True, linestyle='--', alpha=0.7, color=grid_color)
        
        # Handle different chart types
        if chart_type == 'bar':
            # Basic bar chart
            bar_color = options.get('barColor', '#4285F4')
            border_color = options.get('borderColor', '#000000')
            border_width = options.get('borderWidth', 1)
            
            plt.bar(categories, values, color=bar_color, 
                   edgecolor=border_color, linewidth=border_width)
            
        elif chart_type == 'horizontalBar':
            # Horizontal bar chart
            bar_color = options.get('barColor', '#4285F4')
            border_color = options.get('borderColor', '#000000')
            border_width = options.get('borderWidth', 1)
            
            plt.barh(categories, values, color=bar_color, 
                    edgecolor=border_color, linewidth=border_width)
            
        elif chart_type == 'errorBar':
            # Error bar chart
            bar_color = options.get('barColor', '#4285F4')
            error_color = options.get('errorBarColor', '#FF0000')
            errors = data.get('errors', [0] * len(values))
            
            plt.bar(categories, values, color=bar_color, yerr=errors, 
                   capsize=options.get('capWidth', 10), 
                   error_kw={'ecolor': error_color, 'linewidth': options.get('errorBarWidth', 2)})
            
        elif chart_type == 'dualYBar':
            # Dual Y-axis bar chart
            primary_color = options.get('primaryColor', '#4285F4')
            secondary_color = options.get('secondaryColor', '#34A853')
            secondary_values = data.get('secondaryValues', [])
            
            # Primary axis
            ax.bar(categories, values, color=primary_color, label=options.get('primaryLabel', 'Primary'))
            
            # Secondary axis
            ax2 = ax.twinx()
            ax2.bar(categories, secondary_values, color=secondary_color, alpha=0.5, 
                   label=options.get('secondaryLabel', 'Secondary'))
            
            # Set secondary axis label
            if 'secondaryAxisLabel' in options:
                ax2.set_ylabel(options['secondaryAxisLabel'], fontsize=axis_font_size, color=font_color)
            
            # Add legend if enabled
            if options.get('showLegend', True):
                lines1, labels1 = ax.get_legend_handles_labels()
                lines2, labels2 = ax2.get_legend_handles_labels()
                ax.legend(lines1 + lines2, labels1 + labels2, loc='upper right')
            
        elif chart_type in ['verticalStackBar', 'horizontalStackBar']:
            # Stacked bar chart (vertical or horizontal)
            datasets = data.get('datasets', [])
            colors = options.get('colors', None)
            
            if not colors:
                # Default colors if not provided
                colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8F44AD', '#16A085', '#F39C12', '#7F8C8D']
            
            dataset_values = [dataset.get('values', []) for dataset in datasets]
            dataset_labels = [dataset.get('label', f'Dataset {i+1}') for i, dataset in enumerate(datasets)]
            
            if chart_type == 'verticalStackBar':
                plt.stackplot(categories, dataset_values, labels=dataset_labels, colors=colors)
            else:  # horizontalStackBar
                # For horizontal stacked bar, we need to transpose the data
                y_pos = np.arange(len(categories))
                bottom = np.zeros(len(categories))
                
                for i, values in enumerate(dataset_values):
                    plt.barh(y_pos, values, left=bottom, color=colors[i % len(colors)], label=dataset_labels[i])
                    bottom += values
                
                plt.yticks(y_pos, categories)
            
            # Add legend if enabled
            if options.get('showLegend', True):
                plt.legend()
            
        elif chart_type == 'polarBar':
            # Polar bar chart
            plt.figure(figsize=(fig_width, fig_height))
            ax = plt.subplot(111, polar=True)
            
            # Convert to radians for polar plot
            theta = np.linspace(0, 2*np.pi, len(categories), endpoint=False)
            
            # Get colors or use default
            colors = options.get('colors', None)
            if not colors:
                colors = [f'C{i}' for i in range(len(categories))]
                
            # Create the polar bar chart
            bars = ax.bar(theta, values, width=2*np.pi/len(categories)*0.8, 
                         bottom=0.0, alpha=options.get('colorOpacity', 0.7),
                         color=colors)
            
            # Set category labels
            ax.set_xticks(theta)
            ax.set_xticklabels(categories, fontsize=tick_font_size, color=font_color)
            
        elif chart_type == 'dotBar':
            # Bar chart with dots
            bar_color = options.get('barColor', 'rgba(66, 133, 244, 0.5)')
            dot_color = options.get('dotColor', '#FF0000')
            dot_size = options.get('dotSize', 6)
            
            # Create bars
            plt.bar(categories, values, color=bar_color, label=options.get('barLabel', 'Bar Values'))
            
            # Add dots on top
            plt.plot(categories, values, 'o', color=dot_color, 
                    markersize=dot_size, label=options.get('dotLabel', 'Dot Values'))
            
            # Add legend if enabled
            if options.get('showLegend', True):
                plt.legend()
                
        elif chart_type == 'verticalBarWithTrend':
            # Bar chart with trend line
            bar_color = options.get('barColor', '#4285F4')
            line_color = options.get('lineColor', '#FF0000')
            line_width = options.get('lineWidth', 2)
            show_points = options.get('showPoints', False)
            point_size = options.get('pointSize', 3)
            
            # Create bars
            plt.bar(categories, values, color=bar_color, label=options.get('barLabel', 'Bar Values'))
            
            # Add trend line
            if show_points:
                plt.plot(categories, values, '-o', color=line_color, 
                        linewidth=line_width, markersize=point_size,
                        label=options.get('lineLabel', 'Trend Line'))
            else:
                plt.plot(categories, values, '-', color=line_color, 
                        linewidth=line_width, 
                        label=options.get('lineLabel', 'Trend Line'))
            
            # Add legend if enabled
            if options.get('showLegend', True):
                plt.legend()
                
        elif chart_type == 'butterflyBar':
            # Butterfly bar chart (mirrored bars)
            left_color = options.get('leftColor', '#4285F4')
            right_color = options.get('rightColor', '#EA4335')
            left_values = values
            right_values = data.get('rightValues', [])
            
            # Convert right values to negative for butterfly effect
            right_values_neg = [-abs(val) for val in right_values]
            
            # Create figure with two subplots sharing y-axis
            fig, (ax1, ax2) = plt.subplots(1, 2, sharey=True, figsize=(fig_width, fig_height))
            fig.subplots_adjust(wspace=0)
            
            # Left side (positive values)
            ax1.barh(categories, left_values, color=left_color, align='center', 
                    label=options.get('leftLabel', 'Left Values'))
            ax1.set_xlabel(options.get('leftAxisLabel', 'Left Values'), fontsize=axis_font_size, color=font_color)
            
            # Right side (negative values but show as positive)
            ax2.barh(categories, right_values_neg, color=right_color, align='center',
                    label=options.get('rightLabel', 'Right Values'))
            ax2.set_xlabel(options.get('rightAxisLabel', 'Right Values'), fontsize=axis_font_size, color=font_color)
            
            # Customize the appearance
            ax1.invert_xaxis()  # Invert x-axis for left side
            ax1.yaxis.tick_left()
            ax2.yaxis.tick_right()
            
            # Show positive values on both sides
            ax2.xaxis.set_major_formatter(lambda x, pos: str(abs(x)))
            
            # Add legend if enabled
            if options.get('showLegend', True):
                ax1.legend(loc='upper right')
                ax2.legend(loc='upper left')
                
        elif chart_type in ['verticalGroupBar', 'horizontalGroupBar']:
            # Grouped bar chart (vertical or horizontal)
            datasets = data.get('datasets', [])
            colors = options.get('colors', None)
            
            if not colors:
                # Default colors if not provided
                colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8F44AD', '#16A085', '#F39C12', '#7F8C8D']
            
            # Number of groups and datasets
            n_groups = len(categories)
            n_datasets = len(datasets)
            
            # Width of a group of bars
            group_width = 0.8
            # Width of a single bar
            bar_width = group_width / n_datasets
            
            # Positions for each group of bars
            indices = np.arange(n_groups)
            
            if chart_type == 'verticalGroupBar':
                for i, dataset in enumerate(datasets):
                    # Offset each bar within its group
                    offset = (i - n_datasets / 2) * bar_width + bar_width / 2
                    plt.bar(indices + offset, dataset.get('values', []), 
                           width=bar_width, color=colors[i % len(colors)], 
                           label=dataset.get('label', f'Dataset {i+1}'))
                
                plt.xticks(indices, categories)
                
            else:  # horizontalGroupBar
                for i, dataset in enumerate(datasets):
                    # Offset each bar within its group
                    offset = (i - n_datasets / 2) * bar_width + bar_width / 2
                    plt.barh(indices + offset, dataset.get('values', []), 
                            height=bar_width, color=colors[i % len(colors)], 
                            label=dataset.get('label', f'Dataset {i+1}'))
                
                plt.yticks(indices, categories)
            
            # Add legend if enabled
            if options.get('showLegend', True):
                plt.legend()
                
        elif chart_type == 'geneUpDown':
            # Gene up/down regulation bar chart
            up_color = options.get('upColor', '#34A853')  # Green for up-regulated
            down_color = options.get('downColor', '#EA4335')  # Red for down-regulated
            neutral_color = options.get('neutralColor', '#FBBC05')  # Yellow for neutral
            threshold = options.get('threshold', 0)
            
            # Create colors based on values
            colors = []
            for value in values:
                if value > threshold:
                    colors.append(up_color)
                elif value < -threshold:
                    colors.append(down_color)
                else:
                    colors.append(neutral_color)
            
            plt.bar(categories, values, color=colors)
            
            # Add a horizontal line at threshold if specified
            if threshold > 0:
                plt.axhline(y=threshold, color='black', linestyle='--', alpha=0.7)
                plt.axhline(y=-threshold, color='black', linestyle='--', alpha=0.7)
        
        # Adjust layout
        plt.tight_layout()
        
        # Rotate x-axis labels if specified
        if 'labelRotation' in options and chart_type not in ['horizontalBar', 'horizontalStackBar', 'horizontalGroupBar']:
            plt.xticks(rotation=options['labelRotation'])
        
        # Save the figure to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        
        # Encode the image to base64
        img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        # Close the figure to free memory
        plt.close(fig)
        
        # Return the image as base64 data URL
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
