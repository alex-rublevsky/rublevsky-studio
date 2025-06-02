import { createContext, useState, useContext, ReactNode } from "react";

type CursorVariant =
  | "default"
  | "enlarge"
  | "link"
  | "add"
  | "block"
  | "visitWebsite"
  | "hidden";

interface CursorContextType {
  variant: CursorVariant;
  setVariant: (variant: CursorVariant) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

interface CursorContextProviderProps {
  children: ReactNode;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const useCursorContext = (): CursorContextType => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error(
      "useCursorContext must be used within a CursorContextProvider"
    );
  }
  return context;
};

export const CursorContextProvider = ({
  children,
}: CursorContextProviderProps) => {
  const [variant, setVariant] = useState<CursorVariant>("hidden");
  const [isVisible, setIsVisible] = useState(false);

  return (
    <CursorContext.Provider
      value={{
        variant,
        setVariant,
        isVisible,
        setIsVisible,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};
