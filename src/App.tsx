import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { TimerProvider } from './context/TimerContext';
import Header from './components/Header';
import TimerPage from './pages/TimerPage';
import SailPage from './pages/SailPage';
import VMGPage from './pages/VMGPage';
import DataPage from './pages/DataPage';
import SupportPage from './pages/SupportPage';

function SupportButton() {
  const location = useLocation();
  const isActive = location.pathname === '/support';
  
  return (
    <Link
      to="/support"
      className={`fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
        isActive
          ? 'bg-white text-black'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
      style={{ 
        // Ensure it doesn't interfere with other buttons by positioning it safely
        marginBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
    </Link>
  );
}

function App() {
  return (
    <Router>
      <TimerProvider>
        <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden touch-manipulation select-none">
          <Header />
          
          <main className="flex-1 overflow-hidden pb-2 sm:pb-4">
            <Routes>
              <Route path="/" element={<TimerPage />} />
              <Route path="/timer" element={<TimerPage />} />
              <Route path="/sail" element={<SailPage />} />
              <Route path="/vmg" element={<VMGPage />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </main>
          
          {/* Support button in bottom right */}
          <SupportButton />
        </div>
      </TimerProvider>
    </Router>
  );
}

export default App;