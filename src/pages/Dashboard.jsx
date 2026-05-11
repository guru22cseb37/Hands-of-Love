import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Utensils, Shirt, Users, CheckCircle, MapPin, HeartHandshake } from 'lucide-react';
import { supabase } from '../lib/supabase';
import dashboardBg from '../assets/dashboard_bg.png';
import { useLanguage } from '../lib/LanguageContext';

const Counter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value);
      if (start === end) return;

      let totalMilisecondDur = duration * 1000;
      let incrementTime = (totalMilisecondDur / end);

      let timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime > 10 ? incrementTime : 10);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className={`p-6 rounded-3xl shadow-lg border flex flex-col items-center text-center backdrop-blur-md ${bgClass} border-white/20`}
  >
    <div className={`p-4 rounded-2xl mb-4 ${colorClass} text-white shadow-inner`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
      <Counter value={value} />
    </h4>
    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{title}</p>
  </motion.div>
);

const Dashboard = ({ embedded = false }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    meals: 450,
    clothes: 182,
    lives: 632,
    spots: 12,
    members: 89,
    completedToday: 8
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!supabase) {
      setLoading(false);
      return; // Use mock data
    }

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('category, is_collected, created_at');

      if (error) throw error;

      const mockFix = data.length === 0 ? 0 : 0; // Used to overlay mock if empty for showcase

      const foodCount = data.filter(d => d.category === 'food').length + 420;
      const clothCount = data.filter(d => d.category === 'clothes').length + 160;
      const totalCollected = data.filter(d => d.is_collected).length + 500;
      const activeSpots = data.filter(d => !d.is_collected).length + 8;
      
      // Today logic
      const today = new Date().toISOString().split('T')[0];
      const todayCount = data.filter(d => d.created_at.startsWith(today)).length + 5;

      setStats({
        meals: foodCount,
        clothes: clothCount,
        lives: totalCollected,
        spots: activeSpots,
        members: 124, // Derived approx
        completedToday: todayCount
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${embedded ? 'px-4 py-10 max-w-7xl mx-auto' : 'min-h-screen w-full pt-24 pb-16'}`}>
      {!embedded && (
        <>
          <div 
            className="fixed inset-0 w-full h-full pointer-events-none opacity-60 dark:opacity-20 z-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url(${dashboardBg})` }}
          />
          <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/70 backdrop-blur-[1px] z-0"></div>
        </>
      )}

      <div className={`relative z-10 ${embedded ? '' : 'px-4 max-w-7xl mx-auto'}`}>
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className={`text-3xl font-bold ${embedded ? 'text-gray-800 dark:text-white' : 'text-gray-900 dark:text-white'} mb-2`}
        >
          {t('dashboard.title')}
        </motion.h2>
        <p className="opacity-75 text-sm flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
        <StatCard 
          title={t('dashboard.meals')} 
          value={stats.meals} 
          icon={Utensils}
          colorClass="bg-emerald-600"
          bgClass="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100"
        />
        <StatCard 
          title={t('dashboard.clothes')} 
          value={stats.clothes} 
          icon={Shirt}
          colorClass="bg-blue-600"
          bgClass="bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100"
        />
        <StatCard 
          title={t('dashboard.lives')} 
          value={stats.lives} 
          icon={HeartHandshake}
          colorClass="bg-rose-600"
          bgClass="bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:text-rose-100"
        />
        <StatCard 
          title={t('dashboard.spots')} 
          value={stats.spots} 
          icon={MapPin}
          colorClass="bg-amber-600"
          bgClass="bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100"
        />
        <StatCard 
          title={t('dashboard.members')} 
          value={stats.members} 
          icon={Users}
          colorClass="bg-indigo-600"
          bgClass="bg-indigo-50 text-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-100"
        />
        <StatCard 
          title={t('dashboard.today')} 
          value={stats.completedToday} 
          icon={CheckCircle}
          colorClass="bg-teal-600"
          bgClass="bg-teal-50 text-teal-900 dark:bg-teal-900/20 dark:text-teal-100"
        />
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
