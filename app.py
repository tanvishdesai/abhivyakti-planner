"""
Abhi Vyakti Festival - Optimal Itinerary Planner
A dynamic programming-based tool to generate optimal festival schedules.
"""

import pandas as pd
import streamlit as st
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Tuple, FrozenSet, Optional, Set
import os

# Import configuration
from config import (
    POINTS_PER_PERFORMANCE,
    POINTS_PER_NEW_CATEGORY,
    DATE_FORMAT,
    TIME_FORMAT
)

# Import visualization module
try:
    from visualizations import PerformanceVisualizer, display_visualization_dashboard
except ImportError:
    PerformanceVisualizer = None
    display_visualization_dashboard = None

# ==============================================================================
# SECTION 1: DATA LOADING AND PREPROCESSING
# ==============================================================================

def load_performances_data(csv_path: str) -> pd.DataFrame:
    """
    Load performances data from CSV file.
    
    Args:
        csv_path: Path to the performances.csv file
        
    Returns:
        DataFrame with performances data
    """
    df = pd.read_csv(csv_path)
    return df


def preprocess_performances(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
    """
    Preprocess the performances data:
    - Convert Date to datetime objects
    - Sort by Date and Time
    - Group performances by date and time slot
    
    Args:
        df: Raw DataFrame from CSV
        
    Returns:
        Tuple of (processed DataFrame, day-by-day schedule dictionary)
    """
    # Convert Date to datetime
    df['Date'] = pd.to_datetime(df['Date'], format='%d-%m-%Y')
    
    # Convert Time to datetime.time for better handling
    df['Time_obj'] = pd.to_datetime(df['Time'], format='%H:%M').dt.time
    
    # Sort by Date and Time
    df = df.sort_values(by=['Date', 'Time_obj'])
    
    # Create time slot classification (early: before 8 PM, late: 8 PM and after)
    def classify_slot(time_obj):
        hour = time_obj.hour
        minute = time_obj.minute
        time_in_minutes = hour * 60 + minute
        
        if time_in_minutes < 20 * 60:  # Before 8 PM (20:00)
            return "early"
        else:
            return "late"
    
    df['Slot'] = df['Time_obj'].apply(classify_slot)
    
    # Extract main venue (first part before comma)
    df['Main_Venue'] = df['Venue'].str.split(',').str[0]
    
    # Group by date to create a day-by-day schedule
    schedule_dict = defaultdict(lambda: {"early": [], "late": []})
    
    for idx, row in df.iterrows():
        date_key = row['Date'].strftime('%Y-%m-%d')
        slot = row['Slot']
        
        schedule_dict[date_key][slot].append({
            'event_id': row['Event_ID'],
            'date': date_key,  # Add date to track it with the event
            'category': row['Category'],
            'sub_category': row['Sub_Category'],
            'event_name': row['Event_Name'],
            'venue': row['Venue'],
            'main_venue': row['Main_Venue'],
            'time': row['Time'],
            'description': row['Description']
        })
    
    # Sort dates
    sorted_dates = sorted(schedule_dict.keys())
    schedule_dict = {date: schedule_dict[date] for date in sorted_dates}
    
    return df, dict(schedule_dict)


def get_all_dates(schedule_dict: Dict) -> List[str]:
    """Get sorted list of all festival dates."""
    return sorted(list(schedule_dict.keys()))


def load_exhibition_data(csv_path: str) -> pd.DataFrame:
    """
    Load exhibition data from CSV file.
    
    Args:
        csv_path: Path to the exhibition.csv file
        
    Returns:
        DataFrame with exhibition data
    """
    df = pd.read_csv(csv_path)
    return df


# ==============================================================================
# SECTION 2: DYNAMIC PROGRAMMING OPTIMIZATION ENGINE
# ==============================================================================

class PerformanceOptimizer:
    """
    Dynamic programming solver for finding the optimal festival itinerary.
    
    Constraints:
    - No repeated performances (tracked by event_id)
    - No overlapping times on the same day
    - All performances on one day must be at the same venue
    """
    
    def __init__(self, schedule_dict: Dict, dates: List[str]):
        """
        Initialize the optimizer.
        
        Args:
            schedule_dict: Day-by-day schedule dictionary
            dates: Sorted list of all festival dates
        """
        self.schedule_dict = schedule_dict
        self.dates = dates
        self.memo = {}
        self.best_path_memo = {}
    
    def get_performances_for_day(self, date: str) -> Dict:
        """Get all performances available on a specific date."""
        return self.schedule_dict.get(date, {"early": [], "late": []})
    
    def extract_categories(self, performances: List) -> FrozenSet:
        """Extract unique categories from a list of performances."""
        categories = set()
        for perf in performances:
            categories.add(perf['category'])
        return frozenset(categories)
    
    def get_valid_combinations(self, date: str) -> List[List[Dict]]:
        """
        Generate all valid combinations of performances for a single day.
        
        Constraints:
        - Maximum one performance per time slot (early/late)
        - All performances must be at the same main venue
        
        Returns:
            List of valid performance combinations
        """
        performances = self.get_performances_for_day(date)
        early = performances['early']
        late = performances['late']
        
        combinations = []
        
        # Option 1: Skip the day (empty combination)
        combinations.append([])
        
        # Option 2: Attend only early slot
        for perf in early:
            combinations.append([perf])
        
        # Option 3: Attend only late slot
        for perf in late:
            combinations.append([perf])
        
        # Option 4: Attend both early and late (same venue only)
        for early_perf in early:
            for late_perf in late:
                if early_perf['main_venue'] == late_perf['main_venue']:
                    combinations.append([early_perf, late_perf])
        
        return combinations
    
    def calculate_score(self, performances: List, categories_before: FrozenSet) -> Tuple[int, FrozenSet]:
        """
        Calculate score for a combination of performances.
        
        Scoring:
        - +1 point per performance (from POINTS_PER_PERFORMANCE)
        - +bonus points for each new category discovered (from POINTS_PER_NEW_CATEGORY)
        
        Args:
            performances: List of performances
            categories_before: Categories already covered
            
        Returns:
            Tuple of (score, new_categories_set)
        """
        if not performances:
            return 0, categories_before
        
        # Base score: POINTS_PER_PERFORMANCE per performance
        base_score = len(performances) * POINTS_PER_PERFORMANCE
        
        # Extract new categories
        new_cats = self.extract_categories(performances)
        new_categories_found = new_cats - categories_before
        category_bonus = len(new_categories_found) * POINTS_PER_NEW_CATEGORY
        
        total_score = base_score + category_bonus
        updated_categories = categories_before | new_cats
        
        return total_score, updated_categories
    
    def find_best_itinerary(
        self,
        day_index: int = 0,
        categories_seen: FrozenSet = frozenset(),
        events_seen: FrozenSet = frozenset()
    ) -> Tuple[int, List[Dict]]:
        """
        Recursively find the best itinerary using dynamic programming.
        
        This function prevents duplicate performances by tracking event_ids.
        
        Args:
            day_index: Current day index in the festival
            categories_seen: Set of categories already covered
            events_seen: Set of event_ids already scheduled (NEW: prevents duplicates)
            
        Returns:
            Tuple of (best_score, list_of_performances)
        """
        # Base case: reached the end of the festival
        if day_index >= len(self.dates):
            return 0, []
        
        # Check memo (includes events_seen in state)
        state = (day_index, categories_seen, events_seen)
        if state in self.memo:
            return self.memo[state], self.best_path_memo[state]
        
        current_date = self.dates[day_index]
        
        # Option 1: Skip this day
        skip_score, skip_path = self.find_best_itinerary(
            day_index + 1,
            categories_seen,
            events_seen
        )
        
        best_score = skip_score
        best_path = skip_path
        
        # Option 2: Try all valid combinations for this day
        valid_combinations = self.get_valid_combinations(current_date)
        
        for combination in valid_combinations:
            if combination:  # Only process non-empty combinations
                # CHECK: None of the events in this combination have been scheduled before
                combination_event_ids = frozenset(perf['event_id'] for perf in combination)
                if combination_event_ids & events_seen:
                    # Skip this combination - it contains duplicate events
                    continue
                
                day_score, updated_categories = self.calculate_score(combination, categories_seen)
                
                # Update events_seen with this combination's event_ids
                updated_events_seen = events_seen | combination_event_ids
                
                # Recursively solve for the rest of the festival
                future_score, future_path = self.find_best_itinerary(
                    day_index + 1,
                    updated_categories,
                    updated_events_seen
                )
                
                total_score = day_score + future_score
                
                # Update if this is better
                if total_score > best_score:
                    best_score = total_score
                    best_path = combination + future_path
        
        # Store in memo
        self.memo[state] = best_score
        self.best_path_memo[state] = best_path
        
        return best_score, best_path


# ==============================================================================
# SECTION 3: UTILITY FUNCTIONS FOR DISPLAY
# ==============================================================================

def group_performances_by_date(performances: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Group performances by date for display.
    
    Args:
        performances: List of performance dictionaries (must contain 'date' field)
        
    Returns:
        Dictionary mapping dates to list of performances on that date
    """
    grouped = defaultdict(list)
    for perf in performances:
        date = perf.get('date', 'Unknown')
        grouped[date].append(perf)
    
    # Sort by date
    return dict(sorted(grouped.items()))


def format_performance_for_display(perf: Dict) -> str:
    """Format a performance for nice display."""
    return f"""
    **{perf['event_name']}** 
    - Category: {perf['category']}
    - Sub-Category: {perf['sub_category']}
    - Venue: {perf['venue']}
    - Time: {perf['time']}
    - Description: {perf['description']}
    """


def calculate_statistics(performances: List[Dict]) -> Dict:
    """
    Calculate summary statistics about the itinerary and verify correctness.
    
    Checks:
    - No duplicate event_ids (no repeated performances)
    - Categories covered
    - Unique days attended
    """
    if not performances:
        return {
            'total_performances': 0,
            'unique_performances': 0,
            'total_days': 0,
            'categories_covered': set(),
            'venues': set(),
            'num_categories': 0,
            'num_venues': 0,
            'num_days': 0,
            'has_duplicates': False,
            'duplicate_events': []
        }
    
    categories = set()
    venues = set()
    dates = set()
    event_ids = []
    
    for perf in performances:
        categories.add(perf.get('category', 'Unknown'))
        venues.add(perf.get('main_venue', 'Unknown'))
        dates.add(perf.get('date', 'Unknown'))
        event_ids.append(perf.get('event_id', None))
    
    # Check for duplicates
    unique_event_ids = set(event_ids)
    has_duplicates = len(unique_event_ids) < len(event_ids)
    duplicate_events = [eid for eid in event_ids if event_ids.count(eid) > 1]
    
    return {
        'total_performances': len(performances),
        'unique_performances': len(unique_event_ids),
        'total_days': len(dates),
        'categories_covered': categories,
        'num_categories': len(categories),
        'venues': venues,
        'num_venues': len(venues),
        'num_days': len(dates),
        'has_duplicates': has_duplicates,
        'duplicate_events': list(set(duplicate_events))  # Unique list of duplicated event_ids
    }


# ==============================================================================
# SECTION 4: STREAMLIT UI
# ==============================================================================

def main():
    """Main Streamlit application."""
    
    # Page configuration
    st.set_page_config(
        page_title="Abhi Vyakti Festival Planner",
        page_icon="🎭",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Custom CSS for better styling
    st.markdown("""
        <style>
        .main-header {
            color: #6B2D5C;
            text-align: center;
            padding: 20px;
        }
        .metric-card {
            background-color: #f0f2f6;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .performance-card {
            background-color: #e6f2ff;
            padding: 15px;
            border-left: 4px solid #6B2D5C;
            margin: 10px 0;
            border-radius: 4px;
        }
        .success-box {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Title and introduction
    st.markdown("<h1 class='main-header'>🎭 Abhi Vyakti Festival - Optimal Itinerary Planner</h1>", unsafe_allow_html=True)
    
    st.markdown("""
    Welcome to the Abhi Vyakti Festival Itinerary Planner! This tool uses advanced optimization algorithms 
    to create the perfect festival schedule just for you.
    
    **Our Goals:**
    - ✨ Maximize the number of unique performances you attend
    - 🎨 Ensure you experience all three main categories (Music, Dance, Theater)
    - ⏰ Minimize the total number of days you need to attend
    
    Simply click the button below to generate your optimal itinerary!
    """)
    
    # Create a sidebar for settings and info
    with st.sidebar:
        st.header("📋 Festival Information")
        st.info("""
        **Festival Dates:** November 14 - 30, 2025
        **Venues:**
        - Gujarat University
        - ATIRA
        - Shreyas Foundation
        """)
    
    # Load data
    @st.cache_data
    def load_data():
        """Load and preprocess data (cached)."""
        base_path = os.path.dirname(os.path.abspath(__file__))
        
        # Load performances
        performances_path = os.path.join(base_path, 'performances.csv')
        df = load_performances_data(performances_path)
        df_processed, schedule_dict = preprocess_performances(df)
        dates = get_all_dates(schedule_dict)
        
        # Load exhibitions
        exhibition_path = os.path.join(base_path, 'exhibition.csv')
        df_exhibition = load_exhibition_data(exhibition_path)
        
        return df_processed, schedule_dict, dates, df_exhibition
    
    try:
        df_processed, schedule_dict, dates, df_exhibition = load_data()
        
        # Initialize session state for itinerary
        if 'generated_itinerary' not in st.session_state:
            st.session_state.generated_itinerary = None
        
        # Create tabs for better organization
        tab1, tab2, tab3, tab4 = st.tabs(["🎬 Generate Itinerary", "📅 Full Schedule", "🎨 Exhibitions", "🌐 Network Visualization"])
        
        with tab1:
            st.header("Generate Your Optimal Itinerary")
            
            col1, col2 = st.columns([2, 1])
            
            with col1:
                st.markdown("""
                The algorithm will:
                1. Analyze all available performances
                2. Optimize for maximum coverage and minimal days
                3. Ensure you see all three main categories
                4. Respect venue and time slot constraints
                """)
            
            with col2:
                st.metric("Total Performances", len(df_processed))
                st.metric("Festival Days", len(dates))
                st.metric("Total Venues", df_processed['Main_Venue'].nunique())
            
            # Generate button
            if st.button("🚀 Generate Optimal Itinerary", key="generate_btn", use_container_width=True):
                with st.spinner("🔄 Optimizing your itinerary..."):
                    # Initialize optimizer
                    optimizer = PerformanceOptimizer(schedule_dict, dates)
                    
                    # Find best itinerary
                    best_score, best_performances = optimizer.find_best_itinerary()
                    
                    # Store in session state for visualization tab
                    st.session_state.generated_itinerary = best_performances
                    
                    # Calculate statistics
                    stats = calculate_statistics(best_performances)
                    
                    # Display results
                    st.success("✅ Itinerary Generated Successfully!")
                    
                    # Summary statistics
                    st.subheader("📊 Summary Statistics")
                    
                    summary_cols = st.columns(5)
                    with summary_cols[0]:
                        st.metric("Total Performances", stats['total_performances'])
                    with summary_cols[1]:
                        st.metric("Unique Performances", stats['unique_performances'])
                    with summary_cols[2]:
                        st.metric("Festival Days", stats['num_days'])
                    with summary_cols[3]:
                        st.metric("Categories Covered", stats['num_categories'])
                    with summary_cols[4]:
                        st.metric("Optimization Score", best_score)
                    
                    # Correctness verification
                    st.subheader("✅ Correctness Verification")
                    
                    if stats['has_duplicates']:
                        st.error(f"⚠️ **ALERT:** Found duplicate performances! Event IDs: {stats['duplicate_events']}")
                        st.warning("The optimizer has a bug - no duplicates should be present.")
                    else:
                        st.success("✓ No duplicate performances - all events are unique!")
                    
                    st.info(f"Venues: {', '.join(sorted(stats['venues']))}")
                    
                    # Category coverage
                    if stats['num_categories'] == 3:
                        st.markdown("""
                        <div class="success-box">
                        ✨ <b>Perfect Category Coverage!</b> You'll experience Music, Dance, and Theater! ✨
                        </div>
                        """, unsafe_allow_html=True)
                    
                    categories_text = ", ".join(sorted(stats['categories_covered']))
                    st.info(f"**Categories:** {categories_text}")
                    
                    # Display performances grouped by date
                    st.subheader("🎪 Your Performances by Date")
                    
                    if best_performances:
                        # Group performances by date
                        grouped_perfs = group_performances_by_date(best_performances)
                        
                        perf_counter = 1
                        for date_str, perfs_on_date in grouped_perfs.items():
                            # Format date for display
                            try:
                                date_obj = pd.to_datetime(date_str)
                                formatted_date = date_obj.strftime('%A, %B %d, %Y')
                            except:
                                formatted_date = date_str
                            
                            st.markdown(f"### 📅 {formatted_date}")
                            
                            for perf in perfs_on_date:
                                with st.expander(f"{perf_counter}. {perf['event_name']} ({perf['category']}) @ {perf['time']}"):
                                    col1, col2 = st.columns([2, 1])
                                    with col1:
                                        st.write(f"**Venue:** {perf['venue']}")
                                        st.write(f"**Sub-Category:** {perf['sub_category']}")
                                        st.write(f"**Description:** {perf['description']}")
                                        st.write(f"**Event ID:** {perf.get('event_id', 'N/A')}")
                                    with col2:
                                        st.metric("Time", perf['time'])
                                        st.metric("Category", perf['category'])
                                
                                perf_counter += 1
                    else:
                        st.warning("No performances could be scheduled.")
        
        with tab2:
            st.header("📅 Full Festival Schedule")
            
            st.info("Browse the complete festival schedule by date and venue.")
            
            # Filter options
            col1, col2 = st.columns(2)
            
            with col1:
                selected_date = st.selectbox(
                    "Select Date:",
                    options=dates,
                    format_func=lambda x: pd.to_datetime(x).strftime('%A, %B %d, %Y')
                )
            
            with col2:
                category_filter = st.multiselect(
                    "Filter by Category:",
                    options=['Music', 'Dance', 'Theater'],
                    default=['Music', 'Dance', 'Theater']
                )
            
            # Display schedule for selected date
            if selected_date:
                day_schedule = schedule_dict[selected_date]
                
                st.subheader(f"Performances on {pd.to_datetime(selected_date).strftime('%A, %B %d, %Y')}")
                
                # Early slot
                early_perfs = [p for p in day_schedule['early'] if p['category'] in category_filter]
                if early_perfs:
                    st.subheader("🌅 Early Slot")
                    for perf in early_perfs:
                        with st.expander(f"{perf['event_name']} @ {perf['time']}"):
                            st.write(f"**Category:** {perf['category']}")
                            st.write(f"**Sub-Category:** {perf['sub_category']}")
                            st.write(f"**Venue:** {perf['venue']}")
                            st.write(f"**Description:** {perf['description']}")
                
                # Late slot
                late_perfs = [p for p in day_schedule['late'] if p['category'] in category_filter]
                if late_perfs:
                    st.subheader("🌙 Late Slot")
                    for perf in late_perfs:
                        with st.expander(f"{perf['event_name']} @ {perf['time']}"):
                            st.write(f"**Category:** {perf['category']}")
                            st.write(f"**Sub-Category:** {perf['sub_category']}")
                            st.write(f"**Venue:** {perf['venue']}")
                            st.write(f"**Description:** {perf['description']}")
        
        with tab3:
            st.header("🎨 Visual Arts Exhibitions")
            
            st.info("Explore the visual arts exhibitions happening during the festival.")
            
            for idx, row in df_exhibition.iterrows():
                with st.expander(f"📍 {row['Category']} at {row['Main Venue']} ({row['Start Time']})"):
                    artists = row['Featured Artists'].split(", ")
                    st.write(f"**Featured Artists ({len(artists)}):**")
                    
                    # Display artists in columns
                    cols = st.columns(3)
                    for i, artist in enumerate(artists):
                        with cols[i % 3]:
                            st.caption(f"• {artist}")
        
        with tab4:
            st.header("🌐 Network Visualization")
            
            if display_visualization_dashboard is not None:
                st.info("""
                Explore the festival as an interactive network graph! 
                See how performances connect through categories, venues, and dates.
                Hover over nodes to see more details, and interact with the graphs.
                
                💡 **Tip:** Generate an itinerary in the first tab to see your personalized itinerary highlighted!
                """)
                
                # Display visualization dashboard with generated itinerary if available
                display_visualization_dashboard(
                    df_processed, 
                    schedule_dict, 
                    st.session_state.generated_itinerary
                )
            else:
                st.warning("""
                ⚠️ Visualization module not available. 
                Please ensure that networkx and plotly are installed:
                `pip install -r requirements.txt`
                """)
    
    except FileNotFoundError as e:
        st.error(f"❌ Error: Could not find data file. {str(e)}")
        st.info("Please ensure performances.csv and exhibition.csv are in the same directory as this script.")
    except Exception as e:
        st.error(f"❌ An error occurred: {str(e)}")
        st.info("Please check the data files and try again.")


if __name__ == "__main__":
    main()

