import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import Palette from '../components/Palette';
import Canvas from '../components/Canvas';
import Preview from '../components/Preview';
import ScanResultsTable from '../components/ScanResultsTable';
import { ExpressionItem, ScanResult, Strategy, LogicVariable } from '../types';
import { useStrategyStore } from '../store/strategyStore';
import './StrategyBuilderPage.css';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// --- AST Builder and Flattener ---
const precedence: { [key: string]: number } = { 'OR': 1, 'AND': 2, '>': 3, '>=': 3, '<': 3, '<=': 3, '==': 3, '!=': 3, '+': 4, '-': 4, '*': 5, '/': 5 };

const toPostfix = (items: ExpressionItem[]): ExpressionItem[] => {
    const output: ExpressionItem[] = [];
    const operators: ExpressionItem[] = [];
    for (const item of items) {
        if (item.type !== 'operator' && item.label !== '(' && item.label !== ')') { output.push(item); }
        else if (item.type === 'operator') {
            while (operators.length > 0 && operators[operators.length - 1].label !== '(' && precedence[operators[operators.length - 1].label] >= precedence[item.label]) { output.push(operators.pop()!); }
            operators.push(item);
        } else if (item.label === '(') { operators.push(item); }
        else if (item.label === ')') {
            while (operators.length > 0 && operators[operators.length - 1].label !== '(') { output.push(operators.pop()!); }
            operators.pop();
        }
    }
    while (operators.length > 0) { output.push(operators.pop()!); }
    return output;
};

const buildAst = (postfix: ExpressionItem[]): any => {
    const stack: any[] = [];
    for (const item of postfix) {
        if (item.type === 'operator') {
            const right = stack.pop();
            const left = stack.pop();
            stack.push({ type: 'expression', operator: item.label, operands: [left, right] });
        } else { stack.push(item); }
    }
    return stack.pop() || null;
};

const buildExpressionPayload = (items: ExpressionItem[]): any => {
    if (!items || items.length === 0) return null;
    return buildAst(toPostfix(items));
};

const flattenAst = (node: any): ExpressionItem[] => {
    if (!node) return [];
    if (node.type !== 'expression') return [node as ExpressionItem];
    const left = flattenAst(node.operands[0]);
    const operator = { id: node.operator, type: 'operator', label: node.operator };
    const right = flattenAst(node.operands[1]);
    const parentPrecedence = precedence[node.operator] || 0;
    const leftNeedsParens = node.operands[0].type === 'expression' && precedence[node.operands[0].operator] < parentPrecedence;
    const rightNeedsParens = node.operands[1].type === 'expression' && precedence[node.operands[1].operator] <= parentPrecedence;
    return [
        ...(leftNeedsParens ? [{ id: '(', type: 'operator', label: '(' }] : []), ...left, ...(leftNeedsParens ? [{ id: ')', type: 'operator', label: ')' }] : []),
        operator,
        ...(rightNeedsParens ? [{ id: '(', type: 'operator', label: '(' }] : []), ...right, ...(rightNeedsParens ? [{ id: ')', type: 'operator', label: ')' }] : []),
    ];
};

const StrategyBuilderPage: React.FC = () => {
    const logicVariables = useStrategyStore(state => state.logicVariables);
    const finalExpression = useStrategyStore(state => state.finalExpression);
    const activeCanvas = useStrategyStore(state => state.activeCanvas);
    const isScanning = useStrategyStore(state => state.isScanning);
    const scanResults = useStrategyStore(state => state.scanResults);
    const { loadStrategyState, clearStrategyState, addLogicVariable, removeLogicVariable, updateLogicVariable, setActiveCanvas, setCanvasItems, addCanvasItem, setScanResults, setIsScanning } = useStrategyStore(state => state.actions);

    const [currentStrategy, setCurrentStrategy] = useState<Partial<Strategy>>({ name: '', broker: 'upbit', market: 'KRW' });
    const [savedStrategies, setSavedStrategies] = useState<Strategy[]>([]);
    const [scanTarget, setScanTarget] = useState('market');

    const fetchStrategies = useCallback(async () => {
        try {
            const response = await axios.get<Strategy[]>(`${API_BASE_URL}/strategies`);
            setSavedStrategies(response.data);
        } catch (error) { console.error("전략 목록 로딩 실패:", error); }
    }, []);

    useEffect(() => { fetchStrategies(); }, [fetchStrategies]);

    const activeCanvasItems = activeCanvas === 'final' ? finalExpression : (logicVariables.find(v => v.id === activeCanvas)?.items || []);

    const handleSaveStrategy = async () => {
        if (!currentStrategy.name) { alert('전략 이름을 입력해주세요.'); return; }
        const payload: Partial<Strategy> = { ...currentStrategy, logic_variables: logicVariables.map(v => ({...v, items: buildExpressionPayload(v.items)})), final_expression: buildExpressionPayload(finalExpression) };
        try {
            const response = currentStrategy.id ? await axios.put(`${API_BASE_URL}/strategies/${currentStrategy.id}`, payload) : await axios.post(`${API_BASE_URL}/strategies`, payload);
            alert(`'${response.data.name}' 전략이 저장되었습니다.`);
            await fetchStrategies();
            setCurrentStrategy(response.data);
        } catch (error) { console.error("전략 저장 실패:", error); alert("전략 저장에 실패했습니다."); }
    };

    const handleSaveAsStrategy = async () => {
        const newName = prompt("새로운 전략의 이름을 입력해주세요:", `${currentStrategy.name}_copy`);
        if (!newName) return;
        const payload: Partial<Strategy> = { ...currentStrategy, id: undefined, name: newName, logic_variables: logicVariables.map(v => ({...v, items: buildExpressionPayload(v.items)})), final_expression: buildExpressionPayload(finalExpression) };
        try {
            const response = await axios.post(`${API_BASE_URL}/strategies`, payload);
            alert(`'${response.data.name}' 전략으로 새로 저장되었습니다.`);
            await fetchStrategies();
            setCurrentStrategy(response.data);
        } catch (error) { console.error("전략 '다른 이름으로 저장' 실패:", error); alert("전략 '다른 이름으로 저장'에 실패했습니다."); }
    };

    const handleLoadStrategy = (strategyId: string) => {
        const id = parseInt(strategyId, 10);
        if (isNaN(id)) { setCurrentStrategy({ name: '', broker: 'upbit', market: 'KRW' }); clearStrategyState(); return; }
        const strategy = savedStrategies.find(s => s.id === id);
        if (strategy) {
            setCurrentStrategy(strategy);
            const logicVarsWithFlatItems = (strategy.logic_variables || []).map(v => ({ ...v, items: flattenAst(v.items) }));
            const finalExprFlat = flattenAst(strategy.final_expression);
            loadStrategyState(logicVarsWithFlatItems, finalExprFlat);
        }
    };

    const handleDeleteStrategy = async () => {
        if (!currentStrategy.id) { alert("삭제할 전략이 선택되지 않았습니다."); return; }
        if (confirm(`'${currentStrategy.name}' 전략을 정말 삭제하시겠습니까?`)) {
            try {
                await axios.delete(`${API_BASE_URL}/strategies/${currentStrategy.id}`);
                alert("전략이 삭제되었습니다.");
                await fetchStrategies();
                handleLoadStrategy('');
            } catch (error) { console.error("전략 삭제 실패:", error); alert("전략 삭제에 실패했습니다."); }
        }
    };

    const handleRunScan = async () => {
        setIsScanning(true);
        setScanResults([]);
        try {
            const response = await axios.post(`${API_BASE_URL}/scans/run-dynamic`, {
                scan_target: scanTarget,
                strategy: { id: currentStrategy.id || `dynamic-strategy-${Date.now()}`, name: currentStrategy.name || 'Untitled Strategy', broker: currentStrategy.broker, market: currentStrategy.market, logic_variables: logicVariables.map(v => ({...v, items: buildExpressionPayload(v.items)})), final_expression: buildExpressionPayload(finalExpression) }
            });
            setScanResults(response.data.results || []);
        } catch (error) { console.error("스캔 실행 중 오류 발생:", error); alert("스캔 실행에 실패했습니다."); setScanResults([]); } finally { setIsScanning(false); }
    };

    const renderActiveCanvas = () => {
        const activeVar = logicVariables.find(v => v.id === activeCanvas);
        return (
            <div className="canvas-wrapper">
                {activeVar ? (
                    <div>
                        <input type="text" value={activeVar.name} onChange={(e) => updateLogicVariable(activeVar.id, { name: e.target.value })} className="variable-name-input" />
                        <select value={activeVar.timeframe} onChange={(e) => updateLogicVariable(activeVar.id, { timeframe: e.target.value })}>
                            <option value="1d">일봉</option> <option value="1w">주봉</option> <option value="1M">월봉</option> <option value="240m">4시간봉</option> <option value="60m">1시간봉</option> <option value="30m">30분봉</option> <option value="10m">10분봉</option>
                        </select>
                        <button onClick={() => removeLogicVariable(activeVar.id)} className="delete-variable-btn">x</button>
                    </div>
                ) : ( <h3>최종 캔버스</h3> )}
                <Canvas items={activeCanvasItems} setItems={setCanvasItems} />
            </div>
        );
    };

    return (
        <div className="strategy-builder-page">
            <h2>Strategy Builder</h2>
            <div className="strategy-management-controls">
                <input type="text" value={currentStrategy?.name || ''} onChange={(e) => setCurrentStrategy(prev => ({ ...prev, name: e.target.value }))} placeholder="전략 이름 입력" />
                <select value={currentStrategy?.broker || 'upbit'} onChange={(e) => setCurrentStrategy(prev => ({ ...prev, broker: e.target.value }))}> <option value="upbit">Upbit</option> <option value="kis">KIS</option> </select>
                <select value={currentStrategy?.market || 'KRW'} onChange={(e) => setCurrentStrategy(prev => ({ ...prev, market: e.target.value }))}> <option value="KRW">KRW</option> <option value="USD">USD</option> </select>
                <select onChange={(e) => handleLoadStrategy(e.target.value)} value={currentStrategy?.id || ''}>
                    <option value="">새 전략</option>
                    {savedStrategies.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
                <button onClick={handleSaveStrategy}>Save</button>
                <button onClick={handleSaveAsStrategy}>Save As</button>
                <button onClick={handleDeleteStrategy} disabled={!currentStrategy?.id}>Delete</button>
            </div>
            <Palette onItemAdd={addCanvasItem} />
            <Preview />
            <div className="canvas-tabs">
                {logicVariables.map(v => (<button key={v.id} onClick={() => setActiveCanvas(v.id)} className={activeCanvas === v.id ? 'active' : ''}>{v.name}</button>))}
                <button onClick={addLogicVariable} className="add-variable-btn">+</button>
                <button onClick={() => setActiveCanvas('final')} className={activeCanvas === 'final' ? 'active' : ''}>최종 조합</button>
            </div>
            <div className="canvases-container">{renderActiveCanvas()}</div>
            <div className="scan-controls">
                <select value={scanTarget} onChange={(e) => setScanTarget(e.target.value)}>
                    <option value="market">전체 시장</option> <option value="watchlist_1">나의 주도주</option> <option value="watchlist_2">장기 투자 종목</option>
                </select>
                <button onClick={handleRunScan} disabled={isScanning || finalExpression.length === 0}>{isScanning ? 'Scanning...' : 'Run Scan'}</button>
            </div>
            <ScanResultsTable results={scanResults} isLoading={isScanning} />
        </div>
    );
};

export default StrategyBuilderPage;
