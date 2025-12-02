'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { UserRole } from '@/types';

const LoginView: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      
     await signInWithEmailAndPassword(auth, email, password);

        // Simulación de roles basados en el correo electrónico
      if (email.includes("admin")) {
        onLogin("admin");
      } else {
        onLogin("monitoreo");
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Error desconocido");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-800">

        <div className="text-center mb-8">
          <h1 className="text-3xl text-white font-bold mb-2">Iniciar Sesión</h1>
          <p className="text-slate-400">Acceso Admin / Monitoreo</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMsg && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
