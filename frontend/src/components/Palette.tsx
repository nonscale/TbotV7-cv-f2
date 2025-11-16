import React from 'react';
import { ExpressionItem } from '../types';
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
          <button className="palette-item item-type-indicator">
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

        {/* 숫자 및 변수 섹션은 상태에 의존하므로 잠시 비활성화 */}

        {renderSection('함수', FUNCTION_ITEMS.map(item => (
            <button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>
              {item.label}
            </button>
        )))}
      </div>
    </>
  );
};

export default Palette;
