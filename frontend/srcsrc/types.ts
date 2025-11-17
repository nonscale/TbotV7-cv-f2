export interface ExpressionItem {
    id: string;
    type: 'data' | 'operator' | 'number' | 'indicator' | 'variable' | 'function';
    label: string;
    expression?: string; // 변수인 경우, 원본 표현식
  }

  export interface ScanResult {
    ticker: string;
    code: string;
    price: string;
    amount: string;
    ohlc: string;
  }

  // 백엔드 API와 통신하기 위한 Strategy 타입 추가
  export interface Strategy {
    id: number;
    name: string;
    broker: string;
    market: string;
    description?: string;
    scan_logic: {
      first_scan_expression: any;
      second_scan_expression: any;
    };
    is_active: boolean;
    cron_schedule?: string;
    created_at: string;
    updated_at?: string;
  }
