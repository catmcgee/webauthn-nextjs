# Passkey Demo (Nextjs + SimpleWebAuthn)

A tiny Nextjs app that lets you **register** and **sign-in** with a passkey.  
This is the code used in the WebAuthn starter guide you can find [here](https://hashnode.com/preview/6892556c26ce3f9de6c08fc1)

![App homescreen](public/homescreen.png)

---

## What it does

1. Type your username
1. Click **Register** → WebAuthn registration ceremony
1. Click **Login** → authentication ceremony

Learn more about WebAuthn in the [starter guide](https://hashnode.com/preview/6892556c26ce3f9de6c08fc1).

## Prerequisites

- **Node 20+**
- A modern browser that supports passkeys (Chrome, Edge, Safari, Firefox ≥ 120)

---

## How to run it

Clone this repo

```bash
git clone https://github.com/catmcgee/webauthn-nextjs.git
cd webauth-nextjs
```

Install dependencies

```bash
bun install
```

I like bun :) but you can also use `npm install` or `yarn install` or `pnpm install`.

# 2. Configure .env

```bash
cp .env.local.example .env.local
```

Defaults are fine for localhost

# 3. Run dev server

```bash
bun dev
```

Again you can also use `npm install` or `yarn install` or `pnpm install`.
