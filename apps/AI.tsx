
import React, { useState, useRef, useEffect } from 'react';
import { AppProps } from '../types';
import { Icon } from '../components/SystemUI';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiAssistant: React.FC<AppProps> = () => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: 'Hi! I am your NextOS Assistant powered by Gemini. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // Use gemini-2.5-flash-lite for fast responses
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash-lite-latest',
                history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
            });

            const resultStream = await chat.sendMessageStream({ message: userMsg });

            let fullText = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of resultStream) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    fullText += c.text;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].text = fullText;
                        return newMsgs;
                    });
                }
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error connecting to Gemini.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-surface">
            {/* Chat History */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-primary text-onPrimary rounded-tr-none' 
                                : 'bg-surfaceVariant text-onSurface rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surfaceVariant p-3 rounded-2xl rounded-tl-none flex gap-1">
                           <div className="w-2 h-2 bg-onSurface/50 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-onSurface/50 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                           <div className="w-2 h-2 bg-onSurface/50 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-black/10 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-surfaceVariant/50 px-4 py-3 rounded-full outline-none focus:ring-2 ring-primary/50 transition-all"
                />
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-onPrimary disabled:opacity-50 transition-transform active:scale-95"
                >
                    <Icon name="spark" />
                </button>
            </div>
        </div>
    );
};
