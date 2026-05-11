import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Donate from './pages/Donate';
import Feed from './pages/Feed';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import About from './pages/About';
import Chat from './pages/Chat';
import { LanguageProvider } from './lib/LanguageContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <LanguageProvider>
      <Router>
        <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<Community />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
