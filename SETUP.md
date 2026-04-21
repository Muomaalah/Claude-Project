# Backend setup — 15 minutes, no servers

This project uses **Supabase** as the backend. Supabase gives you a Postgres
database, user login, and file storage through one dashboard. You don't run
any server yourself. The free tier is enough for development.

When you finish the steps below, the existing HTML prototype will be able to
sign users in with Microsoft 365, read/write applications from the database,
and upload documents.

---

## 1. Create the Supabase project

1. Go to https://supabase.com and sign up (GitHub login is easiest).
2. Click **New project**. Fill in:
   - **Name**: `gwcl-registry`
   - **Database password**: generate one and save it somewhere safe
   - **Region**: pick the one closest to Ghana (usually **West Europe (London)**
     or **Africa (Cape Town)** if available)
3. Wait ~2 minutes for the project to provision.

## 2. Create the tables

1. In your new project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `db/schema.sql` from this repo, copy the whole file, paste it into the
   editor, and click **Run**. You should see "Success. No rows returned."
4. Optional: in the same editor, paste `db/seed.sql` and click **Run** to get
   a handful of sample applications to browse.

## 3. Create a storage bucket for uploaded documents

1. Open **Storage** in the sidebar.
2. Click **New bucket**, name it `docs`, leave it **Private**, and click
   **Save**.

## 4. Turn on Microsoft login

1. Open **Authentication → Providers** and expand **Azure (Microsoft)**.
2. Follow Supabase's linked "how to configure" guide. The short version:
   - In https://portal.azure.com → **Entra ID → App registrations → New**
   - Redirect URI: copy the callback URL Supabase shows you
   - Create a client secret, copy the **Value**
   - Back in Supabase, paste the **Application (client) ID**, **Secret value**,
     and your **Tenant ID**
3. Click **Save**.

> If you don't have an Azure tenant yet, skip this step for now and use
> **Email magic links** (already enabled by default) while you test.

## 5. Copy your keys into the app

1. In Supabase, open **Settings → API**.
2. Copy these two values:
   - **Project URL**
   - **anon public** key (the long `eyJhbGci...` string — *not* the service_role
     key; never put that in the browser)
3. In this repo, copy `lib/config.example.js` to `lib/config.js` and fill in
   both values. `config.js` is gitignored so your keys stay out of git.

## 6. Try it

Serve the site locally:

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. In the browser devtools console you should see:

```
[gwcl] Supabase client ready.
```

If you see `running in mock mode` instead, `lib/config.js` is missing or the
URL/key placeholders aren't filled in.

---

## What's in this repo

```
db/
  schema.sql        Postgres schema — tables, enums, RLS policies
  seed.sql          Sample rows so the UI has something to show
lib/
  config.example.js Template for lib/config.js (your keys)
  supabase.js       Client + small helper API (listApplications, etc.)
```

## Next steps I can help with

- Wire the Sign-in screen to `gwclApi.signInWithAzure()`
- Replace `SEED_APPS` in `src/mockdata.jsx` with `gwclApi.listApplications()`
- Hook up the 8-step wizard to save drafts to the database
- Wire document uploads in the wizard to `gwclApi.uploadDoc()`
- Add an Edge Function that emails 90/60/30-day expiry reminders

Just say the word and I'll do them one at a time.
