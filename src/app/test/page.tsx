'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState('Carregando...');
  const [convexStatus, setConvexStatus] = useState('Testando...');

  useEffect(() => {
    setStatus('✅ React funcionando!');
    
    // Teste básico do Convex
    try {
      if (typeof window !== 'undefined') {
        setConvexStatus('✅ Window disponível');
      }
    } catch (error) {
      setConvexStatus(`❌ Erro: ${error}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🔧 Página de Teste v3.0 - FORÇANDO BASE DEV
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-800">Status React:</h2>
            <p className="text-blue-600">{status}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-800">Status Convex:</h2>
            <p className="text-green-600">{convexStatus}</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h2 className="font-semibold text-purple-800">Informações:</h2>
            <ul className="text-purple-600 text-sm space-y-1">
              <li>• Timestamp: {new Date().toLocaleString()}</li>
              <li>• User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</li>
              <li>• URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
            </ul>
          </div>
          
          <div className="text-center">
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Voltar ao Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
