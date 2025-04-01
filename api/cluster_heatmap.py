import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import seaborn as sns
import io
import base64
from scipy.cluster.hierarchy import linkage, dendrogram
from scipy.spatial.distance import pdist
import matplotlib.gridspec as gridspec

def parse_data(data_str):
    """Parse tab-delimited data string into a pandas DataFrame."""
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
    
    # Create DataFrame
    df = pd.DataFrame(data_rows, index=gene_names, columns=sample_line[1:])
    
    # Create group mapping
    groups = {}
    for i in range(1, len(group_line)):
        groups[sample_line[i]] = group_line[i]
    
    return df, groups

def generate_cluster_heatmap(data_str, options):
    """Generate a cluster heatmap with dendrograms."""
    try:
        # Parse data
        df, groups = parse_data(data_str)
        
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
        
        # Create figure with GridSpec for layout
        fig = plt.figure(figsize=(width, height))
        
        # Define margins
        margin_top = options.get('marginTop', 50) / 100
        margin_right = options.get('marginRight', 50) / 100
        margin_bottom = options.get('marginBottom', 100) / 100
        margin_left = options.get('marginLeft', 100) / 100
        
        # Adjust figure margins
        fig.subplots_adjust(
            top=1 - margin_top/height,
            right=1 - margin_right/width,
            bottom=margin_bottom/height,
            left=margin_left/width
        )
        
        # Set up GridSpec for layout
        show_dendrograms = options.get('showDendrograms', True)
        
        if show_dendrograms:
            # Create grid with space for dendrograms
            gs = gridspec.GridSpec(2, 2, width_ratios=[0.15, 0.85], height_ratios=[0.15, 0.85])
            
            # Dendrogram for columns (samples)
            ax_col_dendrogram = fig.add_subplot(gs[0, 1])
            
            # Dendrogram for rows (genes)
            ax_row_dendrogram = fig.add_subplot(gs[1, 0])
            
            # Main heatmap
            ax_heatmap = fig.add_subplot(gs[1, 1])
            
            # Empty subplot for top-left corner
            ax_empty = fig.add_subplot(gs[0, 0])
            ax_empty.axis('off')
        else:
            # Just the heatmap without dendrograms
            gs = gridspec.GridSpec(1, 1)
            ax_heatmap = fig.add_subplot(gs[0, 0])
        
        # Set distance metric
        distance_metric = options.get('distanceMetric', 'euclidean')
        
        # Set linkage method
        linkage_method = options.get('linkageMethod', 'complete')
        
        # Compute linkage for rows (genes)
        row_linkage = linkage(
            pdist(df.values, metric=distance_metric),
            method=linkage_method
        )
        
        # Compute linkage for columns (samples)
        col_linkage = linkage(
            pdist(df.values.T, metric=distance_metric),
            method=linkage_method
        )
        
        # Get color scheme
        color_scheme = options.get('colorScheme', 'viridis')
        
        # Create color map
        if color_scheme in plt.colormaps():
            cmap = plt.get_cmap(color_scheme)
        else:
            # Default to viridis if specified colormap doesn't exist
            cmap = plt.get_cmap('viridis')
        
        # Set font size
        font_size = options.get('fontSize', 12)
        plt.rcParams.update({'font.size': font_size})
        
        if show_dendrograms:
            # Plot dendrograms
            row_dendrogram = dendrogram(
                row_linkage,
                orientation='left',
                ax=ax_row_dendrogram,
                no_labels=True
            )
            
            col_dendrogram = dendrogram(
                col_linkage,
                ax=ax_col_dendrogram,
                no_labels=True
            )
            
            # Get the reordering indices from dendrograms
            row_idx = row_dendrogram['leaves']
            col_idx = col_dendrogram['leaves']
            
            # Reorder data according to clustering
            df_clustered = df.iloc[row_idx, col_idx]
            
            # Hide axes for dendrograms
            ax_row_dendrogram.axis('off')
            ax_col_dendrogram.axis('off')
        else:
            # Without dendrograms, use original data order
            df_clustered = df
        
        # Plot heatmap
        im = ax_heatmap.imshow(df_clustered, aspect='auto', cmap=cmap)
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax_heatmap, shrink=0.8)
        cbar.set_label('Expression Value')
        
        # Set tick labels
        ax_heatmap.set_xticks(np.arange(len(df_clustered.columns)))
        ax_heatmap.set_yticks(np.arange(len(df_clustered.index)))
        
        ax_heatmap.set_xticklabels(df_clustered.columns, rotation=45, ha='right')
        ax_heatmap.set_yticklabels(df_clustered.index)
        
        # Add group annotations if requested
        if options.get('showGroupAnnotations', True):
            # Create a mapping of unique groups to colors
            unique_groups = list(set(groups.values()))
            group_colors = plt.cm.tab10(np.linspace(0, 1, len(unique_groups)))
            group_color_map = {group: color for group, color in zip(unique_groups, group_colors)}
            
            # Add a color bar for groups above the heatmap
            group_bar_height = 0.05
            
            # Get the ordered sample names after clustering
            if show_dendrograms:
                ordered_samples = df_clustered.columns
            else:
                ordered_samples = df.columns
            
            # Create a color array for the group bar
            group_colors_array = np.array([group_color_map[groups[sample]] for sample in ordered_samples])
            
            # Reshape for imshow
            group_colors_array = group_colors_array.reshape(1, -1, 4)
            
            # Create a new axis for the group bar
            ax_group = fig.add_axes([
                ax_heatmap.get_position().x0,
                ax_heatmap.get_position().y1 + 0.01,
                ax_heatmap.get_position().width,
                group_bar_height
            ])
            
            # Plot the group bar
            ax_group.imshow(group_colors_array, aspect='auto')
            ax_group.set_xticks([])
            ax_group.set_yticks([])
            
            # Add a legend for groups
            handles = [plt.Rectangle((0, 0), 1, 1, color=group_color_map[group]) for group in unique_groups]
            ax_group.legend(handles, unique_groups, loc='upper right', title='Group', bbox_to_anchor=(1.15, 1))
        
        # Set title and labels
        plt.suptitle(options.get('title', 'Cluster Heatmap'), fontsize=font_size + 4)
        fig.text(0.5, 0.01, options.get('subtitle', 'Gene Expression Data'), ha='center', fontsize=font_size + 2)
        
        ax_heatmap.set_xlabel(options.get('xAxisLabel', 'Samples'))
        ax_heatmap.set_ylabel(options.get('yAxisLabel', 'Genes'))
        
        # Adjust layout
        plt.tight_layout(rect=[0, 0.03, 1, 0.95])
        
        # Save plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        
        # Encode the image to base64
        plot_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        plt.close(fig)
        
        return {
            'plot': plot_data,
            'success': True
        }
    
    except Exception as e:
        return {
            'error': str(e),
            'success': False
        }

# For testing
if __name__ == "__main__":
    # Sample data
    sample_data = """Group\tA\tA\tA\tB\tB\tB
sample\tA-1\tA-2\tA-3\tB-1\tB-2\tB-3
ICA1\t5.7\t11.7\t9.9\t5.7\t4.5\t3.2
DBNDD1\t9.43\t10.67\t9.39\t3.4\t2.5\t2.3
ALS2\t10.59\t9.89\t8.5\t4.2\t5.75\t2.5
CASP10\t10.38\t10.2\t8.5\t5.1\t2.8\t2.4
CFLAR\t5.75\t10.85\t10.9\t3.9\t4.2\t2.8
TFPI\t9.82\t10.45\t8.5\t2.5\t3.4\t3.5
NDUFAF7\t8.9\t11.02\t10.33\t5.75\t2.4\t5.75
RBM5\t10.59\t10.67\t9.94\t6.55\t5.75\t5.55
MTMR7\t2.5\t5.2\t3.5\t9.21\t9.76\t11.47
SLC7A2\t3.5\t4.2\t2.5\t9.21\t11.78\t5.75
ARF5\t4.5\t3.2\t2.7\t9.89\t10.72\t8.81
SARM1\t3.5\t2.2\t1.9\t10.85\t9.76\t9.73
POLDIP2\t3.5\t4.2\t3.5\t11.33\t9.76\t10.49
PLXND1\t5.1\t1.2\t5.75\t11.22\t9.76\t8.81"""
    
    options = {
        'title': 'Test Cluster Heatmap',
        'subtitle': 'Sample Gene Expression Data',
        'colorScheme': 'viridis',
        'distanceMetric': 'euclidean',
        'linkageMethod': 'complete',
        'normalizeData': True,
        'showDendrograms': True,
        'showGroupAnnotations': True
    }
    
    result = generate_cluster_heatmap(sample_data, options)
    
    if result['success']:
        # Save the plot to a file for testing
        with open('test_heatmap.png', 'wb') as f:
            f.write(base64.b64decode(result['plot']))
        print("Test plot saved to test_heatmap.png")
    else:
        print("Error:", result['error'])
