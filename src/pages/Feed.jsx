import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, MapPin, Calendar, Filter, Check, Clock, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import feedBg from '../assets/feed_bg.png';
import { useLanguage } from '../lib/LanguageContext';

// Relative time formatter
const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 60000); // min
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const urgencyColors = {
  urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  today: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  flexible: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
};

const categoryIcons = {
  food: '🍲', clothes: '👕', medicine: '💊', books: '📚', other: '📦'
};

const Feed = () => {
  const { t } = useLanguage();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDonations = async () => {
    if (!supabase) {
      // Fallback mock data
      setDonations([
        { id: 1, item_name: '5 Hot Lunches', category: 'food', description: 'Freshly cooked vegetable curry.', location: 'Downtown Center', urgency: 'urgent', is_collected: false, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), donor_name: 'Jenny S.' },
        { id: 2, item_name: 'Winter Coats (Medium)', category: 'clothes', description: 'Gently used, cleaned.', location: 'North Suburbs', urgency: 'flexible', is_collected: false, created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), donor_name: 'Michael' },
        { id: 3, item_name: 'Textbooks Grade 10', category: 'books', description: 'Full set available.', location: 'Central Library Lane', urgency: 'today', is_collected: true, collected_at: new Date().toISOString(), created_at: new Date(Date.now() - 86400000).toISOString(), donor_name: 'Anonymous' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    // Setup Supabase Realtime listener if available
    let subscription = null;
    if (supabase) {
      subscription = supabase
        .channel('public:donations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, payload => {
          fetchDonations();
        })
        .subscribe();
    }

    return () => {
      if (subscription && supabase) supabase.removeChannel(subscription);
    };
  }, []);

  const handleCollect = async (id) => {
    setUpdatingId(id);
    if (!supabase) {
      // Fake update
      setTimeout(() => {
        setDonations(donations.map(d => d.id === id ? { ...d, is_collected: true, collected_at: new Date().toISOString() } : d));
        setUpdatingId(null);
      }, 800);
      return;
    }

    try {
      const { error } = await supabase
        .from('donations')
        .update({ is_collected: true, collected_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      // Realtime should pick it up, but local state optimize
      setDonations(donations.map(d => d.id === id ? { ...d, is_collected: true, collected_at: new Date().toISOString() } : d));
    } catch (e) {
      alert("Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDonations = donations.filter(item => {
    const matchesSearch = 
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      activeCategory === 'all' ? true : 
      activeCategory === 'collected' ? item.is_collected :
      activeCategory === 'urgent' ? item.urgency === 'urgent' :
      item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background dark:bg-background-dark px-4 md:px-8 relative">
      {/* Artistic Background Overlay */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-10 z-0 bg-cover bg-center bg-no-repeat mix-blend-multiply dark:mix-blend-normal" 
        style={{ backgroundImage: `url(${feedBg})` }}
      />
      <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/80 backdrop-blur-[2px] z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header & Search */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{t('feed.title')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t('feed.subtitle')}</p>
          </div>
          
          <div className="relative flex-grow max-w-md w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('feed.search')}
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
          {['all', 'food', 'clothes', 'medicine', 'books', 'urgent', 'collected'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeCategory === cat 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="bg-white dark:bg-gray-900 h-64 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800"></div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonations.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className={`bg-white/80 backdrop-blur-md dark:bg-gray-900/80 rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group ${
                    item.is_collected ? 'border-gray-200 opacity-75 dark:border-gray-800' : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${urgencyColors[item.urgency] || 'bg-gray-100 text-gray-600'}`}>
                        {item.urgency}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl mb-1 flex items-center gap-2 dark:text-white">
                      <span className="text-2xl">{categoryIcons[item.category] || '📦'}</span>
                      {item.item_name}
                    </h3>
                    
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {item.description || "No description provided."}
                    </p>

                    <div className="space-y-2.5 text-sm border-t border-gray-50 dark:border-gray-800 pt-4">
                      {item.lat && item.lng ? (
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 text-primary font-medium hover:underline p-2 bg-primary/5 rounded-lg border border-primary/10 transition-colors group"
                        >
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:animate-bounce" />
                          <div>
                            <span>{item.location} {item.landmark && <span className="text-xs text-gray-500">({item.landmark})</span>}</span>
                            <div className="text-[10px] text-primary/70 font-bold uppercase mt-0.5 tracking-wider">🚀 Tap to Navigate Live</div>
                          </div>
                        </a>
                      ) : (
                        <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item.location} {item.landmark && <span className="text-xs text-gray-500">({item.landmark})</span>}</span>
                        </div>
                      )}
                      {item.phone && !item.is_collected && (
                        <a href={`tel:${item.phone}`} className="flex items-center gap-2 text-primary hover:underline font-medium">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{item.phone}</span>
                        </a>
                      )}
                      <div className="text-xs text-gray-400 italic mt-2">
                        Posted by: {item.donor_name || 'Anonymous'}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    {item.is_collected ? (
                      <div className="w-full text-center text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2 text-sm">
                        <Check className="w-4 h-4" /> Collected
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCollect(item.id)}
                        disabled={updatingId === item.id}
                        className="w-full btn bg-white border border-gray-200 hover:bg-primary hover:text-white hover:border-primary text-gray-800 font-semibold dark:bg-gray-900 dark:border-gray-700 dark:text-white transition-colors duration-200"
                      >
                        {updatingId === item.id ? 'Processing...' : "I'll collect this"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filteredDonations.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No donations found</h3>
            <p className="text-gray-500">Try clearing your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
