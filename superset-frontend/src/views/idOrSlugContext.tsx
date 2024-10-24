import React, { createContext, useState } from 'react';

// Create a context
const IDContext = createContext();

// Create a provider component
export const IDProvider = ({ children }) => {
  const [idState, setIdState] = useState('');

  const updateidOrSlug = (ID) => {
    setIdState(ID);
  };

  return (
    <IDContext.Provider value={{ idState, updateidOrSlug }}>
      {children}
    </IDContext.Provider>
  );
};

export default IDContext;
