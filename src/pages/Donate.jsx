import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Heart, CheckCircle, AlertCircle, Loader2, MapPin } from 'lucide-react';
import donateBg from '../assets/donate_bg.png';
import { useLanguage } from '../lib/LanguageContext';

const categories = [
  { id: 'food', label: 'Food', icon: '🍲' },
  { id: 'clothes', label: 'Clothes', icon: '👕' },
  { id: 'medicine', label: 'Medicine', icon: '💊' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'other', label: 'Other', icon: '📦' }
];

const Donate = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    description: '',
    quantity: '',
    location: '',
    landmark: '',
    phone: '',
    urgency: 'today',
    available_until: '',
    donor_name: ''
  });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
        // Alert user that location was locked for map accuracy
      },
      (err) => {
        console.error(err);
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      // Mock success if client unconfigured for testing purposes
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 1500);
      return;
    }

    try {
      const submissionData = { ...formData, lat: coords.lat, lng: coords.lng, is_collected: false };
      // Remove empty strings so DB can correctly set defaults/NULLs instead of erroring on empty strings
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === '') {
          delete submissionData[key];
        }
      });

      const { error } = await supabase.from('donations').insert([submissionData]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        item_name: '', category: '', description: '', quantity: '', location: '', landmark: '', phone: '', urgency: 'today', available_until: '', donor_name: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 dark:bg-background-dark relative overflow-hidden">
      {/* Gratitude Background Setup */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none opacity-50 dark:opacity-20 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${donateBg})` }}
      />
      
      {/* Large Typographic Watermark */}
      <div className="absolute top-1/4 left-0 w-full text-center opacity-[0.03] dark:opacity-[0.05] select-none pointer-events-none font-bold z-0 overflow-hidden whitespace-nowrap">
        <div className="text-[15vw] uppercase leading-none tracking-tighter">THANK YOU</div>
        <div className="text-[12vw] leading-none mt-4">நன்றி</div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10 px-4 sm:px-6">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <Heart className="w-8 h-8 text-primary fill-current" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('form.title')}</h1>
          <p className="text-gray-500 mt-2">{t('form.subtitle')}</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 text-center bg-green-50 dark:bg-emerald-900/20 border-green-200"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Successfully Posted!</h3>
              <p className="text-green-700 dark:text-green-300 text-lg mb-6">"Your kindness is on its way to someone who needs it 💚"</p>
              <button 
                onClick={() => setSuccess(false)}
                className="btn btn-primary rounded-xl"
              >
                Make Another Donation
              </button>
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-800 space-y-6"
            >
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('form.itemName')}*</label>
                <input 
                  required
                  name="item_name"
                  placeholder="e.g., 5 Meal Packets, Warm Winter Jackets"
                  className="input-field"
                  onChange={handleChange}
                  value={formData.item_name}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('form.category')}*</label>
                  <select 
                    required
                    name="category"
                    className="input-field"
                    onChange={handleChange}
                    value={formData.category}
                  >
                    <option value="">Select a Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('form.qty')}</label>
                  <input 
                    name="quantity"
                    placeholder="e.g., 2kg, 3 items"
                    className="input-field"
                    onChange={handleChange}
                    value={formData.quantity}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea 
                  name="description"
                  rows="3"
                  placeholder="Tell them about what you are sharing..."
                  className="input-field resize-none"
                  onChange={handleChange}
                  value={formData.description}
                ></textarea>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Pickup Address*</label>
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    className={`text-xs flex items-center gap-1 ${coords.lat ? 'text-green-600 font-semibold' : 'text-primary hover:underline'}`}
                  >
                    <MapPin className="w-3 h-3" />
                    {gettingLocation ? 'Detecting...' : coords.lat ? 'Location Saved ✓' : 'Detect Current Location'}
                  </button>
                </div>
                <input 
                  required
                  name="location"
                  placeholder="Street, House number, Apartment"
                  className="input-field mb-4"
                  onChange={handleChange}
                  value={formData.location}
                />
                <input 
                  name="landmark"
                  placeholder="Landmark (Optional)"
                  className="input-field"
                  onChange={handleChange}
                  value={formData.landmark}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Phone (Optional)</label>
                  <input 
                    type="tel"
                    name="phone"
                    placeholder="+1..."
                    className="input-field"
                    onChange={handleChange}
                    value={formData.phone}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Name (Display)</label>
                  <input 
                    name="donor_name"
                    placeholder="Leave blank for anonymous"
                    className="input-field"
                    onChange={handleChange}
                    value={formData.donor_name}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Urgency level</label>
                <div className="flex gap-3">
                  {[
                    { id: 'urgent', label: 'Urgent', color: 'border-red-200 text-red-700 bg-red-50' },
                    { id: 'today', label: 'Today', color: 'border-amber-200 text-amber-700 bg-amber-50' },
                    { id: 'flexible', label: 'Flexible', color: 'border-blue-200 text-blue-700 bg-blue-50' }
                  ].map((urg) => (
                    <label 
                      key={urg.id} 
                      className={`flex-1 text-center py-3 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.urgency === urg.id 
                          ? `${urg.color} border-current ring-2 ring-offset-1` 
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="urgency" 
                        value={urg.id} 
                        checked={formData.urgency === urg.id}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="font-medium">{urg.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn bg-primary text-white py-4 text-lg rounded-xl hover:bg-primary-dark flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Posting Your Donation...
                  </>
                ) : (
                  t('form.submit')
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Donate;
