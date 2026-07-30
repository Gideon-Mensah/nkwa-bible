import React, { createContext, useState } from "react";

export const BibleContext = createContext();

export const BibleProvider = ({ children }) => {
  const [language, setLanguage] = useState("twi");

  return (
    <BibleContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};