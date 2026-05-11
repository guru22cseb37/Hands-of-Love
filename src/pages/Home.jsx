import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Heart, ArrowRight } from 'lucide-react';
import ImpactDashboard from './Dashboard';
import { useLanguage } from '../lib/LanguageContext';

const Home = () => {
  const videoRef = useRef(null);
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-background dark:bg-background-dark">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center px-4">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full object-cover">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-hands-delivering-a-box-of-food-41031-large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-4xl mx-auto text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-accent text-accent" /> {t('hero.platform')}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t('hero.subtext')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/donate" className="btn bg-primary hover:bg-primary-light text-white px-8 py-4 text-lg shadow-xl w-full sm:w-auto flex items-center gap-2 group">
                {t('hero.btnDonate')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/feed" className="btn-outline text-white px-8 py-4 text-lg w-full sm:w-auto">
                {t('hero.btnHelp')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Down Arrow */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown className="w-8 h-8 text-white/70" />
        </motion.div>
      </section>

      {/* Dashboard Preview / Inline */}
      <section className="relative -mt-20 z-30">
        <ImpactDashboard embedded={true} />
      </section>

      {/* Additional Emotional Segment */}
      <section className="py-24 px-6 md:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            "You threw away food. Someone slept hungry.<br/>Let's fix that together."
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { title: "Easy Sharing", desc: "Snap a photo and enter location. It takes 30 seconds.", icon: "📱" },
              { title: "Quick Pickup", desc: "Direct local support without bureaucratic delays.", icon: "🤝" },
              { title: "Total Impact", desc: "Direct dignity-first approach for total food security.", icon: "🌍" }
            ].map((feature, i) => (
              <div key={i} className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
