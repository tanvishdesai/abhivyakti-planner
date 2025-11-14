# Abhi Vyakti Planner - Task Board

This document tracks the development process for the itinerary planner project, including active tasks, milestones, and future work.

---

### **Milestone 1: Project Scaffolding & Data Handling (Complete)**

*   [] Create the main application file `app.py`.
*   [] **Sub-task: Data Loading:** Implement a function to load `performances.csv` into a pandas DataFrame.
*   [] **Sub-task: Data Preprocessing:**
    *   [] Convert the 'Date' column to datetime objects.
    *   [] Sort the DataFrame by Date and Time.
    *   [] Structure the data into a dictionary grouped by date for efficient lookup.
*   [] **Discovery:** Noticed that the time slots are not just 7:15 PM and 9:15 PM, but also include 8:30 PM and 9:30 PM. For simplicity, we will group performances into two main slots: "early" (before 8:00 PM) and "late" (8:00 PM and after). This simplifies the combination logic.

---

### **Milestone 2: Core Optimization Algorithm (In Progress)**

*   [ ] **Define the recursive solver function:** `find_best_itinerary(day_index, categories_seen)`.
*   [ ] **Implement the memoization cache:** Create a dictionary `memo` to store results of computed states.
*   [ ] **Sub-task: Base Case:** Implement the stopping condition for the recursion (when `day_index` goes beyond the last day of the festival).
*   [ ] **Sub-task: Recursive Step - "Skip Day" Logic:** Implement the logic to calculate the score if we choose to skip the current day.
*   [ ] **Sub-task: Recursive Step - "Attend Day" Logic:**
    *   [ ] Iterate through all valid combinations of performances for the current day (respecting the one-show-per-slot and same-venue constraints).
    *   [ ] For each combination, calculate the current day's score contribution.
    *   [ ] Make the recursive call for the next day with the updated `categories_seen`.
*   [ ] **Sub-task: Scoring and Comparison:** Compare the score from "skipping" vs. the best score from "attending" and store the optimal choice (score and path) in the memoization cache before returning.
*   [ ] **Discovery:** The state space could become large. Using an immutable `frozenset` for `categories_seen` is critical for it to be a valid dictionary key in the `memo` cache.

---

### **Milestone 3: Streamlit User Interface (Backlog)**

*   [ ] Set up the basic UI layout with a title and an introduction.
*   [ ] Add a section to display the full, raw schedule in a collapsible expander.
*   [ ] Create a primary button: "Generate Optimal Itinerary".
*   [ ] **Sub-task: Triggering Logic:** Wire the button to call the `find_best_itinerary` function with initial parameters.
*   [ ] **Sub-task: Results Display:**
    *   [ ] Once the result is returned, display summary statistics (total performances, days attended, categories covered).
    *   [ ] Format the final itinerary, grouping the selected performances by date.
    *   [ ] Add conditional "success" messages (e.g., if all three categories are covered).

---

### **Milestone 4: Testing and Refinement (Backlog)**

*   [ ] Perform an end-to-end test of the complete application flow.
*   [ ] Manually verify a small subset of the schedule to ensure the algorithm's logic is sound.
*   [ ] Refine UI text and layout for better clarity and user experience.
*   [ ] Add comments and docstrings to the code for maintainability.

---

### **Future Work & Ideas (Backlog)**

*   **User Preferences:** Allow users to "upvote" or "downvote" certain sub-categories (e.g., "Sufi Folk" vs. "Pop Rock") and factor these preferences into the scoring function.
*   **Venue Travel Time:** Remove the "venue lock-in" constraint and add a travel time model. The algorithm could then decide if switching venues is "worth it" based on the value of the performance. This would make it a more complex scheduling problem.
*   **Alternative Algorithms:** Implement a simple Greedy algorithm as a baseline and compare its results (speed and quality) against the Dynamic Programming solution.
*   **Visualizations:** Add charts to show the distribution of categories in the final schedule.