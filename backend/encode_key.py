
# backend/encode_key.py

import json
import base64
import os

# Define the path to your service account key file
KEY_FILE_PATH = "serviceAccountKey.json"

def encode_service_account_key():
    """Reads the JSON key file, encodes it to Base64, and prints the result."""
    if not os.path.exists(KEY_FILE_PATH):
        print(f"Error: {KEY_FILE_PATH} not found in the backend directory.")
        return

    try:
        # 1. Read the JSON file content as a string
        with open(KEY_FILE_PATH, 'r') as f:
            key_data_string = f.read()

        # 2. Encode the raw JSON string to Base64
        # Note: Base64 encoding handles the string byte by byte, which is reliable.
        encoded_bytes = base64.b64encode(key_data_string.encode('utf-8'))
        encoded_string = encoded_bytes.decode('utf-8')
        
        print("\n" + "="*60)
        print("SUCCESS! PASTE THE FOLLOWING STRING INTO RENDER (FIREBASE_CONFIG_BASE64):")
        print("="*60)
        print(encoded_string)
        print("="*60 + "\n")

    except Exception as e:
        print(f"An error occurred during encoding: {e}")

if __name__ == "__main__":
    encode_service_account_key()