import React, { createContext, useContext, useState, useEffect } from 'react';

const AllergyContext = createContext();

export const AllergyProvider = ({ children }) => {
  // Load from local storage or default to empty
  const [allergies, setAllergies] = useState(() => {
    const saved = localStorage.getItem('userAllergies');
    return saved ? JSON.parse(saved) : [];
  });

  // Whenever allergies change, save to local storage
  useEffect(() => {
    localStorage.setItem('userAllergies', JSON.stringify(allergies));
  }, [allergies]);

  const toggleAllergy = (allergen) => {
    const norm = allergen.toLowerCase();
    setAllergies(prev => 
      prev.includes(norm) 
        ? prev.filter(a => a !== norm) 
        : [...prev, norm]
    );
  };

  const addCustomAllergy = (allergen) => {
    const norm = allergen.toLowerCase();
    if (norm && !allergies.includes(norm)) {
      setAllergies(prev => [...prev, norm]);
    }
  };

  return (
    <AllergyContext.Provider value={{ allergies, toggleAllergy, addCustomAllergy }}>
      {children}
    </AllergyContext.Provider>
  );
};

export const useAllergies = () => useContext(AllergyContext);