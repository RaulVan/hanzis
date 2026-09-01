"use client";

import { create } from "zustand";
import type { WorksheetConfig, CharacterInfo, GridType, DisplayMode, PinyinPosition } from "@/types";
import { defaultWorksheetConfig } from "@/types";
import {
  MM_TO_PX, WORKSHEET_STORAGE_KEY, restoreWorksheetSettings,
  sanitizeWorksheetConfig, serializeWorksheetSettings,
} from "@/lib/worksheetConfig";

interface WorksheetState {
  config: WorksheetConfig;
  characters: CharacterInfo[];
  currentPage: number;
  isLoading: boolean;
  isComposing: boolean;
  hasHydrated: boolean;
  storageError: string | null;
  storageAvailable: boolean;
  hydrate: () => void;
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
  setPinyinColor: (color: string) => void;
  setStrokeOrderColor: (color: string) => void;
  setCharacterColor: (color: string) => void;
  setRowGap: (gap: number) => void;
  setInsertEmptyRow: (insert: boolean) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setComposing: (composing: boolean) => void;
  resetConfig: () => void;
}

export const useWorksheetStore = create<WorksheetState>()((set, get) => ({
  config: { ...defaultWorksheetConfig }, characters: [], currentPage: 0,
  isLoading: false, isComposing: false, hasHydrated: false,
  storageError: null, storageAvailable: false,
  hydrate: () => {
    if (get().hasHydrated) return;
    let config = { ...defaultWorksheetConfig };
    let storageError: string | null = null;
    let storageAvailable = false;
    try {
      const raw = localStorage.getItem(WORKSHEET_STORAGE_KEY);
      if (raw !== null) {
        try {
          const restored = restoreWorksheetSettings(raw);
          config = restored.config;
          if (restored.needsBackup) {
            localStorage.setItem(`${WORKSHEET_STORAGE_KEY}-backup-v${Date.now()}`, raw);
          }
        } catch {
          // Invalid/future-version storage and failed backups must leave the original key intact.
          storageError = "保存的设置暂时无法读取，原记录未改动。本次设置不会自动保存，请在关闭页面前导出字帖。";
          set({ config, hasHydrated: true, storageError, storageAvailable: false });
          return;
        }
      }
      storageAvailable = true;
    } catch {
      storageError = "浏览器不允许保存本地设置。仍可生成和导出，关闭页面后本次设置不会保留。";
    }
    set({ config, hasHydrated: true, storageError, storageAvailable });
  },
  setConfig: (patch) => set((state) => ({ config: sanitizeWorksheetConfig({ ...state.config, ...patch }) })),
  setCharacters: (characters) => set({ characters }),
  setInputText: (characters) => get().setConfig({ characters }),
  setGridType: (gridType) => get().setConfig({ gridType }),
  setGridSize: (gridSize) => get().setConfig({
    gridSize,
    columnsPerRow: Math.round((210 * MM_TO_PX - get().config.pageMargin * 2) / (gridSize * MM_TO_PX)),
  }),
  setShowPinyin: (showPinyin) => get().setConfig({ showPinyin }),
  setPinyinPosition: (pinyinPosition) => get().setConfig({ pinyinPosition }),
  setShowTone: (showTone) => get().setConfig({ showTone }),
  setShowStrokeCount: (showStrokeCount) => get().setConfig({ showStrokeCount }),
  setShowRadical: (showRadical) => get().setConfig({ showRadical }),
  setShowStrokeOrder: (showStrokeOrder) => get().setConfig({ showStrokeOrder }),
  setDisplayMode: (displayMode) => get().setConfig({ displayMode }),
  setRepeatCount: (repeatCount) => get().setConfig({ repeatCount, columnsPerRow: repeatCount }),
  setColumnsPerRow: (columnsPerRow) => get().setConfig({ columnsPerRow, repeatCount: columnsPerRow }),
  setRowsPerPage: (rowsPerPage) => get().setConfig({ rowsPerPage }),
  setHighlightFirst: (highlightFirst) => get().setConfig({ highlightFirst }),
  setTraceCount: (traceCount) => get().setConfig({ traceCount }),
  setTraceColor: (traceColor) => get().setConfig({ traceColor }),
  setGridColor: (gridColor) => get().setConfig({ gridColor }),
  setPinyinColor: (pinyinColor) => get().setConfig({ pinyinColor }),
  setStrokeOrderColor: (strokeOrderColor) => get().setConfig({ strokeOrderColor }),
  setCharacterColor: (characterColor) => get().setConfig({ characterColor }),
  setRowGap: (rowGap) => get().setConfig({ rowGap }),
  setInsertEmptyRow: (insertEmptyRow) => get().setConfig({ insertEmptyRow }),
  setCurrentPage: (currentPage) => set({ currentPage: Math.max(0, currentPage) }),
  setLoading: (isLoading) => set({ isLoading }),
  setComposing: (isComposing) => set({ isComposing }),
  resetConfig: () => set({ config: { ...defaultWorksheetConfig }, currentPage: 0 }),
}));

useWorksheetStore.subscribe((state, previous) => {
  if (!state.hasHydrated || !state.storageAvailable || state.config === previous.config) return;
  try {
    localStorage.setItem(WORKSHEET_STORAGE_KEY, serializeWorksheetSettings(state.config));
  } catch {
    useWorksheetStore.setState({
      storageAvailable: false,
      storageError: "设置未能保存到浏览器。仍可继续编辑和导出，请勿在导出前关闭页面。",
    });
  }
});
