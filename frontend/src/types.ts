export interface ExpressionItem {
  id: string;
  type: 'data' | 'operator' | 'number' | 'indicator' | 'variable' | 'function';
  label: string;
}

export interface ScanResult {
  ticker: string;
  code: string;
  price: string;
  amount: string;
  ohlc: 'bar_up' | 'bar_down';
}

export interface LogicVariable {
  id: string;
  name: string;
  timeframe: string;
  items: ExpressionItem[];
}

export interface Strategy {
  id: number;
  name: string;
  broker: string;
  market: string;
  description?: string;
  logic_variables?: LogicVariable[];
  final_expression?: ExpressionItem[];
  scan_logic?: any; // 기존 호환성을 위해 유지, 점차 제거 예정
  is_active: boolean;
  cron_schedule?: string;
  created_at: string;
  updated_at?: string;
}
