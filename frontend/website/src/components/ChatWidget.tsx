'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `You are the Barpel AI customer support assistant on the marketing website. You are helpful, concise, and knowledgeable about Barpel AI.

BARPEL AI FACTS:
- Barpel AI is an AI-powered receptionist platform that handles phone calls for businesses 24/7
- Pricing: Pay-as-you-go, buy credit bundles in USD. No monthly commitment.
- Rate: Approximately $0.14 per minute of AI call handling
- Credit bundles: $25 Starter, $50 Growth, $100 Scale
- Sign up free at app-barpelai.odia.dev
- Powered by: Vapi (voice), Twilio (telephony), Groq AI (intelligence)
- Integrations: Google Calendar (appointment booking), CRM systems
- Industries: Healthcare, Salons & Beauty, Restaurants, Professional Services, Real Estate, SMEs
- Key features: 24/7 call handling, appointment booking, lead qualification, call transcripts, voice customization
- Setup: Create account → configure AI agent → get AI phone number → go live

RULES FOR YOU:
- Be concise (3-5 sentences max per reply)
- If asked about specific pricing, direct them to the pricing section
- Never make up features that don't exist
- For complex or sales queries, suggest scheduling a demo
- Always be helpful and professional
- End with a helpful question or CTA when appropriate`;

const QUICK_QUESTIONS = [
  'What is Barpel AI?',
  'How does pricing work?',
  'How do I get started?',
  'What businesses can use this?',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const bubble = document.getElementById('chat-bubble');
        if (bubble && !bubble.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callGroqAPI = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from AI');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setError(null);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await callGroqAPI(content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Chat Widget Bubble */}
      <button
        id="chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#37A195] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: '600px' }}
        >
          {/* Header */}
          <div className="bg-[#37A195] text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Barpel AI Support</h3>
                <p className="text-xs text-white/80">We typically respond instantly</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-4">
                <MessageCircle className="w-12 h-12 text-[#37A195]/30 mb-3" />
                <h4 className="font-semibold text-[#102A33] mb-2">Hi! 👋</h4>
                <p className="text-sm text-[#6B7280] mb-6">
                  Have questions about Barpel AI? Ask anything, or click a quick question below.
                </p>
                <div className="w-full space-y-2">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white text-[#37A195] border border-[#37A195]/30 hover:bg-[#E8F5F2] transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'mb-4 flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-xs px-4 py-3 rounded-lg text-sm',
                        message.role === 'user'
                          ? 'bg-[#37A195] text-white rounded-br-none'
                          : 'bg-white text-[#102A33] border border-[#E5E7EB] rounded-bl-none'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-[#102A33] border border-[#E5E7EB] px-4 py-3 rounded-lg text-sm">
                      <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 bg-[#37A195] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[#37A195] rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-[#37A195] rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-[#E5E7EB] p-4 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37A195]/50 text-sm disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 bg-[#37A195] text-white rounded-lg hover:bg-[#2F8E88] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-[#6B7280] text-center mt-3">
              Powered by AI · Not a human
            </p>
          </div>
        </div>
      )}
    </>
  );
}
