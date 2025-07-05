import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ATSResumeBuilder } from './components/ATSResumeBuilder';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <ATSResumeBuilder />
      </div>
    </AuthProvider>
  );
};

export default App;