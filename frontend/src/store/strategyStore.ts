import { create } from 'zustand';
import { ExpressionItem, ScanResult } from '../types';

interface StrategyState {
  firstScanItems: ExpressionItem[];
  secondScanItems: ExpressionItem[];
  variables: ExpressionItem[]; // 변수 목록 상태 추가
  scanResults: ScanResult[];
  isScanning: boolean;
  activeCanvas: 'first' | 'second';
  setFirstScanItems: (items: ExpressionItem[]) => void;
  setSecondScanItems: (items: ExpressionItem[]) => void;
  addFirstScanItem: (item: ExpressionItem) => void;
  addSecondScanItem: (item: ExpressionItem) => void;
  addVariable: (variable: ExpressionItem) => void; // 변수 추가 액션 추가
  setScanResults: (results: ScanResult[]) => void;
  setIsScanning: (isScanning: boolean) => void;
  setActiveCanvas: (canvas: 'first' | 'second') => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
  firstScanItems: [],
  secondScanItems: [],
  variables: [], // 초기 변수 목록
  scanResults: [],
  isScanning: false,
  activeCanvas: 'first',
  setFirstScanItems: (items) => set({ firstScanItems: items }),
  setSecondScanItems: (items) => set({ secondScanItems: items }),
  addFirstScanItem: (item) => set((state) => ({ firstScanItems: [...state.firstScanItems, item] })),
  addSecondScanItem: (item) => set((state) => ({ secondScanItems: [...state.secondScanItems, item] })),
  addVariable: (variable) => set((state) => ({ variables: [...state.variables, variable] })), // 변수 추가 로직
  setScanResults: (results) => set({ scanResults: results }),
  setIsScanning: (isScanning) => set({ isScanning }),
  setActiveCanvas: (canvas) => set({ activeCanvas: canvas }),
}));
