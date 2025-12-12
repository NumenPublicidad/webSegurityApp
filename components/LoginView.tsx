'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { UserRole } from '@/types';
// Importamos iconos adicionales para mejorar la UI
import { Shield, Loader2, Mail, Lock } from 'lucide-react';

const LoginView: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Autenticación con Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // --- NOTA IMPORTANTE ---
      // En una app real, el "rol" debe venir de la base de datos (Firestore)
      // asociado al UID del usuario, NO depender del email.
      // Mantenemos esta lógica TEMPORALMENTE solo porque así estaba en tu código original.
      // Deberías corregir esto en el futuro leyendo el documento del usuario desde Firestore aquí.
      if (email.toLowerCase().includes("admin")) {
        onLogin("admin");
      } else {
        onLogin("monitoreo");
      }
      // -----------------------

    } catch (error: unknown) {
      console.error("Login error:", error);
      // Mensajes de error más amigables
      if (error instanceof Error) {
        if (error.message.includes("auth/invalid-email")) setErrorMsg("El correo electrónico no es válido.");
        else if (error.message.includes("auth/user-not-found")) setErrorMsg("Usuario no encontrado.");
        else if (error.message.includes("auth/wrong-password")) setErrorMsg("Contraseña incorrecta.");
        else if (error.message.includes("auth/too-many-requests")) setErrorMsg("Demasiados intentos fallidos. Intente más tarde.");
        else setErrorMsg("Error al iniciar sesión. Verifique sus credenciales.");
      } else {
        setErrorMsg("Ocurrió un error inesperado.");
      }
    }

    setLoading(false);
  };

  // Permitir login con tecla Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    // Fondo claro consistente con el resto de la app
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      
      {/* Tarjeta blanca con sombra y bordes suaves */}
      <div className="bg-white p-8 rounded-2xl w-full max-w-md border border-slate-200 shadow-xl">

        {/* Header con branding consistente (Icono Escudo) */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg shadow-slate-200 mb-4 animate-in zoom-in delay-100 duration-500">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl text-slate-900 font-bold mb-2">Panel de Seguridad</h1>
          <p className="text-slate-500 text-sm">Acceso restringido a personal autorizado</p>
        </div>

        <div className="space-y-5" onKeyDown={handleKeyDown}>
          
          {/* Input de Email con icono */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Correo electrónico corporativo"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Input de Password con icono */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Mensaje de Error */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Botón Principal */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            // Usamos bg-slate-900 para coincidir con los elementos principales de la UI, con un efecto hover sutil
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando credenciales...
              </>
            ) : (
              "Ingresar al Sistema"
            )}
          </button>
        </div>
      </div>
      
      <p className="text-slate-400 text-xs mt-8">© {new Date().getFullYear()} Plataforma de Monitoreo Seguro. v1.2</p>
    </div>
  );
};

export default LoginView;