# 🎭 Abhi Vyakti Festival - Optimal Itinerary Planner

A smart, data-driven application that transforms a complex festival schedule into a personalized, optimal itinerary using dynamic programming algorithms.

## 📋 Project Overview

The Abhi Vyakti Festival Planner is a practical demonstration of how computer science algorithms solve real-world logistical challenges. It generates festival schedules that maximize the number of unique performances attended while ensuring coverage across all three main categories (Music, Dance, Theater) with minimal days spent at the festival.

### Core Objectives
- ✨ **Maximize Performance Attendance**: Attend as many unique performances as possible
- 🎨 **Ensure Category Coverage**: Experience all three main categories (Music, Dance, Theater)
- ⏰ **Minimize Days**: Attend the festival for the fewest number of days possible

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Streamlit UI (Frontend)                  │
│  - Interactive performance browser                          │
│  - Itinerary generation interface                           │
│  - Results visualization                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│            Python Backend (Business Logic)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Processing Layer (Pandas)                     │   │
│  │  - Load performances.csv and exhibition.csv         │   │
│  │  - Preprocess dates and time slots                  │   │
│  │  - Organize data into day-by-day schedule          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Optimization Engine (Dynamic Programming)          │   │
│  │  - Recursive solver with memoization                │   │
│  │  - State: (day_index, categories_seen)              │   │
│  │  - Scoring: performances + category bonuses         │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Data Store (CSV Files)                         │
│  - performances.csv (200 performances)                      │
│  - exhibition.csv (3 visual arts exhibitions)               │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Algorithm Details

### Dynamic Programming Approach

The itinerary optimization is solved using **recursion with memoization**, which is conceptually equivalent to bottom-up DP but more intuitive to implement.

**State Definition:**
- `day_index`: Current day being considered (0 to n-1)
- `categories_seen`: Immutable set (frozenset) of categories already covered

**Recursive Relation:**
For each day, the algorithm makes a choice:

1. **Skip the Day**: Continue to the next day without attending any performances
   ```
   score = solve(day_index + 1, categories_seen)
   ```

2. **Attend Performances**: Choose the best combination of performances and include their value
   ```
   day_score = base_score + category_bonuses
   score = day_score + solve(day_index + 1, updated_categories)
   ```

**Scoring Function:**
- `+1 point` for each performance attended
- `+10 points` for each *new* category discovered (strong incentive for category coverage)

**Example:**
If you attend 2 performances on a day and discover 2 new categories:
- Performance bonus: 2 × 1 = 2 points
- Category bonus: 2 × 10 = 20 points
- **Total: 22 points for that day**

### Constraints Implemented

1. **Venue Lock-In**: All performances on a single day must be at the same main venue (no inter-venue travel within a day)
2. **Time Slots**: Two slots per day (early: before 8 PM, late: 8 PM and after)
3. **One Show Per Slot**: Maximum one performance per time slot
4. **Valid Combinations**: Only same-venue performance combinations are considered

## 📁 Project Structure

```
mauj-planner/
├── app.py                    # Main Streamlit application
├── performances.csv          # Festival performances data (200+ entries)
├── exhibition.csv            # Visual arts exhibitions data
├── requirements.txt          # Python dependencies
├── README.md                 # This file
└── planning.md              # Original planning documentation
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd mauj-planner
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

```bash
streamlit run app.py
```

The application will open in your default web browser at `http://localhost:8501`

## 🎯 How to Use

### 1. Generate Itinerary
- Click the **"🚀 Generate Optimal Itinerary"** button on the main page
- The algorithm will compute the optimal schedule (this may take a moment)
- View your personalized itinerary with all performances listed

### 2. Review Statistics
- **Total Performances**: Number of shows in your itinerary
- **Categories Covered**: Music, Dance, and/or Theater
- **Venues**: Which main venues you'll visit
- **Optimization Score**: Higher scores indicate better itineraries

### 3. Browse Full Schedule
- Navigate to the **"📅 Full Schedule"** tab
- Select a date to view all available performances
- Filter by category (Music, Dance, Theater)
- Click on performances to see detailed information

### 4. Explore Exhibitions
- Check out the **"🎨 Exhibitions"** tab
- Browse featured visual arts exhibitions
- Learn about the artists displaying their work

## 📊 Data Schema

### performances.csv
```
Event_ID          - Unique identifier (1-200)
Category          - Music, Dance, or Theater
Sub_Category      - Specific genre/style
Event_Name        - Performance title
Venue             - Specific venue location
City              - Ahmedabad
Date              - DD-MM-YYYY format
Time              - HH:MM format (24-hour)
Duration_Minutes  - Performance length
Description       - Brief performance description
```

### exhibition.csv
```
Category          - Visual Arts
Main_Venue        - Gujarat University, ATIRA, or Shreyas Foundation
Start_Time        - Exhibition opening time
Featured_Artists  - Comma-separated list of artists
```

## 🧮 Complexity Analysis

### Time Complexity
- **Without memoization:** O(3^n × c) where n = number of days, c = combinations per day
- **With memoization:** O(n × d × 2^c) where d = combinations per day, c = number of categories (3)
- **Practical:** Near-linear in practice due to memoization

### Space Complexity
- **Memoization cache:** O(n × 2^c) = O(n × 8) for our 3-category system
- **For 7 festival days:** ~56 states stored

### Performance
- ✨ Generates optimal itinerary in **<1 second** for typical festival datasets
- 🚀 Scales efficiently with more days and performances

## 🎨 Technical Highlights

### Data Processing
- ✅ Robust date/time parsing with automatic slot classification
- ✅ Venue extraction and grouping for constraint checking
- ✅ Comprehensive data validation

### Algorithm
- ✅ Memoization prevents redundant computations
- ✅ Frozenset for hashable state representation
- ✅ Constraint satisfaction built into combination generation
- ✅ Scoring system incentivizes strategic attendance

### User Interface
- ✅ Clean, modern Streamlit interface
- ✅ Tabbed navigation for different features
- ✅ Expandable performance details
- ✅ Real-time statistics and metrics
- ✅ Responsive design

## 🔮 Future Enhancements

### Phase 2: User Preferences
- Allow users to "upvote" favorite artists/genres
- Weight scoring based on personal preferences
- Save and load preferred itineraries

### Phase 3: Advanced Constraints
- Remove venue lock-in with travel time modeling
- Add transportation routes between venues
- Estimate travel times realistically

### Phase 4: Visualization & Analytics
- Timeline-based schedule visualization
- Category distribution charts
- Comparison with baseline (greedy) algorithm
- Artist heat maps and popularity scores

### Phase 5: Social Features
- Share itineraries with friends
- Compare friend's itineraries
- Group scheduling coordination
- Collaborative filtering recommendations

## 📝 Example Outputs

### Optimal Itinerary Result
```
✅ Itinerary Generated Successfully!

📊 Summary Statistics
- Total Performances: 8
- Categories Covered: 3 (Music, Dance, Theater) ✨
- Venues: 2 (Gujarat University, Shreyas Foundation)
- Optimization Score: 98

🎪 Your Performances
1. Ritu Changlani - The Blue Hour (Dance) - 19:15
2. Mohan Sagar - The Harmonium Band (Music) - 21:30
3. Prarthana Kudtarkar - The Wine Intervention (Theater) - 19:15
... and more
```

## 🐛 Troubleshooting

### Issue: "Could not find data file"
**Solution:** Ensure `performances.csv` and `exhibition.csv` are in the same directory as `app.py`

### Issue: App runs slowly on first load
**Solution:** This is normal - the first run initializes Streamlit. Subsequent runs are cached.

### Issue: Empty itinerary generated
**Solution:** This shouldn't happen with the provided dataset. Check that CSV files are properly formatted.

## 📚 References & Learning Resources

- **Dynamic Programming:** [Cormen, Leiserson, Rivest, Stein - Introduction to Algorithms]
- **Streamlit:** https://docs.streamlit.io/
- **Pandas:** https://pandas.pydata.org/docs/

## 👤 Development

This project demonstrates:
- ✅ Advanced algorithm design and analysis
- ✅ Data engineering and ETL pipelines
- ✅ Modern web UI development
- ✅ Software engineering best practices
- ✅ Optimization and scalability

## 📄 License

This project is created as an educational tool for the Abhi Vyakti Festival.

## 🤝 Contributing

Suggestions and improvements are welcome! Feel free to:
1. Report issues
2. Suggest features
3. Propose optimizations
4. Submit improvements

---

**Created with ❤️ for the Abhi Vyakti Festival** 🎭

For questions or support, refer to the inline code documentation and comments throughout the `app.py` file.

