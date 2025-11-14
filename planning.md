# Abhi Vyakti Festival - Optimal Itinerary Planner

## 1. Project Vision & Goal

### 1.1. High-Level Vision
To create a smart, data-driven tool that transforms a complex festival schedule into a personalized, optimal itinerary. The application will serve as a practical demonstration of how computer science algorithms can solve real-world logistical and planning challenges.

### 1.2. Primary Goal
The core objective is to generate a schedule that allows a user to:
1.  **Maximize the number of unique performances attended.**
2.  **Ensure attendance across all three main categories (Music, Dance, Theater).**
3.  **Achieve this while minimizing the total number of days they need to attend the festival.**

## 2. System Architecture

The project will follow a simple, monolithic architecture suitable for a Streamlit application.

*   **Frontend (UI):** A web-based interface built with **Streamlit**. It will handle user interaction (e.g., a button to generate the schedule) and display the final itinerary in a clean, readable format.
*   **Backend (Logic):** A **Python** script that contains all the business logic. This includes:
    *   **Data Processing Layer:** Uses the `pandas` library to load, clean, and structure the festival data from `performances.csv`.
    *   **Optimization Engine:** The core of the application, which implements a dynamic programming algorithm to compute the optimal schedule.
*   **Data Store:** A simple `performances.csv` file serves as the single source of truth for the festival schedule.

### 2.1. Data Flow
1.  **Ingestion:** The application starts by loading the `performances.csv` file into a pandas DataFrame.
2.  **Preprocessing:** The data is cleaned, dates are converted to datetime objects, and the schedule is organized into a day-by-day dictionary for efficient access.
3.  **Optimization:** When the user requests an itinerary, the preprocessed data is fed into the dynamic programming solver.
4.  **Memoization:** The solver uses a dictionary (`memo`) as a cache to store the results of subproblems, avoiding redundant computations.
5.  **Output:** The solver returns the optimal list of performances (the "path").
6.  **Presentation:** The final path is formatted and displayed in the Streamlit UI, grouped by day, along with summary statistics.

## 3. Core Algorithm: Dynamic Programming

The problem of finding an optimal schedule is best modeled using Dynamic Programming due to its properties of **optimal substructure** and **overlapping subproblems**.

*   **Approach:** We will use **recursion with memoization**. This is conceptually equivalent to a bottom-up DP approach but is often more intuitive to implement.
*   **State Definition:** The state of our system at any point can be uniquely identified by:
    *   `day_index`: An integer representing the current day we are considering (from a sorted list of unique festival dates).
    *   `categories_seen`: An immutable set (`frozenset`) containing the performance categories attended so far.
*   **Recursive Relation (The Decision):** For any given day, the algorithm makes a choice between two main options to find the one that yields the best score:
    1.  **Skip the Day:** Don't attend any performances on `day_index`. The total score is whatever the best possible score is from `day_index + 1` onwards.
    2.  **Attend Performances:** Choose the best combination of performances for the current day and add their value to the best possible score from `day_index + 1` (with an updated set of `categories_seen`).
*   **Scoring Function:** To guide the algorithm, we need a score that reflects our goals. A potential scoring model:
    *   `+1 point` for each performance attended.
    *   `+10 points` (a significant bonus) for each *new* category attended. This heavily incentivizes covering all three categories.

## 4. Constraints & Assumptions

To simplify the problem space, we will start with the following constraints:
*   **Venue Lock-In:** A user cannot travel between different main venues (Gujarat University, ATIRA, Shreyas Foundation) within the same day. This is a realistic constraint to avoid complex travel-time calculations.
*   **Time Slots:** There are two primary time slots each day: an early one (~7:15 PM) and a late one (~9:00 PM). A user can attend a maximum of one performance per slot.
*   **Data Integrity:** We assume the `performances.csv` file is accurate and well-formatted.
*   **Optimization Priority:** The algorithm's primary goal is to maximize the score, which is designed to prioritize category coverage and then the number of performances. Minimizing days is a natural side-effect of this, as the algorithm won't add a day unless it contributes positively to the score.

## 5. Tech Stack & Tools

*   **Programming Language:** Python 3.8+
*   **Libraries:**
    *   `pandas`: For data manipulation and analysis.
    *   `streamlit`: For creating the interactive web UI.
*   **Development Environment:** A standard Python environment (e.g., using `venv`).
*   **Version Control:** Git (recommended).