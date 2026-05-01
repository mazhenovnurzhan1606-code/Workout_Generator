import React, { useState, useEffect, useRef } from 'react';
import { sendChat, getChatHistory } from '../services/api';
import { Send, Bot, User, MessageSquare, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  "How many calories should I eat to lose weight?",
  "What's the best post-workout meal?",
  "How do I fix bad squat form?",
  "How long should I rest between sets?",
];

function MarkdownText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part === '\n') return <br key={i} />;
        return part;
      })}
    </span>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getChatHistory()
      .then(r => {
        const hist = r.data.flatMap(m => [
          { role: 'user', text: m.message },
          { role: 'ai', text: m.response },
        ]);
        setMessages(hist);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await sendChat(msg);
      setMessages(m => [...m, { role: 'ai', text: res.data.response }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: "Sorry, I couldn't connect. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16, paddingBottom: 16,
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--primary-soft)', border: '1px solid var(--primary-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Sparkles size={20} color="var(--primary)" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>AI Fitness Assistant</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary-dark)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
            Online · Powered by Groq AI
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="card chat-container" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <div className="chat-messages">
          {/* Loading history skeleton */}
          {!historyLoaded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2].map(i => (
                <div key={i}>
                  <div className="skeleton" style={{ height: 44, width: '55%', borderRadius: 14, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 60, width: '70%', borderRadius: 14, alignSelf: 'flex-end', marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {historyLoaded && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--primary-soft)', border: '2px solid var(--primary-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Bot size={32} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
                Hi, I'm your AI Fitness Assistant!
              </h3>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, maxWidth: 320, lineHeight: 1.6 }}>
                Ask me anything about workouts, nutrition, recovery, or general fitness advice.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              gap: 10, alignItems: 'flex-end'
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flex: 'none',
                background: m.role === 'user' ? 'var(--primary)' : 'var(--bg2)',
                border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {m.role === 'user'
                  ? <User size={16} color="white" />
                  : <Bot size={16} color="var(--primary)" />
                }
              </div>

              <div style={{ maxWidth: '72%' }}>
                {m.role === 'ai' && (
                  <div className="chat-ai-label">
                    <Bot size={11} color="var(--primary)" /> FitAI
                  </div>
                )}
                <div className={`chat-bubble ${m.role}`} style={{ whiteSpace: 'pre-wrap' }}>
                  <MarkdownText text={m.text} />
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'
              }}>
                <Bot size={16} color="var(--primary)" />
              </div>
              <div>
                <div className="chat-ai-label"><Bot size={11} color="var(--primary)" /> FitAI</div>
                <div className="chat-bubble ai" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-row">
          <MessageSquare size={18} color="var(--text3)" style={{ marginBottom: 12 }} />
          <textarea
            ref={inputRef}
            className="chat-input"
            rows={1}
            placeholder="Ask about workouts, nutrition, recovery..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className="btn btn-primary"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{ borderRadius: 10, padding: '10px 16px', marginBottom: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
    </div>
  );
}
