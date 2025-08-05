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

  /**
   * Fetch a random joke
   */
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

  /**
   * Initiates WebAuthn registration for the demo user ("Alice").
   * On success, automatically treats registration as a login
   */
  const register = async () => {
    try {
      const options = await fetch("/api/register/options").then((res) =>
        res.json()
      );
      const attestation = await startRegistration(options);
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "Alice", credential: attestation }),
      });
      const json = await res.json();
      if (json.verified) {
        await fetchJoke();
        setLoggedIn(true);
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  /**
   * Initiates WebAuthn authentication (login) for the demo user ("Alice")
   */
  const login = async () => {
    try {
      const options = await fetch("/api/authenticate/options").then((res) =>
        res.json()
      );
      const assertion = await startAuthentication(options);
      const res = await fetch("/api/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "Alice", credential: assertion }),
      });
      const json = await res.json();
      if (json.verified) {
        await fetchJoke();
        setLoggedIn(true);
      } else {
        alert("Login failed – did you register first?");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed – did you register first?");
    }
  };

  /**
   * Simple logout – just clears client-side session state
   */
  const logout = () => {
    setLoggedIn(false);
    setJoke("");
  };

  // Logged-in UI
  if (loggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-purple-100 text-emerald-900 p-4">
        <h1 className="text-2xl font-bold mb-4">Logged in and locked in 🗿</h1>
        <p className="mb-6 max-w-lg text-center">{joke}</p>
        <button
          onClick={logout}
          className="bg-red-200 hover:bg-red-300 text-red-800 font-medium px-5 py-2 rounded transition-colors"
        >
          Logout
        </button>
      </main>
    );
  }

  // Default (logged-out) UI
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
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
