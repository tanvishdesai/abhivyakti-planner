"""
Visualization module for Abhi Vyakti Festival Planner.
Creates interactive graphs and network visualizations of performances.
"""

import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from collections import defaultdict
from typing import Dict, List, Tuple
import streamlit as st
import numpy as np


class PerformanceVisualizer:
    """
    Visualizes festival performances as interactive network graphs.
    """
    
    def __init__(self, df: pd.DataFrame, schedule_dict: Dict, itinerary: List[Dict] = None):
        """
        Initialize visualizer with performance data.
        
        Args:
            df: DataFrame with performance data
            schedule_dict: Day-organized performance schedule
            itinerary: Optional list of performances in the generated itinerary
        """
        self.df = df
        self.schedule_dict = schedule_dict
        self.graph = None
        self.itinerary = itinerary or []
        # Create a set of event_ids in the itinerary for faster lookup
        self.itinerary_event_ids = frozenset(perf.get('event_id') for perf in self.itinerary)
    
    def _compute_hierarchical_layout(self, G: nx.DiGraph, levels: int = 3) -> Dict:
        """
        Compute hierarchical/layered layout for a directed graph.
        Places nodes in horizontal layers to avoid tangling.
        
        Args:
            G: Directed graph
            levels: Number of hierarchical levels
            
        Returns:
            Dictionary mapping node names to (x, y) positions
        """
        pos = {}
        
        # Assign nodes to levels based on their type
        level_nodes = {0: [], 1: [], 2: []}
        for node in G.nodes():
            node_type = G.nodes[node].get('node_type', 'performance')
            if node_type == 'category':
                level_nodes[0].append(node)
            elif node_type == 'venue':
                level_nodes[1].append(node)
            else:  # performance
                level_nodes[2].append(node)
        
        # Position nodes in each level
        y_positions = {0: 1.0, 1: 0.5, 2: 0.0}
        
        for level, nodes in level_nodes.items():
            y = y_positions[level]
            # Spread nodes horizontally
            num_nodes = len(nodes)
            if num_nodes == 1:
                x_positions = [0.5]
            else:
                x_positions = [i / (num_nodes - 1) for i in range(num_nodes)]
            
            # Add some grouping for performances under venues using a sugiyama-like approach
            if level == 2:  # Performance level
                # Group performances by their parent venue
                pos = self._layout_performances_by_venue(G, pos, nodes)
            else:
                for node, x_pos in zip(nodes, x_positions):
                    pos[node] = (x_pos, y)
        
        return pos
    
    def _layout_performances_by_venue(self, G: nx.DiGraph, pos: Dict, perf_nodes: List) -> Dict:
        """
        Layout performance nodes grouped under their parent venues.
        Creates organized columns for each venue.
        
        Args:
            G: Directed graph
            pos: Existing position dictionary
            perf_nodes: List of performance nodes to position
            
        Returns:
            Updated position dictionary
        """
        # Group performances by their parent venue
        venue_groups = defaultdict(list)
        for perf_node in perf_nodes:
            # Find parent venue
            for pred in G.predecessors(perf_node):
                if G.nodes[pred].get('node_type') == 'venue':
                    venue_groups[pred].append(perf_node)
                    break
        
        # Position each group in a column
        venues_list = list(venue_groups.keys())
        num_venues = len(venues_list)
        
        y_base = 0.0
        for venue_idx, venue in enumerate(venues_list):
            # X position based on parent venue's x position
            if venue in pos:
                parent_x = pos[venue][0]
            else:
                parent_x = venue_idx / max(num_venues - 1, 1)
            
            # Y spacing for performances under each venue
            perfs = venue_groups[venue]
            num_perfs = len(perfs)
            
            for perf_idx, perf in enumerate(perfs):
                # Slight horizontal jitter to avoid complete overlap
                x = parent_x + (perf_idx - num_perfs / 2) * 0.02
                y = y_base - (perf_idx + 1) * 0.1
                pos[perf] = (x, y)
        
        return pos
    
    def _compute_hub_and_spoke_layout(self, G: nx.DiGraph, hub_type: str) -> Dict:
        """
        Compute hub-and-spoke layout where hub nodes are arranged in a circle
        and leaf nodes radiate outward.
        
        Args:
            G: Directed graph
            hub_type: Type of hub nodes ('category', 'venue', 'date')
            
        Returns:
            Dictionary mapping node names to (x, y) positions
        """
        pos = {}
        
        # Separate hub and leaf nodes
        hub_nodes = []
        leaf_nodes = defaultdict(list)
        
        for node in G.nodes():
            node_type = G.nodes[node].get('node_type', 'performance')
            if node_type == hub_type:
                hub_nodes.append(node)
            else:
                # Find parent hub
                for pred in G.predecessors(node):
                    if G.nodes[pred].get('node_type') == hub_type:
                        leaf_nodes[pred].append(node)
                        break
        
        # Position hub nodes in a circle
        num_hubs = len(hub_nodes)
        hub_radius = 0.3
        
        for i, hub in enumerate(hub_nodes):
            angle = 2 * 3.14159 * i / max(num_hubs, 1)
            x = 0.5 + hub_radius * np.cos(angle)
            y = 0.5 + hub_radius * np.sin(angle)
            pos[hub] = (x, y)
        
        # Position leaf nodes radiating from their hub
        for hub, leaves in leaf_nodes.items():
            hub_x, hub_y = pos[hub]
            num_leaves = len(leaves)
            leaf_radius = 0.15
            
            for j, leaf in enumerate(leaves):
                angle = 2 * 3.14159 * j / max(num_leaves, 1)
                # Radiate outward from hub
                leaf_x = hub_x + leaf_radius * np.cos(angle)
                leaf_y = hub_y + leaf_radius * np.sin(angle)
                pos[leaf] = (leaf_x, leaf_y)
        
        return pos
    
    def create_hierarchical_network(self) -> go.Figure:
        """
        Create hierarchical network: Categories → Venues → Performances
        
        Returns:
            Interactive Plotly figure with full hierarchy
        """
        # Create directed graph
        G = nx.DiGraph()
        
        # Extract main venues
        self.df['Main_Venue'] = self.df['Venue'].str.split(',').str[0]
        
        # Level 1: Add category nodes (ROOT)
        categories = self.df['Category'].unique()
        for category in categories:
            G.add_node(f"CAT_{category}", node_type='category', label=category, size=50)
        
        # Level 2: Add venue nodes as sub-parents under categories
        for category in categories:
            venues_in_category = self.df[self.df['Category'] == category]['Main_Venue'].unique()
            for venue in venues_in_category:
                venue_key = f"VEN_{venue}_{category}"
                G.add_node(venue_key, node_type='venue', label=venue, size=35)
                # Connect venue to its category
                G.add_edge(f"CAT_{category}", venue_key)
        
        # Level 3: Add performance nodes (LEAF)
        for idx, row in self.df.iterrows():
            perf_key = f"PERF_{row['Event_ID']}"
            perf_label = f"{row['Event_Name'][:15]}...\n{row['Time']}"
            G.add_node(
                perf_key, 
                node_type='performance', 
                label=perf_label,
                size=12,
                category=row['Category'],
                venue=row['Main_Venue']
            )
            
            # Connect performance to its venue
            venue_key = f"VEN_{row['Main_Venue']}_{row['Category']}"
            G.add_edge(venue_key, perf_key)
        
        # Use proper hierarchical layout
        pos = self._compute_hierarchical_layout(G)
        
        # Extract edges
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])
        
        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            mode='lines',
            line=dict(width=1, color='#aaa'),
            hoverinfo='none',
            showlegend=False
        )
        
        # Extract node data by type
        category_x, category_y, category_text, category_hover = [], [], [], []
        venue_x, venue_y, venue_text, venue_hover = [], [], [], []
        perf_x, perf_y, perf_text, perf_hover = [], [], [], []
        
        # Color mapping for categories
        color_map = {'Music': '#FF6B6B', 'Dance': '#4ECDC4', 'Theater': '#45B7D1'}
        
        for node in G.nodes():
            x, y = pos[node]
            node_data = G.nodes[node]
            node_type = node_data['node_type']
            label = node_data['label']
            
            if node_type == 'category':
                category_x.append(x)
                category_y.append(y)
                category_text.append(label)
                perf_count = len(self.df[self.df['Category'] == label])
                category_hover.append(f"<b>{label}</b><br>Performances: {perf_count}")
                
            elif node_type == 'venue':
                venue_x.append(x)
                venue_y.append(y)
                venue_text.append(label.split(',')[0] if ',' in label else label)
                category = label.split('_')[-1] if '_' in label else 'Mixed'
                perf_count = len(self.df[self.df['Main_Venue'] == label.replace(f'_{category}', '')])
                venue_hover.append(f"<b>{label}</b><br>Performances: {perf_count}")
                
            elif node_type == 'performance':
                perf_x.append(x)
                perf_y.append(y)
                perf_text.append('•')  # Bullet point annotation
                perf_hover.append(label)
        
        # Category nodes (TOP LEVEL - largest)
        category_trace = go.Scatter(
            x=category_x, y=category_y,
            mode='markers+text',
            text=category_text,
            textposition='middle center',
            textfont=dict(size=12, color='white', family='Arial Black'),
            hovertext=category_hover,
            hoverinfo='text',
            marker=dict(
                size=55,
                color=['#FF6B6B', '#4ECDC4', '#45B7D1'],
                line=dict(width=3, color='white'),
                symbol='circle'
            ),
            name='Categories'
        )
        
        # Venue nodes (MIDDLE LEVEL - medium)
        venue_trace = go.Scatter(
            x=venue_x, y=venue_y,
            mode='markers+text',
            text=venue_text,
            textposition='middle center',
            textfont=dict(size=9, color='white'),
            hovertext=venue_hover,
            hoverinfo='text',
            marker=dict(
                size=35,
                color=['#FFE66D', '#95E1D3', '#F38181'] * len(venue_x),
                line=dict(width=2, color='white'),
                symbol='diamond'
            ),
            name='Venues'
        )
        
        # Performance nodes (LEAF LEVEL - small)
        perf_trace = go.Scatter(
            x=perf_x, y=perf_y,
            mode='markers+text',
            text=perf_text,
            textposition='middle center',
            textfont=dict(size=8, color='white', family='Arial'),
            hovertext=perf_hover,
            hoverinfo='text',
            marker=dict(
                size=10,
                color='#B19CD9',
                line=dict(width=1, color='#6B4C9A'),
                symbol='circle'
            ),
            name='Performances'
        )
        
        # Create figure
        fig = go.Figure(data=[edge_trace, category_trace, venue_trace, perf_trace])
        
        fig.update_layout(
            title={
                'text': '🎭 Complete Festival Hierarchy: Categories → Venues → Performances',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 18}
            },
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=80),
            plot_bgcolor='#f0f0f0',
            paper_bgcolor='#ffffff',
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=800,
            font=dict(family='Arial, sans-serif'),
            annotations=[
                dict(
                    text='<b>Large nodes:</b> Categories | <b>Medium nodes:</b> Venues | <b>Small nodes:</b> Performances<br><b>Hover</b> over nodes for details',
                    x=0.5, y=-0.05, xref='paper', yref='paper',
                    showarrow=False, xanchor='center', font=dict(size=11, color='#666')
                )
            ]
        )
        
        return fig

    def create_category_network(self) -> go.Figure:
        """
        Create network showing performances connected by categories.

        Returns:
            Interactive Plotly figure
        """
        # Create directed graph
        G = nx.DiGraph()

        # Add nodes for categories
        categories = self.df['Category'].unique()
        for category in categories:
            G.add_node(category, node_type='category', size=40)

        # Add nodes for performances and edges
        for idx, row in self.df.iterrows():
            perf_label = f"{row['Event_Name'][:20]}...\n({row['Time']})"
            G.add_node(perf_label, node_type='performance', size=20)

            # Connect performance to its category
            G.add_edge(row['Category'], perf_label)

        # Calculate layout - use hierarchical for clarity
        pos = self._compute_hub_and_spoke_layout(G, 'category')

        # Extract edge traces
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])

        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            mode='lines',
            line=dict(width=0.5, color='#888'),
            hoverinfo='none',
            showlegend=False
        )

        # Extract node traces (separate for categories and performances)
        category_x = []
        category_y = []
        category_text = []

        perf_x = []
        perf_y = []
        perf_text = []

        for node in G.nodes():
            x, y = pos[node]
            if G.nodes[node]['node_type'] == 'category':
                category_x.append(x)
                category_y.append(y)
                category_text.append(node)
            else:
                perf_x.append(x)
                perf_y.append(y)
                perf_text.append(node)

        # Category nodes
        category_trace = go.Scatter(
            x=category_x, y=category_y,
            mode='markers+text',
            text=category_text,
            textposition='top center',
            hoverinfo='text',
            marker=dict(
                size=30,
                color=['#FF6B6B', '#4ECDC4', '#45B7D1'],
                line=dict(width=2, color='white')
            ),
            name='Categories'
        )

        # Performance nodes
        perf_trace = go.Scatter(
            x=perf_x, y=perf_y,
            mode='markers',
            text=perf_text,
            hoverinfo='text',
            marker=dict(
                size=10,
                color='#95E1D3',
                line=dict(width=1, color='white')
            ),
            name='Performances'
        )

        # Create figure
        fig = go.Figure(data=[edge_trace, category_trace, perf_trace])

        fig.update_layout(
            title='Festival Performances Network - By Category',
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=40),
            plot_bgcolor='#f8f9fa',
            paper_bgcolor='#ffffff',
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=700
        )

        return fig

    def create_venue_network(self) -> go.Figure:
        """
        Create network showing performances connected by venues.
        
        Returns:
            Interactive Plotly figure
        """
        # Create graph
        G = nx.DiGraph()
        
        # Add venue nodes
        venues = self.df['Venue'].unique()
        for venue in venues:
            # Extract main venue
            main_venue = venue.split(',')[0]
            G.add_node(main_venue, node_type='venue', size=40)
        
        # Add performance nodes
        for idx, row in self.df.iterrows():
            perf_label = f"{row['Event_Name'][:15]}...\n{row['Category']}"
            G.add_node(perf_label, node_type='performance', size=15)
            
            # Connect to venue
            main_venue = row['Venue'].split(',')[0]
            G.add_edge(main_venue, perf_label)
        
        # Calculate layout - use hub and spoke for clarity
        pos = self._compute_hub_and_spoke_layout(G, 'venue')
        
        # Extract edges
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])
        
        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            mode='lines',
            line=dict(width=0.5, color='#888'),
            hoverinfo='none',
            showlegend=False
        )
        
        # Extract venue and performance nodes
        venue_x, venue_y, venue_text = [], [], []
        perf_x, perf_y, perf_text = [], [], []
        
        for node in G.nodes():
            x, y = pos[node]
            if G.nodes[node]['node_type'] == 'venue':
                venue_x.append(x)
                venue_y.append(y)
                venue_text.append(node)
            else:
                perf_x.append(x)
                perf_y.append(y)
                perf_text.append(node)
        
        # Venue nodes
        venue_trace = go.Scatter(
            x=venue_x, y=venue_y,
            mode='markers+text',
            text=venue_text,
            textposition='top center',
            hoverinfo='text',
            marker=dict(
                size=35,
                color=['#FFE66D', '#95E1D3', '#F38181'],
                line=dict(width=2, color='white')
            ),
            name='Venues'
        )
        
        # Performance nodes
        perf_trace = go.Scatter(
            x=perf_x, y=perf_y,
            mode='markers',
            text=perf_text,
            hoverinfo='text',
            marker=dict(
                size=8,
                color='#C7CEEA',
                line=dict(width=0.5, color='white')
            ),
            name='Performances'
        )
        
        fig = go.Figure(data=[edge_trace, venue_trace, perf_trace])
        
        fig.update_layout(
            title='Festival Performances Network - By Venue',
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=40),
            plot_bgcolor='#f8f9fa',
            paper_bgcolor='#ffffff',
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=700
        )
        
        return fig
    
    def create_date_network(self) -> go.Figure:
        """
        Create network showing performances connected by dates.
        
        Returns:
            Interactive Plotly figure
        """
        # Create graph
        G = nx.DiGraph()
        
        # Add date nodes
        dates = self.df['Date'].unique()
        for date in dates:
            date_str = pd.to_datetime(date).strftime('%b %d')
            G.add_node(date_str, node_type='date', size=40)
        
        # Add performance nodes
        for idx, row in self.df.iterrows():
            perf_label = f"{row['Event_Name'][:12]}...\n{row['Time']}"
            G.add_node(perf_label, node_type='performance', size=15)
            
            # Connect to date
            date_str = pd.to_datetime(row['Date']).strftime('%b %d')
            G.add_edge(date_str, perf_label)
        
        # Calculate layout - use hub and spoke for clarity
        pos = self._compute_hub_and_spoke_layout(G, 'date')
        
        # Extract edges
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])
        
        edge_trace = go.Scatter(
            x=edge_x, y=edge_y,
            mode='lines',
            line=dict(width=0.5, color='#888'),
            hoverinfo='none',
            showlegend=False
        )
        
        # Extract date and performance nodes
        date_x, date_y, date_text = [], [], []
        perf_x, perf_y, perf_text = [], [], []
        
        for node in G.nodes():
            x, y = pos[node]
            if G.nodes[node]['node_type'] == 'date':
                date_x.append(x)
                date_y.append(y)
                date_text.append(node)
            else:
                perf_x.append(x)
                perf_y.append(y)
                perf_text.append(node)
        
        # Date nodes
        date_trace = go.Scatter(
            x=date_x, y=date_y,
            mode='markers+text',
            text=date_text,
            textposition='top center',
            hoverinfo='text',
            marker=dict(
                size=32,
                color='#B19CD9',
                line=dict(width=2, color='white')
            ),
            name='Dates'
        )
        
        # Performance nodes
        perf_trace = go.Scatter(
            x=perf_x, y=perf_y,
            mode='markers',
            text=perf_text,
            hoverinfo='text',
            marker=dict(
                size=8,
                color='#FFB6C1',
                line=dict(width=0.5, color='white')
            ),
            name='Performances'
        )
        
        fig = go.Figure(data=[edge_trace, date_trace, perf_trace])
        
        fig.update_layout(
            title='Festival Performances Network - By Date',
            showlegend=True,
            hovermode='closest',
            margin=dict(b=20, l=5, r=5, t=40),
            plot_bgcolor='#f8f9fa',
            paper_bgcolor='#ffffff',
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            height=700
        )
        
        return fig
    
    def create_category_distribution(self) -> go.Figure:
        """Create pie chart of category distribution."""
        category_counts = self.df['Category'].value_counts()
        
        fig = go.Figure(data=[go.Pie(
            labels=category_counts.index,
            values=category_counts.values,
            marker=dict(colors=['#FF6B6B', '#4ECDC4', '#45B7D1']),
            textposition='inside',
            textinfo='label+percent',
            hovertemplate='<b>%{label}</b><br>Performances: %{value}<br>Percentage: %{percent}<extra></extra>'
        )])
        
        fig.update_layout(
            title='Distribution of Performances by Category',
            height=500,
            paper_bgcolor='#ffffff',
        )
        
        return fig
    
    def create_venue_distribution(self) -> go.Figure:
        """Create bar chart of performances by venue."""
        # Extract main venues
        self.df['Main_Venue'] = self.df['Venue'].str.split(',').str[0]
        venue_counts = self.df['Main_Venue'].value_counts().sort_values(ascending=True)
        
        fig = go.Figure(data=[go.Bar(
            x=venue_counts.values,
            y=venue_counts.index,
            orientation='h',
            marker=dict(color=['#FFE66D', '#95E1D3', '#F38181']),
            text=venue_counts.values,
            textposition='outside',
            hovertemplate='<b>%{y}</b><br>Performances: %{x}<extra></extra>'
        )])
        
        fig.update_layout(
            title='Number of Performances by Venue',
            xaxis_title='Number of Performances',
            height=400,
            paper_bgcolor='#ffffff',
            showlegend=False
        )
        
        return fig
    
    def create_subcategory_sunburst(self) -> go.Figure:
        """
        Create sunburst chart showing category->subcategory hierarchy.
        """
        # Prepare data
        data = []
        for idx, row in self.df.iterrows():
            data.append({
                'Category': row['Category'],
                'SubCategory': row['Sub_Category'],
                'Count': 1
            })
        
        df_hier = pd.DataFrame(data)
        
        # Group and count
        grouped = df_hier.groupby(['Category', 'SubCategory']).size().reset_index(name='Count')
        
        fig = go.Figure(go.Sunburst(
            labels=['All'] + grouped['Category'].unique().tolist() + grouped['SubCategory'].tolist(),
            parents=[''] + ['All'] * len(grouped['Category'].unique()) + grouped['Category'].tolist(),
            values=[len(df_hier)] + [grouped[grouped['Category'] == cat]['Count'].sum() 
                                     for cat in grouped['Category'].unique()] + grouped['Count'].tolist(),
            marker=dict(
                colorscale='RdBu',
                line=dict(color='white', width=2)
            ),
            hovertemplate='<b>%{label}</b><br>Count: %{value}<extra></extra>'
        ))
        
        fig.update_layout(
            title='Performance Hierarchy: Category → Sub-Category',
            height=600,
            paper_bgcolor='#ffffff'
        )
        
        return fig
    
    def create_itinerary_timeline(self, performances: List[Dict]) -> go.Figure:
        """
        Create timeline visualization for a selected itinerary.
        
        Args:
            performances: List of selected performances
            
        Returns:
            Timeline figure
        """
        if not performances:
            return go.Figure().add_annotation(text="No performances selected")
        
        # Prepare data
        timeline_data = []
        for perf in performances:
            timeline_data.append({
                'Performance': perf['event_name'],
                'Category': perf['category'],
                'Venue': perf['main_venue'],
                'Time': perf['time'],
                'Date': 'TBD'  # Will be extracted from schedule
            })
        
        df_timeline = pd.DataFrame(timeline_data)
        
        # Create bar chart as timeline
        fig = go.Figure()
        
        categories = df_timeline['Category'].unique()
        colors = {'Music': '#FF6B6B', 'Dance': '#4ECDC4', 'Theater': '#45B7D1'}
        
        for category in categories:
            cat_data = df_timeline[df_timeline['Category'] == category]
            fig.add_trace(go.Bar(
                y=cat_data['Performance'],
                x=[1] * len(cat_data),
                orientation='h',
                name=category,
                marker=dict(color=colors.get(category, '#95E1D3')),
                hovertemplate='<b>%{y}</b><br>Category: ' + category + '<extra></extra>'
            ))
        
        fig.update_layout(
            title='Your Festival Itinerary',
            barmode='stack',
            xaxis_title='',
            height=600,
            paper_bgcolor='#ffffff',
            xaxis=dict(showticklabels=False),
            showlegend=True
        )
        
        return fig
    
    def create_performance_comparison_table(self) -> pd.DataFrame:
        """Create detailed comparison table of all performances."""
        display_df = self.df[[
            'Event_Name',
            'Category',
            'Sub_Category',
            'Venue',
            'Date',
            'Time',
            'Description'
        ]].copy()
        
        display_df['Date'] = pd.to_datetime(display_df['Date']).dt.strftime('%b %d, %Y')
        display_df = display_df.sort_values(['Date', 'Time'])
        
        return display_df


    def create_itinerary_highlighted_network(self) -> go.Figure:
        """
        Create the hierarchical network with itinerary performances HIGHLIGHTED.
        
        This visualization shows:
        - All performances in light gray
        - Itinerary performances highlighted with bold colors and larger size
        - Edges connecting to itinerary performances are highlighted in bold
        
        Returns:
            Interactive Plotly figure with highlighted itinerary path
        """
        if not self.itinerary:
            st.warning("No itinerary to visualize. Generate an itinerary first.")
            return self.create_hierarchical_network()
        
        # Create directed graph
        G = nx.DiGraph()
        
        # Extract main venues
        self.df['Main_Venue'] = self.df['Venue'].str.split(',').str[0]
        
        # Level 1: Add category nodes (ROOT)
        categories = self.df['Category'].unique()
        for category in categories:
            G.add_node(f"CAT_{category}", node_type='category', label=category, size=50)
        
        # Level 2: Add venue nodes as sub-parents under categories
        for category in categories:
            venues_in_category = self.df[self.df['Category'] == category]['Main_Venue'].unique()
            for venue in venues_in_category:
                venue_key = f"VEN_{venue}_{category}"
                G.add_node(venue_key, node_type='venue', label=venue, size=35)
                # Connect venue to its category
                G.add_edge(f"CAT_{category}", venue_key)
        
        # Level 3: Add performance nodes (LEAF)
        for idx, row in self.df.iterrows():
            perf_key = f"PERF_{row['Event_ID']}"
            perf_label = f"{row['Event_Name'][:15]}...\n{row['Time']}"
            G.add_node(
                perf_key, 
                node_type='performance', 
                label=perf_label,
                size=12,
                category=row['Category'],
                venue=row['Main_Venue'],
                event_id=row['Event_ID'],
                in_itinerary=(row['Event_ID'] in self.itinerary_event_ids)
            )
            
            # Connect performance to its venue
            venue_key = f"VEN_{row['Main_Venue']}_{row['Category']}"
            G.add_edge(venue_key, perf_key)
        
        # Use proper hierarchical layout
        pos = self._compute_hierarchical_layout(G)
        
        # Extract edges - separate highlighted and regular
        regular_edge_x = []
        regular_edge_y = []
        highlighted_edge_x = []
        highlighted_edge_y = []
        
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            
            # Check if this edge leads to an itinerary performance
            edge_to_node = G.nodes[edge[1]]
            if edge_to_node.get('node_type') == 'performance' and edge_to_node.get('in_itinerary', False):
                highlighted_edge_x.extend([x0, x1, None])
                highlighted_edge_y.extend([y0, y1, None])
            else:
                regular_edge_x.extend([x0, x1, None])
                regular_edge_y.extend([y0, y1, None])
        
        # Regular edge trace (light)
        edge_trace_regular = go.Scatter(
            x=regular_edge_x, y=regular_edge_y,
            mode='lines',
            line=dict(width=0.5, color='#ddd'),
            hoverinfo='none',
            showlegend=False
        )
        
        # Highlighted edge trace (bold)
        edge_trace_highlighted = go.Scatter(
            x=highlighted_edge_x, y=highlighted_edge_y,
            mode='lines',
            line=dict(width=2.5, color='#FF6B6B'),
            hoverinfo='none',
            showlegend=False,
            name='Itinerary Path'
        )
        
        # Extract node data by type
        category_x, category_y, category_text, category_hover = [], [], [], []
        venue_x, venue_y, venue_text, venue_hover = [], [], [], []
        perf_x, perf_y, perf_text, perf_hover, perf_colors = [], [], [], [], []
        
        # Color mapping for categories
        color_map = {'Music': '#FF6B6B', 'Dance': '#4ECDC4', 'Theater': '#45B7D1'}
        
        for node in G.nodes():
            x, y = pos[node]
            node_data = G.nodes[node]
            node_type = node_data['node_type']
            label = node_data['label']
            
            if node_type == 'category':
                category_x.append(x)
                category_y.append(y)
                category_text.append(label)
                perf_count = len(self.df[self.df['Category'] == label])
                category_hover.append(f"<b>{label}</b><br>Performances: {perf_count}")
                
            elif node_type == 'venue':
                venue_x.append(x)
                venue_y.append(y)
                venue_text.append(label.split(',')[0] if ',' in label else label)
                category = label.split('_')[-1] if '_' in label else 'Mixed'
                perf_count = len(self.df[self.df['Main_Venue'] == label.replace(f'_{category}', '')])
                venue_hover.append(f"<b>{label}</b><br>Performances: {perf_count}")
                
            elif node_type == 'performance':
                perf_x.append(x)
                perf_y.append(y)
                perf_text.append('•')
                
                in_itinerary = node_data.get('in_itinerary', False)
                if in_itinerary:
                    # Highlight this performance
                    perf_colors.append('#FF6B6B')
                    perf_hover.append(f"<b>✓ IN ITINERARY</b><br>{label}")
                else:
                    # Regular performance
                    perf_colors.append('#D3D3D3')
                    perf_hover.append(label)
        
        # Category nodes (TOP LEVEL - largest)
        category_trace = go.Scatter(
            x=category_x, y=category_y,
            mode='markers+text',
            text=category_text,
            textposition='middle center',
            textfont=dict(size=12, color='white', family='Arial Black'),
            hovertext=category_hover,
            hoverinfo='text',
            marker=dict(
                size=55,
                color=['#FF6B6B', '#4ECDC4', '#45B7D1'],
                line=dict(width=3, color='white'),
                symbol='circle'
            ),
            name='Categories'
        )
        
        # Venue nodes (MIDDLE LEVEL - medium)
        venue_trace = go.Scatter(
            x=venue_x, y=venue_y,
            mode='markers+text',
            text=venue_text,
            textposition='middle center',
            textfont=dict(size=9, color='white'),
            hovertext=venue_hover,
            hoverinfo='text',
            marker=dict(
                size=35,
                color=['#FFE66D', '#95E1D3', '#F38181'] * len(venue_x),
                line=dict(width=2, color='white'),
                symbol='diamond'
            ),
            name='Venues'
        )
        
        # Performance nodes (LEAF LEVEL - small, with highlighting)
        perf_trace = go.Scatter(
            x=perf_x, y=perf_y,
            mode='markers+text',
            text=perf_text,
            textposition='middle center',
            textfont=dict(size=8, color='white', family='Arial'),
            hovertext=perf_hover,
            hoverinfo='text',
            marker=dict(
                size=[15 if c == '#FF6B6B' else 10 for c in perf_colors],  # Larger for itinerary
                color=perf_colors,
                line=dict(width=[3 if c == '#FF6B6B' else 1 for c in perf_colors], color='#333'),
                symbol='circle'
            ),
            name='Performances'
        )
        
        # Create figure
        fig = go.Figure(data=[edge_trace_regular, edge_trace_highlighted, category_trace, venue_trace, perf_trace])
        
        fig.update_layout(
            title={
                'text': '🎪 Your Optimal Itinerary Path (Highlighted in Red)',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 18}
            },
            showlegend=True,
            hovermode='closest',
            margin=dict(b=0, l=0, r=0, t=40),
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            plot_bgcolor='rgba(240, 240, 240, 0.9)',
            paper_bgcolor='white',
            width=1200,
            height=700
        )
        
        return fig


def display_visualization_dashboard(df: pd.DataFrame, schedule_dict: Dict, itinerary: List[Dict] = None):
    """
    Display full visualization dashboard in Streamlit.
    
    Args:
        df: Performance DataFrame
        schedule_dict: Schedule dictionary
        itinerary: Optional list of performances in the generated itinerary
    """
    st.header("📊 Performance Network Visualization")
    
    # Initialize visualizer with optional itinerary
    viz = PerformanceVisualizer(df, schedule_dict, itinerary)
    
    # Add tab for itinerary visualization if provided
    if itinerary:
        # Create tabs for different visualizations (with itinerary first)
        tab0, tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8 = st.tabs([
            "🎪 Your Itinerary",
            "🎭 Complete Hierarchy",
            "🌐 Category Network",
            "📍 Venue Network",
            "📅 Date Network",
            "🎭 Category Distribution",
            "🏢 Venue Distribution",
            "🌳 Hierarchy View",
            "📋 Detailed View"
        ])
        
        with tab0:
            st.subheader("🎪 Your Optimal Itinerary (Highlighted)")
            st.info(f"""
            **Your personalized itinerary includes {len(itinerary)} performances across {len(set(p.get('date') for p in itinerary))} days!**
            
            - **Red nodes (●):** Performances in your itinerary (LARGER and more prominent)
            - **Red edges:** Connections to your selected performances
            - **Gray elements:** Other available performances
            
            Hover over red nodes to see details. This visualization shows your optimal path through the festival!
            """)
            fig = viz.create_itinerary_highlighted_network()
            st.plotly_chart(fig, use_container_width=True)
            
            # Add itinerary summary
            st.subheader("📋 Itinerary Summary")
            itin_col1, itin_col2, itin_col3 = st.columns(3)
            with itin_col1:
                st.metric("Total Performances", len(itinerary))
            with itin_col2:
                st.metric("Festival Days", len(set(p.get('date') for p in itinerary)))
            with itin_col3:
                categories = set(p.get('category') for p in itinerary)
                st.metric("Categories", len(categories))
    else:
        # Create tabs without itinerary
        tab1, tab2, tab3, tab4, tab5, tab6, tab7, tab8 = st.tabs([
            "🎭 Complete Hierarchy",
            "🌐 Category Network",
            "📍 Venue Network",
            "📅 Date Network",
            "🎭 Category Distribution",
            "🏢 Venue Distribution",
            "🌳 Hierarchy View",
            "📋 Detailed View"
        ])
    
    with tab1:
        st.subheader("Complete Festival Hierarchy Network")
        st.info("""
        🎭 **Hierarchical Structure:** Categories → Venues → Performances
        
        - **Large nodes (circles):** Main performance categories (Music, Dance, Theater)
        - **Medium nodes (diamonds):** Venues under each category
        - **Small nodes (circles with •):** Individual performances
        
        **Interact:** Hover over nodes to see performance counts, zoom in/out, and explore relationships!
        """)
        fig = viz.create_hierarchical_network()
        st.plotly_chart(fig, use_container_width=True)
        
        # Add statistics
        st.subheader("📊 Hierarchy Statistics")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Categories", len(df['Category'].unique()))
        with col2:
            st.metric("Total Venues", len(df['Main_Venue'].unique()) if 'Main_Venue' in df.columns else len(df['Venue'].str.split(',').str[0].unique()))
        with col3:
            st.metric("Total Performances", len(df))
    
    with tab2:
        st.subheader("Performances Connected by Category")
        st.info("Each category is connected to its performances. Larger nodes represent categories, smaller nodes represent performances.")
        fig = viz.create_category_network()
        st.plotly_chart(fig, use_container_width=True)
    
    with tab3:
        st.subheader("Performances Connected by Venue")
        st.info("Each venue is connected to performances happening there. Explore which performances are at each location.")
        fig = viz.create_venue_network()
        st.plotly_chart(fig, use_container_width=True)
    
    with tab4:
        st.subheader("Performances Connected by Date")
        st.info("Each date is connected to performances scheduled on that day. See temporal distribution.")
        fig = viz.create_date_network()
        st.plotly_chart(fig, use_container_width=True)
    
    with tab5:
        st.subheader("Category Distribution")
        st.info("Pie chart showing the percentage breakdown of performances by category.")
        fig = viz.create_category_distribution()
        st.plotly_chart(fig, use_container_width=True)
        
        # Show stats
        col1, col2, col3 = st.columns(3)
        music_count = len(df[df['Category'] == 'Music'])
        dance_count = len(df[df['Category'] == 'Dance'])
        theater_count = len(df[df['Category'] == 'Theater'])
        
        with col1:
            st.metric("🎵 Music", music_count)
        with col2:
            st.metric("💃 Dance", dance_count)
        with col3:
            st.metric("🎭 Theater", theater_count)
    
    with tab6:
        st.subheader("Venue Distribution")
        st.info("Bar chart showing the number of performances at each venue.")
        fig = viz.create_venue_distribution()
        st.plotly_chart(fig, use_container_width=True)
    
    with tab7:
        st.subheader("Performance Hierarchy")
        st.info("Interactive sunburst chart showing the hierarchy from Category to Sub-Category.")
        fig = viz.create_subcategory_sunburst()
        st.plotly_chart(fig, use_container_width=True)
    
    with tab8:
        st.subheader("Detailed Performance Table")
        st.info("Browse all performances in a detailed table format. Click column headers to sort.")
        
        display_df = viz.create_performance_comparison_table()
        
        # Add filtering
        col1, col2 = st.columns(2)
        
        with col1:
            selected_category = st.multiselect(
                "Filter by Category:",
                options=['All'] + df['Category'].unique().tolist(),
                default=['All']
            )
        
        with col2:
            selected_venue = st.multiselect(
                "Filter by Venue:",
                options=['All'] + df['Main_Venue'].unique().tolist(),
                default=['All']
            )
        
        # Apply filters
        filtered_df = display_df.copy()
        
        if 'All' not in selected_category:
            filtered_df = filtered_df[filtered_df['Category'].isin(selected_category)]
        
        if 'All' not in selected_venue:
            df['Main_Venue'] = df['Venue'].str.split(',').str[0]
            display_df['Venue'] = df['Main_Venue']
            filtered_df = filtered_df[filtered_df['Venue'].isin(selected_venue)]
        
        # Display table
        st.dataframe(
            filtered_df,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Event_Name": st.column_config.TextColumn("Performance", width="medium"),
                "Category": st.column_config.TextColumn("Category", width="small"),
                "Sub_Category": st.column_config.TextColumn("Sub-Category", width="medium"),
                "Venue": st.column_config.TextColumn("Venue", width="medium"),
                "Date": st.column_config.TextColumn("Date", width="small"),
                "Time": st.column_config.TextColumn("Time", width="small"),
                "Description": st.column_config.TextColumn("Description", width="large"),
            }
        )
        
        # Show summary
        st.success(f"Showing {len(filtered_df)} of {len(display_df)} performances")

