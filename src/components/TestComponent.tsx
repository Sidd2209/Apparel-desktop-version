import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        ✅ React is Working!
      </h1>
      <p className="text-gray-600 mb-4">
        If you can see this, React is rendering properly.
      </p>
      <div className="bg-green-100 p-4 rounded">
        <p className="text-green-800">
          <strong>Status:</strong> App is loading correctly
        </p>
        <p className="text-green-800">
          <strong>Time:</strong> {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default TestComponent; 