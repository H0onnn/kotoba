"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

interface PanelHighlightState {
  highlightedParagraphs: number[];
}

interface PanelHighlightActions {
  highlightParagraphs: (paragraphIds: number[]) => void;
  clearHighlights: () => void;
  scrollToHighlighted: () => void;
  registerParagraphRef: (id: number, element: HTMLElement | null) => void;
  registerContainerRef: (element: HTMLDivElement | null) => void;
}

interface PanelHighlightContextType
  extends PanelHighlightState,
    PanelHighlightActions {}

const PanelHighlightContext = createContext<
  PanelHighlightContextType | undefined
>(undefined);

interface PanelHighlightProviderProps {
  children: React.ReactNode;
}

export const PanelHighlightProvider = ({
  children,
}: PanelHighlightProviderProps) => {
  const [state, setState] = useState<PanelHighlightState>({
    highlightedParagraphs: [],
  });

  const paragraphRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const highlightParagraphs = useCallback((paragraphIds: number[]) => {
    setState({ highlightedParagraphs: paragraphIds });
  }, []);

  const clearHighlights = useCallback(() => {
    setState({ highlightedParagraphs: [] });
  }, []);

  const scrollToHighlighted = useCallback(() => {
    if (state.highlightedParagraphs.length > 0) {
      const firstHighlightedId = state.highlightedParagraphs[0];
      const targetElement = paragraphRefs.current[firstHighlightedId];

      if (targetElement && containerRef.current) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  }, [state.highlightedParagraphs]);

  const registerParagraphRef = useCallback(
    (id: number, element: HTMLElement | null) => {
      paragraphRefs.current[id] = element;
    },
    []
  );

  const registerContainerRef = useCallback((element: HTMLDivElement | null) => {
    containerRef.current = element;
  }, []);

  const contextValue: PanelHighlightContextType = {
    ...state,
    highlightParagraphs,
    clearHighlights,
    scrollToHighlighted,
    registerParagraphRef,
    registerContainerRef,
  };

  return (
    <PanelHighlightContext.Provider value={contextValue}>
      {children}
    </PanelHighlightContext.Provider>
  );
};

export const usePanelHighlight = () => {
  const context = useContext(PanelHighlightContext);
  if (context === undefined) {
    throw new Error(
      "usePanelHighlight must be used within a PanelHighlightProvider"
    );
  }
  return context;
};
