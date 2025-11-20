import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';
import { chatService } from '../services/gemini';
import { ChatMessage } from '../types';

export const ChatAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm NeuroShape Fast Assistant. I can help you with 3D modeling concepts or general questions at lightning speed.", timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatService(input);
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                Fast Assistant <Zap className="text-yellow-400 fill-yellow-400" size={24} />
            </h2>
            <p className="text-slate-400 text-sm">Powered by Gemini Flash Lite for instant responses.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] ${
                msg.role === 'user'
                  ? 'flex-row-reverse space-x-reverse'
                  : 'flex-row'
              } space-x-3`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600/10 text-indigo-100 border border-indigo-500/20'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start animate-pulse">
            <div className="flex space-x-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-emerald-600/50 flex-shrink-0" />
                <div className="h-12 w-32 bg-slate-800 rounded-2xl" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-14 py-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
