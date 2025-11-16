import React, { useState } from 'react';
import Modal from './Modal';
import { ExpressionItem } from '../types';
import { useStrategyStore } from '../store/strategyStore'; // 스토어 전체를 가져오도록 수정

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variable: ExpressionItem) => void;
}

const INDICATORS = [
  { name: 'trix', params: ['period'], outputs: ['trix', 'signal'] },
  { name: 'ma', params: ['period'], outputs: ['ma'] },
  { name: 'rsi', params: ['period'], outputs: ['rsi'] },
];

const SOURCES = ['close', 'open', 'high', 'low', 'volume', 'amount'];

const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedIndicator, setSelectedIndicator] = useState(INDICATORS[0]);
  const [params, setParams] = useState<string[]>(['12']);
  const [source, setSource] = useState('close');
  const [variableName, setVariableName] = useState('');

  // 스토어에서 변수 목록을 가져와 중복 검사에 사용
  const existingVariables = useStrategyStore((state) => state.variables);

  const handleSave = () => {
    // 변수 이름 유효성 검사 강화
    if (!variableName.trim()) {
      alert('변수 이름을 입력해주세요.');
      return;
    }
    if (existingVariables.some(v => v.label === variableName.trim())) {
      alert('이미 사용 중인 변수 이름입니다.');
      return;
    }

    const expression = `${selectedIndicator.name}(${params.join(', ')}, source=${source})`;
    const newVariable: ExpressionItem = {
      id: variableName.trim(),
      type: 'variable',
      label: variableName.trim(),
      expression: expression,
    };
    onSave(newVariable);
    // 저장 후 상태 초기화
    setVariableName('');
    setParams(['12']);
    setSelectedIndicator(INDICATORS[0]);
    setSource('close');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="지표 설정 및 변수화">
      <div className="indicator-modal-form">
        <div className="form-group">
          <label>지표 선택</label>
          <select
            value={selectedIndicator.name}
            onChange={e => setSelectedIndicator(INDICATORS.find(i => i.name === e.target.value) || INDICATORS[0])}
          >
            {INDICATORS.map(ind => <option key={ind.name} value={ind.name}>{ind.name}</option>)}
          </select>
        </div>

        {selectedIndicator.params.map((param, index) => (
          <div className="form-group" key={param}>
            <label>{param}</label>
            <input
              type="number"
              value={params[index] || ''}
              onChange={e => {
                const newParams = [...params];
                newParams[index] = e.target.value;
                setParams(newParams);
              }}
            />
          </div>
        ))}

        <div className="form-group">
          <label>소스 (Source)</label>
          <select value={source} onChange={e => setSource(e.target.value)}>
            {SOURCES.map(src => <option key={src} value={src}>{src}</option>)}
            {/* TODO: 사용자 정의 변수도 소스로 선택 가능하도록 추가 */}
          </select>
        </div>

        <div className="form-group">
          <label>변수 이름</label>
          <input
            type="text"
            value={variableName}
            onChange={e => setVariableName(e.target.value)}
            placeholder="예: trix12"
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleSave} className="save-button">Save as Variable</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default IndicatorModal;
