'use client';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export default function Home() {
  const register = async () => {
    const options = await fetch('/api/register/options').then((res) => res.json());
    const attestation = await startRegistration(options);
    const res = await fetch('/api/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Alice', credential: attestation }),
    });
    const json = await res.json();
    alert(json.verified ? 'Registration successful' : 'Registration failed');
  };

  const login = async () => {
    const options = await fetch('/api/authenticate/options').then((res) => res.json());
    const assertion = await startAuthentication(options);
    const res = await fetch('/api/authenticate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Alice', credential: assertion }),
    });
    const json = await res.json();
    alert(json.verified ? 'Login successful' : 'Login failed - did you register first?');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start pt-25 bg-gray-50 text-gray-800 p-4">
      <h1 className="text-2xl font-semibold mb-6">Passkeys with WebAuthn</h1>
      <div className="space-x-4">
        <button
          onClick={register}
          className="bg-emerald-200 hover:bg-emerald-300 text-emerald-800 font-medium px-5 py-2 rounded transition-colors"
        >
          Register
        </button>
        <button
          onClick={login}
          className="bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium px-5 py-2 rounded transition-colors"
        >
          Login
        </button>
      </div>
    </main>
  );
}
