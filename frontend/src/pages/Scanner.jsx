import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ResultCard from '../components/ResultCard';
import { useAllergies } from '../context/AllergyContext'; 
import { Camera, Upload, X, Loader2, Settings, Plus, RotateCcw, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// The list of quick-select options
const COMMON_ALLERGENS = ["Milk", "Peanut", "Soy", "Egg", "Wheat", "Shellfish", "Tree Nut", "Fish", "Sesame", "Mustard", "Corn", "Sulfite"];

const Scanner = () => {
  const { allergies: globalAllergies } = useAllergies(); // Global Profile
  
  // Local State for THIS specific scan (defaults to Global Profile)
  const [scanAllergies, setScanAllergies] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [showEdit, setShowEdit] = useState(false); 

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Sync local state with global profile when page loads
  useEffect(() => {
    setScanAllergies([...globalAllergies]);
  }, [globalAllergies]);

  // --- HANDLERS ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const toggleLocalAllergy = (alg) => {
    const norm = alg.toLowerCase();
    setScanAllergies(prev => 
      prev.includes(norm) ? prev.filter(a => a !== norm) : [...prev, norm]
    );
  };

  const addLocalCustom = (e) => {
    e.preventDefault();
    if (customInput && !scanAllergies.includes(customInput.toLowerCase())) {
      setScanAllergies([...scanAllergies, customInput.toLowerCase()]);
      setCustomInput("");
    }
  };

  const resetToProfile = () => {
    setScanAllergies([...globalAllergies]);
    setCustomInput("");
  };

    const handleScan = async () => {
    if (!file) return;

    if (scanAllergies.length === 0) {
      if (!window.confirm("No allergies selected for this scan. The system will check for EVERYTHING. Continue?")) return;
    }

    setLoading(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("allergens", scanAllergies.join(",")); 

    try {
      console.log("Sending request to backend..."); // Debug log
      const API_URL = import.meta.env.VITE_API_URL || "https://allergy-sentinel.onrender.com";

      const response = await axios.post(`${API_URL}/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000 // <--- CRITICAL FIX: Wait up to 2 minutes (120,000ms)
      });
      
      console.log("Response received:", response.data); // Debug log
      const data = response.data;
      setResult(data);

      const newScan = { date: new Date().toISOString(), result: data };
      const existingHistory = JSON.parse(localStorage.getItem('scanHistory') || "[]");
      const updatedHistory = [newScan, ...existingHistory].slice(0, 20);
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

    } catch (err) {
      console.error("Scan Error:", err);
      
      // Better error messages for you
      if (err.code === 'ECONNABORTED') {
        alert("Server took too long to respond. The free server is waking up. Please try again in 10 seconds!");
      } else if (err.response) {
        alert(`Server Error: ${err.response.status} - ${err.response.data?.detail || "Unknown error"}`);
      } else {
        alert("Connection Failed. Check your internet or backend URL.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 pt-8 max-w-2xl">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Scan</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Checking for <span className="font-bold text-brand-600 dark:text-brand-400">{scanAllergies.length} allergens</span>
            </p>
          </div>
          
          <button 
            onClick={() => setShowEdit(!showEdit)}
            className={`text-sm border px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 transition ${
              showEdit 
              ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-300"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" /> 
            {showEdit ? "Hide Filters" : "Edit for this scan"}
          </button>
        </div>

        {/* OVERRIDE PANEL (Conditionally Visible) */}
        {showEdit && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-brand-200 dark:border-brand-900 p-5 mb-6 animate-in slide-in-from-top-2">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm uppercase text-gray-500">Temporary Scan Filters</h3>
              <button onClick={resetToProfile} className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
                <RotateCcw className="w-3 h-3" /> Reset to Profile
              </button>
            </div>

            {/* QUICK ADD TAGS */}
            <div className="flex flex-wrap gap-2 mb-6">
              {COMMON_ALLERGENS.map((item) => {
                const isActive = scanAllergies.includes(item.toLowerCase());
                return (
                  <button
                    key={item}
                    onClick={() => toggleLocalAllergy(item)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? "bg-brand-600 border-brand-600 text-white shadow-sm" 
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300"
                    }`}
                  >
                    {item}
                    {isActive && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            {/* CUSTOM INPUT */}
            <form onSubmit={addLocalCustom} className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Add other (e.g. Strawberry)..."
                className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
              />
              <button type="submit" disabled={!customInput} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-2 rounded-lg hover:opacity-90">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* SCANNER UI */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-8">
          {!file ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="cursor-pointer flex flex-col items-center justify-center gap-3 bg-blue-50 dark:bg-blue-900/10 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-8 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group">
                <input type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-full text-blue-600 dark:text-blue-300 group-hover:scale-110 transition-transform"><Camera className="w-8 h-8" /></div>
                <div className="text-center"><span className="block font-bold text-blue-900 dark:text-blue-200">Take Photo</span></div>
              </label>
              <label className="cursor-pointer flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all group">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <div className="bg-white dark:bg-gray-700 p-4 rounded-full text-gray-500 dark:text-gray-300 group-hover:scale-110 transition-transform"><Upload className="w-8 h-8" /></div>
                <div className="text-center"><span className="block font-bold text-gray-700 dark:text-gray-200">Upload File</span></div>
              </label>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <img src={preview} alt="Scan Preview" className="w-full h-64 object-contain" />
              <button onClick={() => setFile(null)} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"><X className="w-5 h-5" /></button>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                <button onClick={handleScan} disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : "Run Analysis ✨"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS */}
        {result && <ResultCard result={result} />}
      </main>
    </div>
  );
};

export default Scanner;