'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIContext } from '@/actions';

type Message = {
  role: 'ai' | 'user' | 'system';
  content: string;
  actions?: string[];
  isLog?: boolean;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Aro Intelligence System initialized. I am your real-time data agent. Monitoring platform metrics..." },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState('Thinking...');
  const [platformData, setPlatformData] = useState<any>(null);
  const [shownRecommendations, setShownRecommendations] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch real-time platform context
  useEffect(() => {
    async function loadData() {
      const data = await getAIContext();
      setPlatformData(data);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const processAIResponse = async (input: string) => {
    setIsTyping(true);
    const lowerMsg = input.toLowerCase();

    // Step 1: Simulate Logs
    setTypingStatus('Accessing Database...');
    await new Promise(r => setTimeout(r, 800));
    addMessage({ role: 'system', content: `FETCH /api/v1/market-data?path=${pathname} - 200 OK`, isLog: true });
    
    await new Promise(r => setTimeout(r, 600));
    setTypingStatus('Analyzing Page Context...');
    addMessage({ role: 'system', content: `SCANNING PAGE: ${pathname} - Elements Parsed.`, isLog: true });

    await new Promise(r => setTimeout(r, 1000));
    setTypingStatus('Generating Insight...');

    let aiResponse = "";
    let actions: string[] = ["User Stats", "Broadcast"];

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Streamlined Keyword Matching Logic
    if (lowerMsg.includes('send message') || lowerMsg.includes('broadcast')) {
      const broadcastContent = input.split(/broadcast|all users/i)[1]?.trim() || "System Update from Aro Admin";
      setTypingStatus('Executing Broadcast...');
      try {
        const result = await adminBroadcastMessage(broadcastContent);
        aiResponse = `Broadcast SUCCESSFUL. Message: "${broadcastContent}" has been sent to all ${result.count} active users on the platform.`;
        actions = ["System Logs", "User List"];
      } catch (err) {
        aiResponse = "Broadcast FAILED. Access restricted to Admin personnel only.";
        actions = ["Login", "Help"];
      }
    } else if (lowerMsg.includes('user') || lowerMsg.includes('people') || lowerMsg.includes('count')) {
      aiResponse = `System query complete. We currently have ${platformData?.totalUsers || '4'} registered users active in the ecosystem. Accessing role distribution profiles...`;
      actions = ["User Roles", "Moderation"];
    } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
      aiResponse = `Agent V2.0 initialized. System check: ${platformData?.totalUsers} users online. How can I assist with your administrative tasks today?`;
      actions = ["User Stats", "Send Broadcast"];
    } else if (pathname.includes('/admin')) {
      aiResponse = `Admin Dashboard context active. Platform health is '${platformData?.marketStatus}'. I am ready to handle user verification and system communications.`;
      actions = ["Verify Users", "System Logs"];
    } else {
      aiResponse = `Analysis of ${pathname} suggests high operational stability. We are currently supporting ${platformData?.totalUsers} users. Specify a command (e.g., 'broadcast' or 'user count').`;
    }

    addMessage({ role: 'ai', content: aiResponse, actions });
    setIsTyping(false);
  };

  const handleAction = (action: string) => {
    addMessage({ role: 'user', content: action });
    processAIResponse(action);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    addMessage({ role: 'user', content: userMsg });
    setInputValue('');
    processAIResponse(userMsg);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            className="mb-6 w-80 sm:w-96 h-[650px] bg-[#0A0D12]/98 backdrop-blur-3xl border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] rounded-[3rem] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-7 border-b border-white/5 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-[5px] border-[#0A0D12] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">Aro Agent <span className="text-emerald-400 text-xs font-bold ml-1">V2.0</span></h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Real-time Syncing</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-7 space-y-7 custom-scrollbar scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.isLog ? (
                    <div className="flex items-center gap-2 text-[9px] font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 mb-1">
                      <span className="text-emerald-500/50">●</span> {msg.content}
                    </div>
                  ) : (
                    <>
                      <div className={`max-w-[90%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none font-bold' 
                          : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none backdrop-blur-md'
                      }`}>
                        {msg.content.split('\n').map((line, idx) => (
                          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                        ))}
                      </div>
                      
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {msg.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAction(action)}
                              className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all font-black uppercase tracking-wider"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-5 rounded-[2rem] rounded-tl-none border border-white/5 flex flex-col gap-3 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest animate-pulse">{typingStatus}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-7 bg-black/60 border-t border-white/5">
              <div className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Query system for land, ROI, stats..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-7 pr-16 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.1] transition-all font-medium"
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/40"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7M5 12h14"/></svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 overflow-hidden relative group ${
          isOpen 
            ? 'bg-white/10 text-white border border-white/20' 
            : 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-emerald-500/40'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <div className="relative flex flex-col items-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_white]" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
