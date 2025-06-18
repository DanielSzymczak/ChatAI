from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import httpx
from datetime import datetime
from fastapi import Path
import google.generativeai as genai
from starlette.concurrency import run_in_threadpool

genai.configure(api_key=os.getenv("API_KEY"))

async def fetch_ai_reply(prompt: str) -> str:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = await run_in_threadpool(model.generate_content, prompt)
    return response.text.strip()

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Message(BaseModel):
    message: str
    username: str = ""  # Optional: "" means guest

class UserCredentials(BaseModel):
    username: str
    password: str

# File paths
USERS_FILE = "/data/users.json"
MESSAGES_DIR = "/data/messages"

# Ensure messages directory exists
os.makedirs(MESSAGES_DIR, exist_ok=True)

# Utility functions
def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)

def get_user_messages_path(username: str):
    return os.path.join(MESSAGES_DIR, f"{username}.json")

def load_user_messages(username: str):
    path = get_user_messages_path(username)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def save_user_message(username: str, sender: str, text: str):
    path = get_user_messages_path(username)
    messages = load_user_messages(username)

    messages.append({
        "timestamp": datetime.now().isoformat(),
        "sender": sender,
        "text": text
    })
    with open(path, "w") as f:
        json.dump(messages, f, indent=2)

# Endpoints
@app.post("/message")
async def get_reply(msg: Message):
    ai_reply = await fetch_ai_reply(msg.message)

    if msg.username:
        save_user_message(msg.username, msg.username, msg.message)
        save_user_message(msg.username, "ChatAI", ai_reply)

    return {"reply": ai_reply}

@app.post("/register")
async def register(user: UserCredentials):
    users = load_users()
    if user.username in users:
        raise HTTPException(status_code=400, detail="Username already exists")
    users[user.username] = user.password
    save_users(users)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: UserCredentials):
    users = load_users()
    if user.username not in users or users[user.username] != user.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful"}

@app.get("/history/{username}")
async def get_history(username: str = Path(...)):
    messages = load_user_messages(username)
    return messages
