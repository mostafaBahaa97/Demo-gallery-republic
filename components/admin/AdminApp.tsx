"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";
import { Dashboard } from "./Dashboard";

const TOKEN_KEY = "gr_admin_token";

export function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(sessionStorage.getItem(TOKEN_KEY));
    setReady(true);
  }, []);

  const handleLogin = (t: string) => {
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!ready) return null;

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} onAuthError={handleLogout} />
  ) : (
    <LoginForm onLogin={handleLogin} />
  );
}
