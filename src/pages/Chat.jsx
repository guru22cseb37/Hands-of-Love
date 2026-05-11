import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../lib/LanguageContext';
import communityBg from '../assets/community_bg.png';

const Chat = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(() => localStorage.getItem('chatName') || '');
  const [tempName, setTempName] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Initial fetch + subscribe
  useEffect(() => {
    if (!supabase) {
      setMessages([
        { id: 1, username: 'System', content: 'Chat requires active Supabase integration.', created_at: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) console.error(error);
      else setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime insertions AND deletions
    const channel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, username]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msg = {
      username: username || 'Anonymous',
      content: input.trim()
    };
    
    setInput(''); // Clear input instantly for UX

    const { error } = await supabase.from('messages').insert([msg]);
    if (error) console.error(error);
  };

  const handleDeleteMessage = async (id) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) console.error(error);
    // Note: State UI handles it globally automatically via real-time callback
  };

  const handleSetName = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    localStorage.setItem('chatName', tempName.trim());
    setUsername(tempName.trim());
  };

  return (
    <div className="pt-20 h-[100vh] bg-gray-50 dark:bg-background-dark relative flex flex-col overflow-hidden">
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${communityBg})` }}
      />
      
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-x border-gray-100 dark:border-gray-800 relative z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">Community Connect</h1>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Real-time Live
              </p>
            </div>
          </div>
          {username && (
            <div className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <User className="w-3 h-3" /> {username}
              <button onClick={() => setUsername('')} className="ml-1 text-primary hover:underline">Edit</button>
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence>
            {!username ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 dark:bg-gray-900/95 z-20 flex flex-col items-center justify-center p-6 text-center"
              >
                <MessageSquare className="w-16 h-16 text-primary mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Join the Conversation</h2>
                <p className="text-gray-500 mb-6 max-w-xs">Pick a friendly chat name so people know who they are talking to!</p>
                <form onSubmit={handleSetName} className="w-full max-w-xs flex flex-col gap-3">
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your chat alias..."
                    className="input-field text-center"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary w-full py-3">Start Chatting</button>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Messages list */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-transparent">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500 gap-2">
                <Loader2 className="animate-spin w-5 h-5" /> Loading safe space...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-10 italic">No messages yet. Say hello to the community! 👋</div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.username === username;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id || i} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col group`}>
                      {!isMe && <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1 mb-1">{msg.username}</span>}
                      <div className="flex items-center gap-2">
                        {isMe && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600"
                            title="Delete for everyone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm break-words shadow-sm ${
                          isMe 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 mx-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Input area */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input 
                type="text"
                disabled={!username}
                placeholder="Type a message securely..."
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 ring-primary rounded-full px-5 py-3 outline-none text-gray-900 dark:text-white"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button 
                disabled={!input.trim() || !username}
                type="submit" 
                className="p-3 bg-primary text-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform active:scale-95"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
