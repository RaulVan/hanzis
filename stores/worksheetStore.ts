"use client";

import { create } from "zustand";
import type { WorksheetConfig, CharacterInfo, GridType, DisplayMode, PinyinPosition } from "@/types";
import { defaultWorksheetConfig } from "@/types";

interface WorksheetState {
  // Configuration
  config: WorksheetConfig;
  
  // Processed character data
  characters: CharacterInfo[];
  
  // Current page for preview
  currentPage: number;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setConfig: (config: Partial<WorksheetConfig>) => void;
  setCharacters: (characters: CharacterInfo[]) => void;
  setInputText: (text: string) => void;
  setGridType: (type: GridType) => void;
  setGridSize: (size: number) => void;
  setShowPinyin: (show: boolean) => void;
  setPinyinPosition: (position: PinyinPosition) => void;
  setShowTone: (show: boolean) => void;
  setShowStrokeCount: (show: boolean) => void;
  setShowRadical: (show: boolean) => void;
  setShowStrokeOrder: (show: boolean) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setRepeatCount: (count: number) => void;
  setColumnsPerRow: (columns: number) => void;
  setRowsPerPage: (rows: number) => void;
  setHighlightFirst: (highlight: boolean) => void;
  setTraceCount: (count: number) => void;
  setTraceColor: (color: string) => void;
  setGridColor: (color: string) => void;
  setRowGap: (gap: number) => void;
  setInsertEmptyRow: (insert: boolean) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  resetConfig: () => void;
}

export const useWorksheetStore = create<WorksheetState>((set) => ({
  config: defaultWorksheetConfig,
  characters: [],
  currentPage: 0,
  isLoading: false,

  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig },
    })),

  setCharacters: (characters) => set({ characters }),

  setInputText: (text) =>
    set((state) => ({
      config: { ...state.config, characters: text },
    })),

  setGridType: (type) =>
    set((state) => ({
      config: { ...state.config, gridType: type },
    })),

  setGridSize: (size) =>
    set((state) => ({
      config: { ...state.config, gridSize: size },
    })),

  setShowPinyin: (show) =>
    set((state) => ({
      config: { ...state.config, showPinyin: show },
    })),

  setPinyinPosition: (position) =>
    set((state) => ({
      config: { ...state.config, pinyinPosition: position },
    })),

  setShowTone: (show) =>
    set((state) => ({
      config: { ...state.config, showTone: show },
    })),

  setShowStrokeCount: (show) =>
    set((state) => ({
      config: { ...state.config, showStrokeCount: show },
    })),

  setShowRadical: (show) =>
    set((state) => ({
      config: { ...state.config, showRadical: show },
    })),

  setShowStrokeOrder: (show) =>
    set((state) => ({
      config: { ...state.config, showStrokeOrder: show },
    })),

  setDisplayMode: (mode) =>
    set((state) => ({
      config: { ...state.config, displayMode: mode },
    })),

  setRepeatCount: (count) =>
    set((state) => ({
      config: { ...state.config, repeatCount: count, columnsPerRow: count },
    })),

  setColumnsPerRow: (columns) =>
    set((state) => ({
      config: { ...state.config, columnsPerRow: columns },
    })),

  setRowsPerPage: (rows) =>
    set((state) => ({
      config: { ...state.config, rowsPerPage: rows },
    })),

  setHighlightFirst: (highlight) =>
    set((state) => ({
      config: { ...state.config, highlightFirst: highlight },
    })),

  setTraceCount: (count) =>
    set((state) => ({
      config: { ...state.config, traceCount: count },
    })),

  setTraceColor: (color) =>
    set((state) => ({
      config: { ...state.config, traceColor: color },
    })),

  setGridColor: (color) =>
    set((state) => ({
      config: { ...state.config, gridColor: color },
    })),

  setRowGap: (gap) =>
    set((state) => ({
      config: { ...state.config, rowGap: gap },
    })),

  setInsertEmptyRow: (insert) =>
    set((state) => ({
      config: { ...state.config, insertEmptyRow: insert },
    })),

  setCurrentPage: (page) => set({ currentPage: page }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetConfig: () =>
    set({
      config: defaultWorksheetConfig,
      characters: [],
      currentPage: 0,
    }),
}));
