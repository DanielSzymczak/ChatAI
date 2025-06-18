import json
import os
from datetime import datetime

USERS_FILE = "/data/users.json"
MESSAGES_DIR = "/data/messages"

os.makedirs(MESSAGES_DIR, exist_ok=True)

# Create admin user
users = {"admin": "admin"}
with open(USERS_FILE, "w") as f:
    json.dump(users, f, indent=2)

# Create some initial messages for admin
initial_messages = [
    {
        "timestamp": datetime.now().isoformat(),
        "sender": "admin",
        "text": "Hello! This is the admin account."
    },
    {
        "timestamp": datetime.now().isoformat(),
        "sender": "ChatAI",
        "text": "Welcome admin! How can I assist you today?"
    }
]

with open(os.path.join(MESSAGES_DIR, "admin.json"), "w") as f:
    json.dump(initial_messages, f, indent=2)

print("Initialization done.")
