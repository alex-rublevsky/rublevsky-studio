import { createContext, useState, useContext, ReactNode } from "react";

interface CursorContextType {
  initialCursorVariant: string;
  setInitialCursorVariant: (variant: string) => void;
  animateCursorVariant: string;
  setAnimateCursorVariant: (variant: string) => void;
  animateCursor: (variant: string) => void;
}

interface CursorContextProviderProps {
  children: ReactNode;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const useCursorContext = (): CursorContextType => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursorContext must be used within a CursorContextProvider');
  }
  return context;
};

export const CursorContextProvider = ({ children }: CursorContextProviderProps) => {
  const [initialCursorVariant, setInitialCursorVariant] = useState<string>("cursorLeave");
  const [animateCursorVariant, setAnimateCursorVariant] = useState<string>("cursorLeave");
  
  // This function allows for smooth transitions between cursor states
  const animateCursor = (variant: string) => {
    setInitialCursorVariant(animateCursorVariant);
    setAnimateCursorVariant(variant);
  };
  return (
    <CursorContext.Provider
      value={{
        initialCursorVariant,
        setInitialCursorVariant,
        animateCursorVariant,
        setAnimateCursorVariant,
        animateCursor,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};
