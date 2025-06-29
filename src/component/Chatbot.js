import React, { useState, useRef, useEffect } from 'react';
import { API } from 'aws-amplify';

export default function Chatbot({ fileKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input) return;
    const userMsg = { sender: 'You', text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await API.post('medicalApi', '/chat', { body: { scanKey: fileKey, question: input } });
      setMessages(prev => [...prev, { sender: 'Bot', text: res.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'Bot', text: 'Error answering. Try again.' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ height: 300, overflowY: 'auto', border: '1px solid #ccc', padding: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === 'You' ? 'right' : 'left', margin: 4 }}>
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a question…"
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input} style={{ marginLeft: 8 }}>
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
