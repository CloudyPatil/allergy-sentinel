import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAllergies } from '../context/AllergyContext';
import { User, Plus, Check } from 'lucide-react';

const COMMON_ALLERGENS = ["Milk", "Peanut", "Soy", "Egg", "Wheat", "Shellfish", "Tree Nut", "Fish", "Sesame", "Mustard", "Corn", "Sulfite"];

const Profile = () => {
  const { allergies, toggleAllergy, addCustomAllergy } = useAllergies();
  const [customInput, setCustomInput] = useState("");

  const handleAddCustom = (e) => {
    e.preventDefault();
    addCustomAllergy(customInput);
    setCustomInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 pt-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-100 dark:bg-brand-900 p-3 rounded-full">
            <User className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your allergies for personalized scanning.</p>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          
          {/* COMMON TAGS */}
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Common Allergens</h3>
          <div className="flex flex-wrap gap-3 mb-8">
            {COMMON_ALLERGENS.map((item) => {
              const isActive = allergies.includes(item.toLowerCase());
              return (
                <button
                  key={item}
                  onClick={() => toggleAllergy(item)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                    isActive 
                      ? "bg-brand-600 border-brand-600 text-white shadow-md" 
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300"
                  }`}
                >
                  {item}
                  {isActive && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {/* CUSTOM INPUT */}
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Add Custom Allergen</h3>
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Strawberry"
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!customInput}
              className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </form>

          {/* ACTIVE LIST DISPLAY */}
          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Active Watchlist</h3>
            {allergies.length === 0 ? (
              <p className="text-gray-500 italic">No allergies selected yet. The scanner will look for everything.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                 {allergies.map(a => (
                   <span key={a} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-md text-sm font-semibold capitalize border border-red-100 dark:border-red-800">
                     {a}
                   </span>
                 ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;