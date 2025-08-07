"use client";
import { useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

/**
 * Homepage component
 *  - Passkey registration & authentication
 *  - A simple "session" held in client state
 *  - Displays a random joke once logged in :)
 */
export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [joke, setJoke] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<
    "register" | "login" | "logout" | null
  >(null);

  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      ></path>
    </svg>
  );

  const fetchJoke = async () => {
    try {
      const res = await fetch(
        "https://official-joke-api.appspot.com/random_joke"
      );
      const data = await res.json();
      setJoke(`${data.setup} — ${data.punchline}`);
    } catch (err) {
      console.error(err);
      setJoke("Couldn't fetch a joke right now 🤷‍♀️");
    }
  };

  const register = async () => {
    if (!username) {
      setError("Please enter a username");
      return;
    }
    if (loading) return;

    setLoading("register");
    setError("");
    try {
      const options = await fetch(
        `/api/register/options?u=${encodeURIComponent(username)}`
      ).then((res) => res.json());
      const attestation = await startRegistration(options);
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, credential: attestation }),
      });
      const json = await res.json();
      if (json.verified) {
        await fetchJoke();
        setLoggedIn(true);
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Registration failed");
    } finally {
      setLoading(null);
    }
  };

  const login = async () => {
    if (!username) {
      setError("Please enter a username");
      return;
    }
    if (loading) return;

    setLoading("login");
    setError("");
    try {
      const options = await fetch(
        `/api/authenticate/options?u=${encodeURIComponent(username)}`
      ).then((res) => res.json());
      const assertion = await startAuthentication(options);
      const res = await fetch("/api/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, credential: assertion }),
      });
      const json = await res.json();
      if (json.verified) {
        await fetchJoke();
        setLoggedIn(true);
      } else {
        setError("Login failed – did you register first?");
      }
    } catch (err) {
      console.error(err);
      setError(
        (err as Error).message || "Login failed – did you register first?"
      );
    } finally {
      setLoading(null);
    }
  };

  const logout = async () => {
    if (loading) return;
    setLoading("logout");
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLoggedIn(false);
      setJoke("");
      setUsername("");
      setError("");
    } finally {
      setLoading(null);
    }
  };

  if (loggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-purple-100 text-emerald-900 p-4">
        <h1 className="text-2xl font-bold mb-4">Logged in and locked in ☘️</h1>
        {error && (
          <p className="text-red-600 mb-4 max-w-lg text-center">{error}</p>
        )}
        <p className="mb-6 max-w-lg text-center">{joke}</p>
        <button
          onClick={logout}
          disabled={loading === "logout"}
          className={`flex items-center justify-center bg-red-200 text-red-800 font-medium px-5 py-2 rounded transition-colors ${
            loading === "logout"
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-red-300"
          }`}
        >
          {loading === "logout" && <Spinner />}
          Logout
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
      <h1 className="text-2xl font-semibold mb-6">Passkeys with WebAuthn</h1>
      {error && (
        <p className="text-red-600 mb-4 max-w-xs text-center">{error}</p>
      )}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="mb-6 px-3 py-2 border border-gray-300 rounded w-60 text-center"
        disabled={loading !== null}
      />
      <div className="space-x-4 flex">
        <button
          onClick={register}
          disabled={loading !== null}
          className={`flex items-center justify-center bg-emerald-200 text-emerald-800 font-medium px-5 py-2 rounded transition-colors ${
            loading !== null
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-emerald-300"
          }`}
        >
          {loading === "register" && <Spinner />}
          Register
        </button>
        <button
          onClick={login}
          disabled={loading !== null}
          className={`flex items-center justify-center bg-purple-200 text-purple-800 font-medium px-5 py-2 rounded transition-colors ${
            loading !== null
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-purple-300"
          }`}
        >
          {loading === "login" && <Spinner />}
          Login
        </button>
      </div>
    </main>
  );
}
