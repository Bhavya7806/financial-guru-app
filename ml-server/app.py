# --- ml-server/app.py ---

import os
from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS
import traceback # Import traceback for better error logging

# Initialize the Flask app
app = Flask(__name__)
# Explicitly allow requests from any origin for deployment simplicity
CORS(app, resources={r"/*": {"origins": "*"}}) 

# --- ROUTES ---

@app.route('/')
def home():
    """A simple test route to show the server is alive."""
    return jsonify({
        "message": "Welcome to the Financial Guru ML Server! 🐍"
    })

# --- TIMELINE ROUTE ---
@app.route('/timeline', methods=['POST'])
def analyze_timeline():
    """
    Analyzes a list of expenses to find spending patterns by day of the week.
    """
    print("-> HIT: /timeline route") # Log when route is hit
    try:
        data = request.json
        expenses = data.get('expenses')
        print(f"   Received {len(expenses) if expenses else 0} expenses for timeline analysis.")

        if expenses is None:
            return jsonify({"error": "Missing 'expenses' data"}), 400
        if not expenses:
            return jsonify({"insight": "Not enough data for timeline analysis yet."})

        # Convert to DataFrame
        df = pd.DataFrame(expenses)
        print("   DataFrame created successfully.")

        # Convert 'date' column to datetime objects, handling errors
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date']) # Remove rows with invalid dates
        print(f"   {len(df)} expenses remaining after date validation.")

        if df.empty:
             return jsonify({"insight": "No valid dates found for timeline analysis."})

        # Extract day of the week (Monday=0, Sunday=6)
        df['day_of_week'] = df['date'].dt.dayofweek
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        print("   Day of week extracted.")

        # Calculate total spending per day of the week
        # Ensure 'amount' column exists and contains numbers
        if 'amount' not in df.columns:
             return jsonify({"error": "Missing 'amount' column in expense data"}), 400
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df = df.dropna(subset=['amount']) # Remove rows with non-numeric amounts
        
        daily_spending = df.groupby('day_of_week')['amount'].sum()
        print("   Daily spending calculated:", daily_spending.to_dict())

        if daily_spending.empty:
             return jsonify({"insight": "Could not calculate daily spending patterns."})

        # Find the day with the highest total spending
        max_spending_day_index = daily_spending.idxmax()
        max_spending_day_name = day_names[max_spending_day_index]
        print(f"   Max spending day identified: {max_spending_day_name}")

        insight_text = f"💡 You typically spend the most on {max_spending_day_name}s."

        return jsonify({"insight": insight_text})

    except Exception as e:
        # Log detailed error including stack trace
        print(f"!!! Error during /timeline: {e}\n{traceback.format_exc()}") 
        return jsonify({"error": f"Timeline analysis failed: {str(e)}"}), 500

# --- RUN THE APP ---
if __name__ == '__main__':
    # Render provides the PORT environment variable
    port = int(os.environ.get('PORT', 5000)) 
    # Bind to 0.0.0.0 for Render
    app.run(debug=False, host='0.0.0.0', port=port) # Use debug=False for production