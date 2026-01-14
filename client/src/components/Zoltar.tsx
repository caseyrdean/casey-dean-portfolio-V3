/**
 * Zoltar - Animated Fortune Teller Component
 * 1980s Heavy Metal Animation Style
 * 
 * A mystical fortune teller that answers questions about Casey Dean
 * using RAG (Retrieval-Augmented Generation) from approved documents.
 */

import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { nanoid } from 'nanoid';
import { Send, Sparkles, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generate or retrieve session ID
function getSessionId(): string {
  const key = 'zoltar_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = nanoid(16);
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

interface Message {
  role: 'user' | 'zoltar';
  content: string;
  isTyping?: boolean;
}

export default function Zoltar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId] = useState(getSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.zoltar.chat.useMutation();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'zoltar',
        content: "Greetings, seeker of knowledge! I am Zoltar, keeper of the sacred scrolls of Casey Dean's professional journey. Ask me anything about his cloud architecture expertise, his projects, or his mystical AWS powers... and the spirits shall reveal the truth!"
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    // Add thinking indicator
    setMessages(prev => [...prev, { role: 'zoltar', content: '', isTyping: true }]);

    try {
      const result = await chatMutation.mutateAsync({
        message: userMessage,
        sessionId,
      });

      // Replace thinking indicator with actual response
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isTyping);
        return [...newMessages, { role: 'zoltar', content: result.response }];
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = prev.filter(m => !m.isTyping);
        return [...newMessages, { 
          role: 'zoltar', 
          content: "The mystical energies are disturbed... I cannot provide a reading at this moment. Please try again later." 
        }];
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Zoltar Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group ${isOpen ? 'hidden' : ''}`}
        aria-label="Open Zoltar Fortune Teller"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-lg opacity-60 group-hover:opacity-100 animate-pulse transition-opacity" />
          
          {/* Button */}
          <div className="relative w-16 h-16 bg-background border-2 border-primary rounded-full flex items-center justify-center overflow-hidden group-hover:border-secondary transition-colors">
            {/* Zoltar face icon */}
            <div className="text-3xl animate-bounce-slow">🔮</div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-card border border-primary/50 text-primary text-xs font-subhead tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            ASK ZOLTAR
          </div>
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window */}
          <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-card border-2 border-primary flex flex-col overflow-hidden animate-slide-up">
            {/* Scanlines overlay */}
            <div className="absolute inset-0 scanlines opacity-10 pointer-events-none z-10" />
            
            {/* Header */}
            <div className="relative z-20 flex items-center justify-between p-4 border-b border-primary/50 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔮</div>
                <div>
                  <h3 className="font-display text-lg text-foreground tracking-wider">ZOLTAR</h3>
                  <p className="text-xs font-subhead text-primary tracking-widest">ORACLE OF CASEY DEAN</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center border border-primary/50 hover:border-primary hover:bg-primary/20 transition-colors"
              >
                <X className="w-4 h-4 text-primary" />
              </button>
            </div>

            {/* Messages */}
            <div className="relative z-20 flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 ${
                      message.role === 'user'
                        ? 'bg-primary/20 border border-primary/50 text-foreground'
                        : 'bg-secondary/10 border border-secondary/30 text-foreground'
                    }`}
                  >
                    {message.role === 'zoltar' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        <span className="text-xs font-subhead text-secondary tracking-wider">ZOLTAR SPEAKS</span>
                      </div>
                    )}
                    
                    {message.isTyping ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-body">Consulting the spirits...</span>
                      </div>
                    ) : (
                      <p className="text-sm font-body leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="relative z-20 p-4 border-t border-primary/50 bg-background/50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Casey Dean..."
                  disabled={isThinking}
                  className="flex-1 bg-background border border-primary/50 px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="bg-primary hover:bg-primary/80 text-primary-foreground border border-primary px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground font-body text-center">
                Zoltar only knows what's in the sacred scrolls
              </p>
            </form>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent pointer-events-none z-30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent pointer-events-none z-30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent pointer-events-none z-30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent pointer-events-none z-30" />
          </div>
        </div>
      )}
    </>
  );
}
