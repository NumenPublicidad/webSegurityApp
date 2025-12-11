'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from '@/firebase/config';     
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const realRole = userData.role || 'user';
        if (userData.status === 'disabled') {
          throw new Error("Tu cuenta está deshabilitada. Contacta al soporte.");
        }

        onLogin(realRole as UserRole);
      } else {
        setErrorMsg("Usuario no encontrado en la base de datos.");
      }

} catch (error: unknown) { 
      console.error(error);
      
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Error desconocido al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-white font-bold mb-2">Iniciar Sesión</h1>
          <p className="text-slate-400">Sistema de Seguridad</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          {errorMsg && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg">
              <p className="text-red-200 text-sm text-center">{errorMsg}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Ingresar al Sistema"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;