import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary', text = 'Loading...' }) => {
  const spinnerSize = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-${color} ${spinnerSize[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-center text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
