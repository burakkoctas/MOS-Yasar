// Path: src/features/delegate/context/DelegateContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface DelegateContextType {
  email: string;
  setEmail: (val: string) => void;
  startDate: Date | undefined;
  setStartDate: (val: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (val: Date | undefined) => void;
  scope: 'ALL' | 'SELECT';
  setScope: (val: 'ALL' | 'SELECT') => void;
  selectedTitles: string[]; // Seçili başlıkların ID'lerini tutar
  setSelectedTitles: (val: string[]) => void;
  resetForm: () => void;
}

const DelegateContext = createContext<DelegateContextType | undefined>(undefined);

export const DelegateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [scope, setScope] = useState<'ALL' | 'SELECT'>('ALL');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);

  const resetForm = () => {
    setEmail('');
    setStartDate(undefined);
    setEndDate(undefined);
    setScope('ALL');
    setSelectedTitles([]);
  };

  return (
    <DelegateContext.Provider value={{
      email, setEmail, startDate, setStartDate, endDate, setEndDate,
      scope, setScope, selectedTitles, setSelectedTitles, resetForm
    }}>
      {children}
    </DelegateContext.Provider>
  );
};

export const useDelegate = () => {
  const context = useContext(DelegateContext);
  if (!context) throw new Error("useDelegate must be used within a DelegateProvider");
  return context;
};