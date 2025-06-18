import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './App.module.css';

type Message = { sender: string; text: string };

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auth state & UI mode for login/register forms
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState<'none' | 'login' | 'register'>('none');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const sendMessage = async () => {
  if (!input.trim()) return;
  
  const senderLabel = isAuthenticated ? username : 'guest';
  const userMsg = { sender: senderLabel, text: input };
  setMessages(prev => [...prev, userMsg]);
  setInput('');

  try {
    const res = await axios.post('http://localhost:8000/message', {
      message: input,
      username: isAuthenticated ? username : ""  // send username if logged in
    });

    const aiMsg = { sender: 'ai', text: res.data.reply };
    setMessages(prev => [...prev, aiMsg]);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async () => {
    if (!username || !password) return;

    try {
      const res = await axios.post('http://localhost:8000/login', {
        username,
        password,
      });
      alert(res.data.message);
      setIsAuthenticated(true);
      setMode('none');
      setPassword('');

      // Fetch message history after successful login
      const historyRes = await axios.get(`http://localhost:8000/history/${username}`);
      setMessages(historyRes.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Login failed');
    }
  };


  const handleRegister = async () => {
    if (!username || !password) return;

    try {
      const res = await axios.post('http://localhost:8000/register', {
        username,
        password,
      });
      alert(res.data.message);
      setIsAuthenticated(true);
      setMode('none');
      setPassword('');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Registration failed');
    }
  };


  return (
    <div className={styles.chatContainer}>
      {/* Top bar: Login/Register or Logout */}
      <div style={{ marginBottom: 20 }}>
        {!isAuthenticated && (
          <>
            <button onClick={() => setMode('login')} disabled={mode === 'login'}>
              Login
            </button>
            <button onClick={() => setMode('register')} disabled={mode === 'register'}>
              Register
            </button>
          </>
        )}
        {isAuthenticated && (
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setMessages([]);  // clear chat
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* Login/Register forms */}
      {mode === 'login' && (
        <div style={{ marginBottom: 20 }}>
          <h2>Login</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          /><br />
          <button onClick={handleLogin}>Submit</button>
        </div>
      )}

      {mode === 'register' && (
        <div style={{ marginBottom: 20 }}>
          <h2>Register</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          /><br />
          <button onClick={handleRegister}>Submit</button>
        </div>
      )}

      {/* Chat UI */}
      <h2>Chat with AI</h2>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i}><b>{msg.sender}:</b> {msg.text}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder={isAuthenticated ? "Type your message..." : "Chat as guest..."}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
