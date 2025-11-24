// pages/index.js
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [mode, setMode] = useState('auth'); // 'auth' or 'chat'
  const [authMode, setAuthMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    // try to fetch current user
    fetch('/api/user').then(r => r.json()).then(data => {
      if (data?.user) {
        setUser(data.user);
        setMode('chat');
        loadMessages();
      } else {
        setMode('auth');
      }
    });
  }, []);

  const loadMessages = async () => {
    const res = await fetch('/api/messages?limit=500');
    const json = await res.json();
    if (json?.messages) setMessages(json.messages);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const j = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser(j.user);
      setMode('chat');
      loadMessages();
    } else alert(j.error || 'Signup failed');
  }

  async function handleSignin(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const j = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser(j.user);
      setMode('chat');
      loadMessages();
    } else alert(j.error || 'Signin failed');
  }

  async function handleSignout() {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    setMode('auth');
    setMessages([]);
    setEmail('');
    setPassword('');
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const j = await res.json();
      if (j.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: j.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
      }
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error calling API.' }]);
    } finally {
      setLoading(false);
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (mode === 'auth') {
    return (
      <div className="container">
        <div className="card auth-card">
          <h2>{authMode === 'signin' ? 'Sign In' : 'Create account'}</h2>

          <form onSubmit={authMode === 'signin' ? handleSignin : handleSignup}>
            {authMode === 'signup' && (
              <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            )}
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" disabled={loading}>{loading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}</button>
          </form>

          <div className="muted">
            {authMode === 'signin' ? (
              <>
                New here? <button className="link" onClick={() => setAuthMode('signup')}>Create an account</button>
              </>
            ) : (
              <>
                Already have an account? <button className="link" onClick={() => setAuthMode('signin')}>Sign in</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chat UI
  return (
    <div className="container">
      <div className="topbar">
        <div className="title">Cohere Chat</div>
        <div>
          <span className="muted">Signed in as {user?.email}</span>
          <button className="btn-ghost" onClick={handleSignout}>Logout</button>
        </div>
      </div>

      <div className="chat-window">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="bubble"><div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div></div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="composer">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={loading ? 'Generating...' : 'Type a message and press Enter'}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading} className="send-btn">{loading ? '...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
