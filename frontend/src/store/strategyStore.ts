import { create } from 'zustand';
import { ExpressionItem, ScanResult, LogicVariable } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StrategyState {
  logicVariables: LogicVariable[];
  finalExpression: ExpressionItem[];
  indicatorVariables: ExpressionItem[];
  scanResults: ScanResult[];
  isScanning: boolean;
  activeCanvas: 'final' | string;

  actions: {
    loadStrategyState: (logicVariables: LogicVariable[], finalExpression: ExpressionItem[]) => void;
    clearStrategyState: () => void;
    addLogicVariable: () => void;
    removeLogicVariable: (id: string) => void;
    updateLogicVariable: (id: string, updates: Partial<LogicVariable>) => void;
    setActiveCanvas: (canvasId: 'final' | string) => void;
    setCanvasItems: (items: ExpressionItem[]) => void;
    addCanvasItem: (item: ExpressionItem) => void;
    addIndicatorVariable: (variable: ExpressionItem) => void;
    setScanResults: (results: ScanResult[]) => void;
    setIsScanning: (isScanning: boolean) => void;
  }
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
  logicVariables: [],
  finalExpression: [],
  indicatorVariables: [],
  scanResults: [],
  isScanning: false,
  activeCanvas: 'final',

  actions: {
    loadStrategyState: (logicVariables, finalExpression) => set({
      logicVariables: logicVariables || [],
      finalExpression: finalExpression || [],
      activeCanvas: 'final',
      indicatorVariables: [], // TODO: 전략에 지표 변수도 저장해야 함
    }),
    clearStrategyState: () => set({
      logicVariables: [],
      finalExpression: [],
      indicatorVariables: [],
      activeCanvas: 'final',
    }),
    addLogicVariable: () => {
      const newVariable: LogicVariable = {
        id: uuidv4(),
        name: `조건_${get().logicVariables.length + 1}`,
        timeframe: '1d',
        items: [],
      };
      set((state) => ({
        logicVariables: [...state.logicVariables, newVariable],
        activeCanvas: newVariable.id,
      }));
    },
    removeLogicVariable: (id) => set((state) => ({
      logicVariables: state.logicVariables.filter(v => v.id !== id),
      activeCanvas: state.activeCanvas === id ? 'final' : state.activeCanvas,
    })),
    updateLogicVariable: (id, updates) => set((state) => ({
      logicVariables: state.logicVariables.map(v => v.id === id ? { ...v, ...updates } : v),
    })),
    setActiveCanvas: (canvasId) => set({ activeCanvas: canvasId }),
    setCanvasItems: (items) => {
      const { activeCanvas } = get();
      if (activeCanvas === 'final') {
        set({ finalExpression: items });
      } else {
        set((state) => ({
          logicVariables: state.logicVariables.map(v =>
            v.id === activeCanvas ? { ...v, items } : v
          ),
        }));
      }
    },
    addCanvasItem: (item) => {
      const { activeCanvas } = get();
      const currentItems = activeCanvas === 'final' ? get().finalExpression : get().logicVariables.find(v => v.id === activeCanvas)?.items;

      if (currentItems) {
        if (activeCanvas === 'final') {
          if (item.type === 'variable' || item.type === 'operator' || item.type === 'function' || item.label === '(' || item.label === ')') {
            set({ finalExpression: [...currentItems, item] });
          } else {
            alert("최종 캔버스에는 변수, 연산자, 괄호만 추가할 수 있습니다.");
          }
        } else {
          set((state) => ({
            logicVariables: state.logicVariables.map(v =>
              v.id === activeCanvas ? { ...v, items: [...v.items, item] } : v
            ),
          }));
        }
      }
    },
    addIndicatorVariable: (variable) => set((state) => ({
      indicatorVariables: [...state.indicatorVariables, variable]
    })),
    setScanResults: (results) => set({ scanResults: results }),
    setIsScanning: (isScanning) => set({ isScanning }),
  }
}));
