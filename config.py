"""
Configuration and constants for the Abhi Vyakti Festival Planner.
"""

# Festival Configuration
FESTIVAL_NAME = "Abhi Vyakti Festival"
FESTIVAL_START_DATE = "2025-11-14"
FESTIVAL_END_DATE = "2025-11-30"

# Main Categories
PERFORMANCE_CATEGORIES = ["Music", "Dance", "Theater"]
REQUIRED_CATEGORIES = 3  # Must cover all 3 categories

# Venues
MAIN_VENUES = [
    "Gujarat University",
    "ATIRA",
    "Shreyas Foundation"
]

# Time Slot Configuration
EARLY_SLOT_END_TIME = 20.0  # 8:00 PM (20:00 in 24-hour format)
EARLY_SLOT_NAME = "early"
LATE_SLOT_NAME = "late"

# Scoring Configuration
POINTS_PER_PERFORMANCE = 1
POINTS_PER_NEW_CATEGORY = 10

# UI Configuration
PAGE_TITLE = "Abhi Vyakti Festival Planner"
PAGE_ICON = "🎭"

# Colors and Styling
PRIMARY_COLOR = "#6B2D5C"  # Deep purple
SECONDARY_COLOR = "#e6f2ff"  # Light blue
SUCCESS_COLOR = "#d4edda"  # Light green
WARNING_COLOR = "#fff3cd"  # Light yellow
ERROR_COLOR = "#f8d7da"  # Light red

# Display Configuration
PERFORMANCES_PER_PAGE = 10
EXPANDABLE_PERFORMANCE_CARDS = True

# Data Files
PERFORMANCES_CSV = "performances.csv"
EXHIBITION_CSV = "exhibition.csv"

# Constraints
VENUE_LOCK_IN = True  # All performances on a day must be at same venue
ONE_SHOW_PER_SLOT = True  # Maximum one performance per time slot

# Display Format
DATE_FORMAT = "%A, %B %d, %Y"
TIME_FORMAT = "%H:%M"

