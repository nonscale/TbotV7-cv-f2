import React, { useCallback, useState } from 'react';
import axios from 'axios';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import Preview from '../components/Preview'; // Preview 컴포넌트 import
import ScanResultsTable from '../components/ScanResultsTable';
import { ExpressionItem, ScanResult } from '../types';
import { useStrategyStore } from '../store/strategyStore';
import './StrategyBuilderPage.css';

const API_BASE_URL = 'http://localhost:8000';

// ... (buildExpressionPayload 함수는 이전과 동일)
const buildExpressionPayload = (items: ExpressionItem[]): any => {
    if (items.length === 0) {
        return null;
    }
    let expression: any = items[0];
    let i = 1;
    while (i < items.length) {
        const operatorItem = items[i];
        const rightOperand = items[i + 1];
        if (operatorItem?.type === 'operator' && rightOperand) {
            expression = {
                type: 'expression',
                operator: operatorItem.label,
                operands: [expression, rightOperand],
            };
            i += 2;
        } else {
            expression = [expression, items[i]];
            i += 1;
        }
    }
    return expression;
};


const StrategyBuilderPage: React.FC = () => {
  const {
    firstScanItems,
    secondScanItems,
    scanResults,
    isScanning,
    activeCanvas,
    setFirstScanItems,
    setSecondScanItems,
    addFirstScanItem,
    addSecondScanItem,
    setScanResults,
    setIsScanning,
    setActiveCanvas,
  } = useStrategyStore();

  const [strategyName, setStrategyName] = useState('');
  const [savedStrategies, setSavedStrategies] = useState<Record<string, { first: ExpressionItem[], second: ExpressionItem[] }>>(() => {
    const localData = localStorage.getItem('strategies');
    return localData ? JSON.parse(localData) : {};
  });

  // ... (핸들러 함수들은 이전과 동일)
  const handleItemAdd = useCallback((item: ExpressionItem) => {
    if (activeCanvas === 'first') {
      addFirstScanItem(item);
    } else {
      addSecondScanItem(item);
    }
  }, [activeCanvas, addFirstScanItem, addSecondScanItem]);

  const handleSaveStrategy = () => {
    if (!strategyName) {
      alert('전략 이름을 입력해주세요.');
      return;
    }
    const newStrategies = { ...savedStrategies, [strategyName]: { first: firstScanItems, second: secondScanItems } };
    setSavedStrategies(newStrategies);
    localStorage.setItem('strategies', JSON.stringify(newStrategies));
    alert(`'${strategyName}' 전략이 저장되었습니다.`);
  };

  const handleLoadStrategy = (name: string) => {
    const strategy = savedStrategies[name];
    if (strategy) {
      setStrategyName(name);
      setFirstScanItems(strategy.first);
      setSecondScanItems(strategy.second);
    }
  };

  const handleDeleteStrategy = (name: string) => {
    const { [name]: _, ...remainingStrategies } = savedStrategies;
    setSavedStrategies(remainingStrategies);
    localStorage.setItem('strategies', JSON.stringify(remainingStrategies));
    if (strategyName === name) {
        setStrategyName('');
        setFirstScanItems([]);
        setSecondScanItems([]);
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    setScanResults([]);

    const firstScanExpression = buildExpressionPayload(firstScanItems);
    const secondScanExpression = buildExpressionPayload(secondScanItems);

    try {
      console.log("1차 스캔 Payload:", JSON.stringify(firstScanExpression, null, 2));
      console.log("2차 스캔 Payload:", JSON.stringify(secondScanExpression, null, 2));

      const response = await axios.post(`${API_BASE_URL}/api/v1/scans/run-dynamic`, {
        strategy: {
          id: strategyName || `dynamic-strategy-${Date.now()}`,
          name: strategyName || 'Untitled Strategy',
          first_scan_expression: firstScanExpression,
          second_scan_expression: secondScanExpression,
        }
      });

      const results: ScanResult[] = response.data.results || [];
      setScanResults(results);

    } catch (error) {
      console.error("스캔 실행 중 오류 발생:", error);
      alert("스캔 실행에 실패했습니다. 콘솔 로그를 확인해주세요.");
      setScanResults([]);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="strategy-builder-page">
      <h2>Strategy Builder</h2>

      <div className="strategy-management-controls">
        <input
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="전략 이름 입력"
        />
        <select onChange={(e) => handleLoadStrategy(e.target.value)} value={strategyName}>
            <option value="">전략 불러오기</option>
            {Object.keys(savedStrategies).map(name => (
                <option key={name} value={name}>{name}</option>
            ))}
        </select>
        <button onClick={handleSaveStrategy}>Save</button>
        <button onClick={() => handleDeleteStrategy(strategyName)} disabled={!strategyName || !savedStrategies[strategyName]}>
            Delete
        </button>
      </div>

      <Palette onItemAdd={handleItemAdd} />

      {/* Preview 컴포넌트 추가 */}
      <Preview firstScanItems={firstScanItems} secondScanItems={secondScanItems} />

      <div className="canvas-selector">
        <button onClick={() => setActiveCanvas('first')} className={activeCanvas === 'first' ? 'active' : ''}>
          1차 스캔
        </button>
        <button onClick={() => setActiveCanvas('second')} className={activeCanvas === 'second' ? 'active' : ''}>
          2차 스캔
        </button>
      </div>

      {/* Canvas 컨테이너 복원 */}
      <div className="canvases-container">
        <div className="canvas-wrapper">
          <h3>1차 스캔 캔버스</h3>
          <Canvas items={firstScanItems} setItems={setFirstScanItems} />
        </div>
        <div className="canvas-wrapper">
          <h3>2차 스캔 캔버스</h3>
          <Canvas items={secondScanItems} setItems={setSecondScanItems} />
        </div>
      </div>

      <div className="scan-controls">
        <button onClick={handleRunScan} disabled={isScanning || (firstScanItems.length === 0 && secondScanItems.length === 0)}>
          {isScanning ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>
      {/* <ScanResultsTable results={scanResults} isLoading={isScanning} /> */}
    </div>
  );
};

export default StrategyBuilderPage;
