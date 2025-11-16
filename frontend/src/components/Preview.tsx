import React from 'react';
import { ExpressionItem } from '../types';
import './Preview.css';

interface PreviewProps {
  firstScanItems: ExpressionItem[];
  secondScanItems: ExpressionItem[];
}

const Preview: React.FC<PreviewProps> = ({ firstScanItems, secondScanItems }) => {
  const generatePreviewString = (items: ExpressionItem[]) => {
    if (items.length === 0) {
      return '표현식이 비어있습니다.';
    }
    return items.map(item => item.label).join(' ');
  };

  return (
    <div className="preview-container">
      <h4>미리보기</h4>
      <div className="preview-box">
        <p><strong>1차 스캔:</strong> {generatePreviewString(firstScanItems)}</p>
        <p><strong>2차 스캔:</strong> {generatePreviewString(secondScanItems)}</p>
      </div>
    </div>
  );
};

export default Preview;
