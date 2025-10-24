import os
from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS
import traceback # Import traceback for better error logging

# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3001"}})

# --- ROUTES ---

@app.route('/')
def home():
    """A simple test route to show the server is alive."""
    return jsonify({
        "message": "Welcome to the Financial Guru ML Server! 🐍"
    })

@app.route('/analyze', methods=['POST'])
def analyze_spending():
    """
    Analyzes a new expense against past expenses to find insights (V2 Tags).
    """
    # ... (This route remains the same) ...
    try:
        data = request.json
        new_expense = data.get('new_expense')
        past_expenses = data.get('past_expenses')
        if not new_expense or past_expenses is None:
            return jsonify({"error": "Missing new_expense or past_expenses"}), 400
        v2_tags = generate_v2_tags(new_expense, past_expenses)
        return jsonify({"tags": v2_tags})
    except Exception as e:
        print(f"Error during /analyze: {e}\n{traceback.format_exc()}") # More detailed logging
        return jsonify({"error": str(e)}), 500


# --- NEW TIMELINE ROUTE ---
@app.route('/timeline', methods=['POST'])
def analyze_timeline():
    """
    Analyzes a list of expenses to find spending patterns by day of the week.
    """
    try:
        data = request.json
        expenses = data.get('expenses')

        if expenses is None:
            return jsonify({"error": "Missing 'expenses' data"}), 400
        if not expenses:
            return jsonify({"insight": "Not enough data for timeline analysis yet."}) # Handle empty list

        # Convert to DataFrame
        df = pd.DataFrame(expenses)

        # Convert 'date' column to datetime objects, handling potential errors
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date']) # Remove rows where date conversion failed

        if df.empty:
             return jsonify({"insight": "No valid dates found for timeline analysis."})

        # Extract day of the week (Monday=0, Sunday=6)
        df['day_of_week'] = df['date'].dt.dayofweek
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        # Calculate total spending per day of the week
        daily_spending = df.groupby('day_of_week')['amount'].sum()

        if daily_spending.empty:
             return jsonify({"insight": "Could not calculate daily spending patterns."})

        # Find the day with the highest total spending
        max_spending_day_index = daily_spending.idxmax()
        max_spending_day_name = day_names[max_spending_day_index]

        insight_text = f"💡 You typically spend the most on {max_spending_day_name}s."

        return jsonify({"insight": insight_text})

    except Exception as e:
        print(f"Error during /timeline: {e}\n{traceback.format_exc()}") # More detailed logging
        return jsonify({"error": f"Timeline analysis failed: {str(e)}"}), 500


# --- Helper function for V2 tags (unchanged) ---
def generate_v2_tags(new_expense, past_expenses):
    # ... (This function remains the same) ...
    tags = []
    if not past_expenses: return tags
    df = pd.DataFrame(past_expenses)
    # Price Increase Logic
    same_desc_df = df[df['description'].str.lower() == new_expense['description'].lower()]
    if not same_desc_df.empty:
        past_expense = same_desc_df.sort_values(by='date', ascending=False).iloc[0]
        if 'amount' in past_expense and new_expense.get('amount') is not None and past_expense['amount'] is not None and past_expense['amount'] > 0:
            if new_expense['amount'] > past_expense['amount']:
                increase = ((new_expense['amount'] - past_expense['amount']) / past_expense['amount']) * 100
                tags.append(f"⚠️ {increase:.0f}% price increase")
    # Similar Expense Logic
    if 'category' in new_expense:
        same_cat_df = df[df['category'] == new_expense['category']]
        similar_df = same_cat_df[same_cat_df['description'].str.lower() != new_expense['description'].lower()]
        if not similar_df.empty:
            similar_expense = similar_df.sort_values(by='date', ascending=False).iloc[0]
            if 'description' in similar_expense and 'amount' in similar_expense:
                 tags.append(f"💡 Similar: {similar_expense['description']} (₹{similar_expense['amount']:.0f})")
    return tags


# --- RUN THE APP ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8082))
    app.run(debug=True, port=port)