import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import communityBg from '../assets/community_bg.png';

const Community = () => {
  const [donors, setDonors] = useState([]);
  
  useEffect(() => {
    const getDonors = async () => {
      if (!supabase) {
        setDonors([
          { donor_name: 'Emma Robinson', category: 'food', count: 12, location: 'West Side' },
          { donor_name: 'Chris Patterson', category: 'clothes', count: 8, location: 'Downtown' },
          { donor_name: 'Anonymous Donor', category: 'medicine', count: 15, location: 'Uptown' },
          { donor_name: 'Sarah Lee', category: 'books', count: 5, location: 'Suburbs' },
          { donor_name: 'David K.', category: 'food', count: 4, location: 'East Ave' },
        ]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('donations')
          .select('donor_name, category, location');
        
        if (error) throw error;

        // Compute counts and aggregate uniquely by name
        const grouped = data.reduce((acc, curr) => {
          const name = curr.donor_name || 'Anonymous';
          if (!acc[name]) {
            acc[name] = { donor_name: name, count: 0, category: curr.category, location: curr.location };
          }
          acc[name].count += 1;
          return acc;
        }, {});

        setDonors(Object.values(grouped).sort((a, b) => b.count - a.count));
      } catch(e) {
        console.error(e);
      }
    };
    getDonors();
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-background dark:bg-background-dark relative overflow-hidden">
      {/* Hands Connected Background */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-80 dark:opacity-20 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${communityBg})` }}
      />
      <div className="absolute inset-0 bg-white/20 dark:bg-gray-950/50 z-0"></div>

      <div className="relative z-10">
        {/* Ticker Banner */}
        <div className="bg-primary text-white py-3 overflow-hidden whitespace-nowrap flex border-b border-primary-dark relative z-20">
        <div className="flex animate-marquee hover:pause gap-12 text-sm font-bold uppercase tracking-widest items-center">
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <span>THANK YOU TO ALL OUR INCREDIBLE DONORS</span>
              <Heart className="w-4 h-4 fill-current text-accent" />
              <span>COMMUNITY MEANS LEAVING NO ONE BEHIND</span>
              <Star className="w-4 h-4 fill-current text-accent" />
              {donors.map((d, idx) => (
                 <span key={idx} className="text-white/90">{d.donor_name.toUpperCase()}</span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
          width: max-content;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center"
          >
             <Trophy className="w-10 h-10 text-amber-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Our Wall of Kindness</h1>
          <p className="text-lg text-gray-900 dark:text-gray-50 font-bold max-w-2xl mx-auto">
            These are the everyday heroes whose generosity rewrites the narrative of hunger in our city.
          </p>
        </div>

        <h3 className="text-xl font-bold mb-6 dark:text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Top Contributors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 p-6 rounded-2xl border border-white/40 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-xl flex-shrink-0">
                {donor.donor_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{donor.donor_name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mostly donated: <span className="capitalize font-medium text-gray-700 dark:text-gray-200">{donor.category}</span></p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-bold rounded">
                    {donor.count} Donations
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Community;
