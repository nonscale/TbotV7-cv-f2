import React from 'react';
import { ExpressionItem } from '../types';
import { useStrategyStore } from '../store/strategyStore';
import './Preview.css';

const generatePreviewString = (items: ExpressionItem[]) => {
    if (!items || items.length === 0) {
        return '...';
    }
    return items.map(item => item.label).join(' ');
};

const Preview: React.FC = () => {
    const logicVariables = useStrategyStore(state => state.logicVariables);
    const finalExpression = useStrategyStore(state => state.finalExpression);

    return (
        <div className="preview-container">
            <h4>전략 미리보기</h4>
            <div className="preview-box">
                {logicVariables.map(variable => (
                    <p key={variable.id}>
                        <strong>{variable.name} ({variable.timeframe}):</strong>{' '}
                        {generatePreviewString(variable.items)}
                    </p>
                ))}
                <hr />
                <p>
                    <strong>최종 조합:</strong> {generatePreviewString(finalExpression)}
                </p>
            </div>
        </div>
    );
};

export default Preview;
