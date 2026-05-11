import React from 'react';
import { motion } from 'framer-motion';
import { Quote, ShieldCheck, Users2, Globe2 } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-24 pb-20 bg-background dark:bg-background-dark min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h1>
          <p className="text-xl text-primary font-medium italic max-w-2xl mx-auto">
            "Poverty is not their destiny. Your kindness can rewrite it."
          </p>
        </motion.div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
            <Quote className="absolute top-6 left-6 w-16 h-16 text-primary/5 -z-0" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">Why அன்பின் கரம்?</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Every year, millions of tons of edible food, perfectly good clothing, and essential medical items find their way to landfills. Simultaneously, neighbors in our very own communities sleep hungry or brave the cold unprotected. 
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We built <strong>அன்பின் கரம்</strong> to bridge that gap instantly. No accounts, no complicated logistical friction, and absolutely no judgment. By enabling direct neighbor-to-neighbor generosity, we return dignity to the equation and transform excess into sustenance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: Users2,
              title: "Hyper-Local",
              desc: "Connecting immediate street-level resources to the hands that need them most."
            },
            {
              icon: ShieldCheck,
              title: "Dignity First",
              desc: "Ensuring that requesting help is seamless, anonymous, and safe."
            },
            {
              icon: Globe2,
              title: "Zero Waste",
              desc: "Helping redirect useful items from landfills into active household consumption."
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center bg-primary rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">One post. One pickup. One life changed.</h3>
          <p className="mb-8 relative z-10 opacity-90 text-lg">Are you ready to make an impact?</p>
          <a href="/donate" className="relative z-10 btn bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg shadow-lg">
            Start Giving Today
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
