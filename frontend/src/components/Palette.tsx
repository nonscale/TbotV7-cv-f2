import React, { useState } from 'react';
import { ExpressionItem } from '../types';
// import { useStrategyStore } from '../store/strategyStore'; // 주석 처리
// import IndicatorModal from './IndicatorModal';
import './Palette.css';

interface PaletteProps {
  onItemAdd: (item: ExpressionItem) => void;
}

const BASIC_DATA_ITEMS: ExpressionItem[] = [
    { id: 'open', type: 'data', label: 'open' },
    { id: 'high', type: 'data', label: 'high' },
    { id: 'low', type: 'data', label: 'low' },
    { id: 'close', type: 'data', label: 'close' },
    { id: 'volume', type: 'data', label: 'volume' },
    { id: 'amount', type: 'data', label: 'amount' },
  ];

  const OPERATOR_ITEMS: { group: string; items: ExpressionItem[] }[] = [
    {
      group: '사칙연산',
      items: [
        { id: '+', type: 'operator', label: '+' },
        { id: '-', type: 'operator', label: '-' },
        { id: '*', type: 'operator', label: '*' },
        { id: '/', type: 'operator', label: '/' },
      ],
    },
    {
      group: '비교연산',
      items: [
        { id: '>', type: 'operator', label: '>' },
        { id: '>=', type: 'operator', label: '>=' },
        { id: '<', type: 'operator', label: '<' },
        { id: '<=', type: 'operator', label: '<=' },
        { id: '==', type: 'operator', label: '==' },
        { id: '!=', type: 'operator', label: '!=' },
      ],
    },
    {
      group: '논리연산',
      items: [
        { id: 'AND', type: 'operator', label: 'AND' },
        { id: 'OR', type: 'operator', label: 'OR' },
        { id: '(', type: 'operator', label: '(' },
        { id: ')', type: 'operator', label: ')' },
      ],
    },
    {
      group: '크로스',
      items: [
          { id: 'cross_up', type: 'function', label: 'cross_up' },
          { id: 'cross_down', type: 'function', label: 'cross_down' },
      ]
    }
  ];

  const FUNCTION_ITEMS: ExpressionItem[] = [
      { id: 'shift', type: 'function', label: 'shift' },
      { id: 'if', type: 'function', label: 'if' },
      { id: 'elseif', type: 'function', label: 'elseif' },
      { id: 'then', type: 'function', label: 'then' },
  ];

const Palette: React.FC<PaletteProps> = ({ onItemAdd }) => {
  const [numberInput, setNumberInput] = useState('');
  const [numbers, setNumbers] = useState<ExpressionItem[]>([
    { id: '100', type: 'number', label: '100' },
    { id: '0', type: 'number', label: '0' },
  ]);

  // --- ZUSTAND 연동 코드 비활성화 ---
  // const { variables, addVariable, activeCanvas } = useStrategyStore((state) => ({
  //   variables: state.variables,
  //   addVariable: state.addVariable,
  //   activeCanvas: state.activeCanvas,
  // }));
  const variables: ExpressionItem[] = []; // 임시 static 값
  const activeCanvas = 'second'; // 임시 static 값
  // --- ZUSTAND 연동 코드 비활성화 ---


  const isFirstScan = activeCanvas === 'first';

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numberInput && !numbers.some(n => n.label === numberInput)) {
      const newItem: ExpressionItem = { id: numberInput, type: 'number', label: numberInput };
      setNumbers([...numbers, newItem]);
      onItemAdd(newItem);
    }
    setNumberInput('');
  };

  const renderSection = (title: string, items: React.ReactNode) => (
    <div className="palette-section">
      <h4>{title}</h4>
      <div className="palette-items">{items}</div>
    </div>
  );

  return (
    <>
      <div className="palette">
        <h3>팔레트 (도구 모음)</h3>

        {renderSection('지표', (
          <button
            className="palette-item item-type-indicator"
            disabled={isFirstScan}
            title={isFirstScan ? "1차 스캔에서는 지표를 사용할 수 없습니다." : "지표 설정"}
          >
            지표 설정...
          </button>
        ))}

        {renderSection('기본 데이터', BASIC_DATA_ITEMS.map(item => (
          <button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>
            {item.label}
          </button>
        )))}

        {renderSection('연산자', OPERATOR_ITEMS.map(group => (
          <div key={group.group} className="operator-group">
            {group.items.map(item => (
              <button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>
                {item.label}
              </button>
            ))}
          </div>
        )))}

        {renderSection('숫자', (
          <form onSubmit={handleNumberSubmit} className="number-input-form">
            {numbers.map(item => (
              <button key={item.id} type="button" onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>
                {item.label}
              </button>
            ))}
            <input
              type="number"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              placeholder="숫자 입력"
            />
          </form>
        ))}

        {renderSection('변수', variables.map(item => (
          <button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`} title={item.expression}>
            {item.label}
          </button>
        )))}

        {renderSection('함수', FUNCTION_ITEMS.map(item => {
          const isDisabled = isFirstScan && item.id === 'shift';
          return (
            <button
              key={item.id}
              onClick={() => onItemAdd(item)}
              className={`palette-item item-type-${item.type}`}
              disabled={isDisabled}
              title={isDisabled ? "1차 스캔에서는 shift 함수를 사용할 수 없습니다." : ""}
            >
              {item.label}
            </button>
          );
        }))}
      </div>
    </>
  );
};

export default Palette;
