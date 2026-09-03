'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Logged in successfully!');
    router.push('/');
  };

  return (
    <div className="py-12 px-4 max-w-sm mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="relative w-12 h-12 mx-auto">
          <Image src="/ignou-logo.png" alt="IGNOU Logo" fill className="object-contain" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Student Portal Login</h1>
        <p className="text-xs text-slate-500">Enter your credentials to access your portal</p>
      </div>

      <div className="bg-white border border-slate-300 rounded p-6 shadow-xs space-y-4">
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full input-field"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 btn-primary text-xs font-bold uppercase tracking-wider mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
