import React from 'react';

const Palette: React.FC = () => {
  return (
    <div
      style={{
        border: '2px solid red',
        padding: '20px',
        margin: '20px 0'
      }}
    >
      <h3 style={{ color: 'white' }}>Palette Test Component</h3>
      <p style={{ color: 'white' }}>If you see this red box, the Palette component file itself is loading correctly.</p>
    </div>
  );
};

export default Palette;
