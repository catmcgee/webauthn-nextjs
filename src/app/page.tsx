"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useSignupWithPasskey } from "@privy-io/react-auth";
import { useLoginWithPasskey } from "@privy-io/react-auth";

import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const { ready, authenticated, user, logout } = usePrivy();
  const [joke, setJoke] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const destination = "0x62f4F40043D67a12febe79E3868237FE11b87251"; // catmcgee.eth hehehe

  const fetchJoke = async () => {
    try {
      const res = await fetch(
        "https://official-joke-api.appspot.com/random_joke"
      );
      const data = await res.json();
      setJoke(`${data.setup} - ${data.punchline}`);
    } catch (err) {
      console.error(err);
      setJoke("Couldn't fetch a joke right now 🤷‍♀️");
    }
  };

  const fetchServerWallet = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/server-wallet", {
        headers: {
          "x-privy-user-id": user.id,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch server wallet");
      const json = (await res.json()) as { address: string };
      setWalletAddress(json.address);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const handleSend = async () => {
    if (!user) return;
    try {
      setSending(true);
      const res = await fetch("/api/gasless/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-privy-user-id": user.id,
        },
        body: JSON.stringify({ to: destination, amountEth: "0" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Tx failed");
      setTxHash(json.txHash);
    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    } finally {
      setSending(false);
    }
  };

  const { signupWithPasskey, state: signupState } = useSignupWithPasskey();
  const { loginWithPasskey, state: loginState } = useLoginWithPasskey();

  useEffect(() => {
    if (authenticated) {
      fetchJoke();
      fetchServerWallet();
    } else {
      setTxHash(null);
    }
  }, [authenticated, fetchServerWallet]);

  const loading =
    !ready ||
    (signupState.status !== "initial" && signupState.status !== "done") ||
    (loginState.status !== "initial" && loginState.status !== "done") ||
    false;

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

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (authenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-purple-100 text-emerald-900 p-4 relative">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {walletAddress && (
            <span title={walletAddress} className="text-xs font-mono px-2 py-1">
              {walletAddress}
            </span>
          )}
          <button
            onClick={() => {
              setTxHash(null);
              logout();
            }}
            disabled={loading}
            className={`flex items-center justify-center bg-red-200 text-red-800 font-medium px-3 py-1 rounded transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-300"
            }`}
          >
            {loading && <Spinner />}
            Logout
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center">
          Logged in and locked in ☘️ <br />
          (to the blockchain)
        </h1>

        <p className="mb-4 text-center">{joke}</p>

        <button
          onClick={handleSend}
          disabled={sending}
          className={`flex items-center justify-center bg-emerald-200 text-emerald-800 font-medium px-5 py-2 rounded transition-colors mb-4 ${
            sending ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-300"
          }`}
        >
          {sending && <Spinner />}
          Send Cat 0 ETH (gasless)
        </button>

        {txHash && (
          <>
            <p className="mb-2 text-sm break-all">
              Tx Hash:{" "}
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                {txHash}
              </a>
            </p>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
      <h1 className="text-2xl font-semibold mb-6">
        Does it feel like a wallet?
      </h1>
      <div className="space-x-4 flex">
        <button
          onClick={() => signupWithPasskey()}
          disabled={loading}
          className={`flex items-center justify-center bg-emerald-200 text-emerald-800 font-medium px-5 py-2 rounded transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-300"
          }`}
        >
          {loading && <Spinner />}
          Register
        </button>
        <button
          onClick={() => loginWithPasskey()}
          disabled={loading}
          className={`flex items-center justify-center bg-purple-200 text-purple-800 font-medium px-5 py-2 rounded transition-colors ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-300"
          }`}
        >
          {loading && <Spinner />}
          Login
        </button>
      </div>
    </main>
  );
}
