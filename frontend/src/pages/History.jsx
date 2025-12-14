import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ResultCard from '../components/ResultCard';
import { Trash2, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your scan history?")) {
      localStorage.removeItem('scanHistory');
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 pt-8 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-600" /> Scan History
          </h1>
          
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-400 mb-4">No scans recorded yet.</p>
            <Link to="/scan" className="text-brand-600 font-bold hover:underline">
              Start Scanning Food
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {history.map((scan, index) => (
              <div key={index} className="relative group">
                {/* Timestamp Badge */}
                <div className="absolute -top-3 left-4 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-sm z-10">
                  {new Date(scan.date).toLocaleString()}
                </div>
                
                {/* Re-use the Result Card Component */}
                <ResultCard result={scan.result} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;