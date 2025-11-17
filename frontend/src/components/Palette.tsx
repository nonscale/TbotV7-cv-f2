import React, { useState } from 'react';
import { ExpressionItem } from '../types';
import { useStrategyStore } from '../store/strategyStore';
import IndicatorModal from './IndicatorModal';
import './Palette.css';

interface PaletteProps {
  onItemAdd: (item: ExpressionItem) => void;
}

const BASIC_DATA_ITEMS: ExpressionItem[] = [
    { id: 'open', type: 'data', label: 'open' }, { id: 'high', type: 'data', label: 'high' },
    { id: 'low', type: 'data', label: 'low' }, { id: 'close', type: 'data', label: 'close' },
    { id: 'volume', type: 'data', label: 'volume' }, { id: 'amount', type: 'data', label: 'amount' },
];

const OPERATOR_ITEMS: { group: string; items: ExpressionItem[] }[] = [
    { group: '사칙연산', items: [ { id: '+', type: 'operator', label: '+' }, { id: '-', type: 'operator', label: '-' }, { id: '*', type: 'operator', label: '*' }, { id: '/', type: 'operator', label: '/' } ] },
    { group: '비교연산', items: [ { id: '>', type: 'operator', label: '>' }, { id: '>=', type: 'operator', label: '>=' }, { id: '<', type: 'operator', label: '<' }, { id: '<=', type: 'operator', label: '<=' }, { id: '==', type: 'operator', label: '==' }, { id: '!=', type: 'operator', label: '!=' } ] },
    { group: '논리연산', items: [ { id: 'AND', type: 'operator', label: 'AND' }, { id: 'OR', type: 'operator', label: 'OR' }, { id: '(', type: 'operator', label: '(' }, { id: ')', type: 'operator', label: ')' } ] },
    { group: '크로스', items: [ { id: 'cross_up', type: 'function', label: 'cross_up' }, { id: 'cross_down', type: 'function', label: 'cross_down' } ] }
];

const FUNCTION_ITEMS: ExpressionItem[] = [ { id: 'shift', type: 'function', label: 'shift' }, { id: 'if', type: 'function', label: 'if' } ];

const Palette: React.FC<PaletteProps> = ({ onItemAdd }) => {
  const [numberInput, setNumberInput] = useState('');
  const [numbers, setNumbers] = useState<ExpressionItem[]>([ { id: '100', type: 'number', label: '100' }, { id: '0', type: 'number', label: '0' } ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const indicatorVariables = useStrategyStore(state => state.indicatorVariables);
  const logicVariables = useStrategyStore(state => state.logicVariables);
  const activeCanvas = useStrategyStore(state => state.activeCanvas);
  const addIndicatorVariable = useStrategyStore(state => state.actions.addIndicatorVariable);

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numberInput && !numbers.some(n => n.label === numberInput)) {
      const newItem: ExpressionItem = { id: numberInput, type: 'number', label: numberInput };
      setNumbers([...numbers, newItem]);
      onItemAdd(newItem);
    }
    setNumberInput('');
  };

  const isFinalCanvas = activeCanvas === 'final';
  const finalCanvasVariables: ExpressionItem[] = logicVariables.map(v => ({ id: v.id, type: 'variable', label: v.name }));

  return (
    <>
      <IndicatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addIndicatorVariable} />
      <div className="palette">
        <h3>팔레트</h3>
        <div className="palette-layout">
          <div className="palette-main-group">
            <h4>입력 (Inputs)</h4>
            <div className={`palette-section ${isFinalCanvas ? 'disabled' : ''}`}>
              <h5>지표</h5>
              <button onClick={() => setIsModalOpen(true)} className="palette-item item-type-indicator">지표 변수 생성...</button>
              <div className="palette-items">{indicatorVariables.map(item => (<button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-variable`} title={item.id}>{item.label}</button>))}</div>
            </div>
            <hr />
            <div className={`palette-section ${isFinalCanvas ? 'disabled' : ''}`}>
              <h5>기본 데이터</h5>
              <div className="palette-items">{BASIC_DATA_ITEMS.map(item => (<button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>{item.label}</button>))}</div>
            </div>
            <hr />
            <div className={`palette-section ${isFinalCanvas ? 'disabled' : ''}`}>
              <h5>숫자</h5>
              <form onSubmit={handleNumberSubmit} className="number-input-form">
                <div className="palette-items">
                    {numbers.map(item => (<button key={item.id} type="button" onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>{item.label}</button>))}
                    <input type="number" value={numberInput} onChange={(e) => setNumberInput(e.target.value)} placeholder="숫자 입력" />
                </div>
              </form>
            </div>
          </div>
          <div className="palette-main-group">
            <h4>로직 (Logic)</h4>
            <div className="palette-section">
                <h5>연산자</h5>
                <div className="palette-items operator-groups">{OPERATOR_ITEMS.map(group => (<div key={group.group} className="operator-group"><h6>{group.group}</h6>{group.items.map(item => (<button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>{item.label}</button>))}</div>))}</div>
            </div>
            <hr />
            <div className={`palette-section ${isFinalCanvas ? 'disabled' : ''}`}>
                <h5>함수</h5>
                <div className="palette-items">{FUNCTION_ITEMS.map(item => (<button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-${item.type}`}>{item.label}</button>))}</div>
            </div>
             <hr />
            <div className={`palette-section ${!isFinalCanvas ? 'disabled' : ''}`}>
                <h5>조건식 변수</h5>
                <div className="palette-items">{finalCanvasVariables.map(item => (<button key={item.id} onClick={() => onItemAdd(item)} className={`palette-item item-type-variable`} title={item.id}>{item.label}</button>))}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Palette;
