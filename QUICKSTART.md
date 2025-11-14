# Quick Start Guide - Abhi Vyakti Festival Planner

Get up and running in 5 minutes! 🚀

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.8+ installed (`python --version`)
- ✅ pip package manager available
- ✅ All files present (see below)

## Required Files in Directory

```
mauj-planner/
├── app.py ✅
├── performances.csv ✅
├── exhibition.csv ✅
├── requirements.txt ✅
└── config.py ✅
```

## Installation Steps

### Step 1: Open Terminal/Command Prompt
Navigate to the project directory:
```bash
cd path/to/mauj-planner
```

### Step 2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

Expected output:
```
Successfully installed pandas-2.1.3 streamlit-1.28.1 python-dateutil-2.8.2
```

### Step 4: Run the Application
```bash
streamlit run app.py
```

You should see:
```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://192.168.x.x:8501
```

The app will automatically open in your browser! 🎉

## First-Time Usage

### 1. Explore the Interface
You'll see three tabs:
- 🎬 **Generate Itinerary** - Main feature
- 📅 **Full Schedule** - Browse all performances
- 🎨 **Exhibitions** - Visual arts displays

### 2. Generate Your Itinerary
1. Click the **"🚀 Generate Optimal Itinerary"** button
2. Wait for the algorithm to compute (usually <1 second)
3. View your personalized schedule with:
   - 📊 Summary statistics
   - ✨ Category coverage confirmation
   - 🎪 Complete performance list

### 3. Review Your Results

**Key Metrics to Check:**
- **Total Performances** - How many shows you'll attend
- **Categories Covered** - Should show all 3 (Music, Dance, Theater)
- **Venues** - Which main venues you'll visit
- **Optimization Score** - Higher is better

**Success Indicator:**
Look for the green box that says:
> ✨ **Perfect Category Coverage!** You'll experience Music, Dance, and Theater! ✨

### 4. Explore Other Tabs

**Full Schedule Tab:**
- Select a date from the dropdown
- Filter by category
- Click performances to see details

**Exhibitions Tab:**
- Explore visual arts exhibitions
- Discover featured artists
- Visit venue locations

## Common Tasks

### Generate a New Itinerary
1. Click "Generate Optimal Itinerary" button
2. Results update automatically

### Browse Performances by Date
1. Go to "Full Schedule" tab
2. Select date from dropdown
3. Optionally filter by category

### Find a Specific Performance
1. Use "Full Schedule" tab
2. Select the performance date
3. Expand the performance card for details

### Check Exhibition Info
1. Go to "Exhibitions" tab
2. Click on an exhibition to expand
3. View all featured artists

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'streamlit'"

**Solution:**
```bash
pip install -r requirements.txt
```

Then try again:
```bash
streamlit run app.py
```

### Issue: "FileNotFoundError: performances.csv"

**Solution:**
Ensure all CSV files are in the same directory as `app.py`. Check:
```bash
ls  # on macOS/Linux
dir # on Windows
```

You should see:
- app.py
- performances.csv
- exhibition.csv
- config.py
- requirements.txt

### Issue: App takes too long to load

**Solution:**
- First run caches data, subsequent runs are faster
- Check internet connection for data loading
- Clear browser cache if needed

### Issue: "Port 8501 already in use"

**Solution:**
```bash
streamlit run app.py --logger.level=debug --server.port 8502
```

Or stop any existing Streamlit processes:
```bash
# Find process on port 8501
lsof -i :8501  # macOS/Linux

# Kill the process
kill -9 <PID>
```

### Issue: Algorithm returns empty results

**Solution:**
- Verify performances.csv is not corrupted
- Check that Date format is DD-MM-YYYY
- Check that Time format is HH:MM (24-hour)

## Performance Tips

### Make App Faster

1. **Use Same Browser Session**
   - App caches data after first load
   - Subsequent operations are instant

2. **Close Unused Tabs**
   - Reduces memory usage
   - Faster interaction

3. **Disable Sidebar** (if not needed)
   - Click the arrow at top-left to collapse
   - Frees up screen space

### Optimize Results

1. **Generate Once**
   - Algorithm finds global optimum
   - No need to regenerate

2. **Use Full Schedule for Details**
   - Faster than scrolling through results
   - Better for finding specific performances

## Data Integrity Checks

Before running, verify your CSV files:

**performances.csv should have:**
- 200 rows of performance data
- Columns: Event_ID, Category, Sub_Category, Event_Name, Venue, City, Date, Time, Duration_Minutes, Description
- Dates in DD-MM-YYYY format
- Times in HH:MM format

**exhibition.csv should have:**
- 3 rows (one per venue)
- Columns: Category, Main_Venue, Start Time, Featured Artists

## Performance Benchmarks

Typical timings on standard hardware:

| Operation | Time |
|-----------|------|
| App startup | 2-3 seconds |
| Data loading (cached) | <100ms |
| Generate itinerary | 500-800ms |
| Browse schedule | <100ms |
| Filter performances | <50ms |

## Next Steps

### Explore Features
- 🎬 Generate different itineraries to see variations
- 📅 Compare dates to plan your visit
- 🎨 Discover artists you want to see

### Learn More
- Read **README.md** for detailed documentation
- Check **IMPLEMENTATION_GUIDE.md** for algorithm details
- Review **planning.md** for project vision

### Customize
- Edit **config.py** to adjust settings
- Modify **app.py** to add features
- Extend the algorithm for your needs

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Stop the app |
| `R` | Rerun the script |
| `C` | Clear cache |
| `Q` | Quit Streamlit |

## Getting Help

### Check These Resources

1. **Algorithm Questions** → Read IMPLEMENTATION_GUIDE.md
2. **Data Format Issues** → Verify CSV files against schema
3. **Installation Problems** → Check Python version (need 3.8+)
4. **UI Bugs** → Clear browser cache and reload
5. **Performance Issues** → Check memory and CPU usage

### Debug Mode

Run with additional logging:
```bash
streamlit run app.py --logger.level=debug
```

## Advanced Usage

### Modify Time Slots

Edit in **app.py** (around line 90):
```python
EARLY_SLOT_END_TIME = 20.0  # Change to adjust
```

### Change Scoring Weights

Edit in **app.py** (around line 280):
```python
base_score = len(performances) * 2  # Change to 2 instead of 1
category_bonus = len(new_categories_found) * 15  # Change bonus
```

### Add Custom Venue

Edit **config.py**:
```python
MAIN_VENUES = [
    "Gujarat University",
    "ATIRA",
    "Shreyas Foundation",
    "New Venue"  # Add here
]
```

## Uninstalling

To remove the application:

1. **Deactivate virtual environment:**
   ```bash
   deactivate
   ```

2. **Delete project folder:**
   ```bash
   rm -rf mauj-planner  # macOS/Linux
   rmdir /s mauj-planner  # Windows
   ```

---

**You're all set!** 🎉

Run `streamlit run app.py` and enjoy planning your perfect festival itinerary!

For more information, see **README.md**

