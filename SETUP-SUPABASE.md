# GameZy backend setup (Supabase)

This adds a real database + login system to your site. Free tier covers thousands of users.
Follow these steps **once**, then everything (admin edits, user reviews, favourites, comments) goes live for every visitor.

---

## 1. Create a Supabase project (5 min)

1. Go to https://supabase.com and click **Start your project** (sign up with GitHub).
2. Click **New Project**.
3. Name it `gamezy`. Choose a strong DB password (save it). Pick the closest region.
4. Wait ~2 minutes for it to provision.

Once it's ready, open **Project Settings → API**. You'll see:
- **Project URL** (e.g. `https://abcdefgh.supabase.co`)
- **Anon public key** (a long string starting with `eyJ...`)

Keep this page open — you'll paste these into the project in step 4.

---

## 2. Run the SQL schema (2 min)

In your Supabase dashboard, open **SQL Editor** (left sidebar) → **New query**.
Paste the entire block below and click **Run**:

```sql
-- ============ TABLES ============
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

create table games (
  id bigint primary key,
  slug text unique not null,
  data jsonb not null,
  position int default 0,
  updated_at timestamptz default now()
);

create table categories (
  key text primary key,
  data jsonb not null,
  position int default 0
);

create table admins (
  user_id uuid references auth.users on delete cascade primary key
);

create table reviews (
  id bigserial primary key,
  game_slug text not null,
  user_id uuid references auth.users on delete cascade not null,
  stars int not null check (stars between 1 and 5),
  text text not null,
  created_at timestamptz default now(),
  unique(game_slug, user_id)
);

create table favourites (
  user_id uuid references auth.users on delete cascade not null,
  game_slug text not null,
  created_at timestamptz default now(),
  primary key (user_id, game_slug)
);

create table comments (
  id bigserial primary key,
  review_id bigint references reviews on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
alter table profiles    enable row level security;
alter table games       enable row level security;
alter table categories  enable row level security;
alter table reviews     enable row level security;
alter table favourites  enable row level security;
alter table comments    enable row level security;

-- Public reads
create policy "Public read profiles"  on profiles   for select using (true);
create policy "Public read games"     on games      for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read reviews"   on reviews    for select using (true);
create policy "Public read comments"  on comments   for select using (true);

-- Profile self-edit
create policy "Insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Update own profile" on profiles for update using (auth.uid() = id);

-- Reviews / comments by logged-in users
create policy "Insert own review"  on reviews  for insert with check (auth.uid() = user_id);
create policy "Update own review"  on reviews  for update using (auth.uid() = user_id);
create policy "Delete own review"  on reviews  for delete using (auth.uid() = user_id);

create policy "Insert own comment" on comments for insert with check (auth.uid() = user_id);
create policy "Update own comment" on comments for update using (auth.uid() = user_id);
create policy "Delete own comment" on comments for delete using (auth.uid() = user_id);

-- Favourites self-only
create policy "Read own favourites"  on favourites for select using (auth.uid() = user_id);
create policy "Add own favourite"    on favourites for insert with check (auth.uid() = user_id);
create policy "Remove own favourite" on favourites for delete using (auth.uid() = user_id);

-- Games / categories: admin-only writes
create policy "Admin write games" on games for all
  using (exists (select 1 from admins where user_id = auth.uid()))
  with check (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admin write categories" on categories for all
  using (exists (select 1 from admins where user_id = auth.uid()))
  with check (exists (select 1 from admins where user_id = auth.uid()));

-- Auto-create a profile row when someone signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles(id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

You should see "Success. No rows returned."

---

## 3. Make yourself an admin (1 min)

After you sign up on the live site for the first time (step 6), come back to Supabase:

1. **Authentication → Users** → find your row, copy your `User UID`.
2. **SQL Editor → New query** → run:

```sql
insert into admins(user_id) values ('PASTE-YOUR-UUID-HERE');
```

You're now the admin. The `/admin` page will also use this for "save live to everyone".

---

## 4. Wire the keys into the project (1 min)

In your project folder on your computer:

1. Open `.env.example`, copy it to a new file named `.env.local` in the project root.
2. Paste your Project URL and Anon Key:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

3. **Important:** `.env.local` is gitignored. To make the live site work too, add both vars in your **Vercel project settings → Environment Variables** (or Netlify equivalent). Redeploy after adding them.

---

## 5. Enable social logins (5 min, optional but you asked for them)

In Supabase: **Authentication → Providers**.

### Google
1. Toggle Google **On**.
2. Supabase shows a **Callback URL** — copy it.
3. Go to https://console.cloud.google.com → **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**. Add the Supabase callback URL under **Authorized redirect URIs**.
5. Copy the **Client ID** and **Client Secret** back into Supabase's Google provider settings → **Save**.

### Discord
1. Toggle Discord **On** in Supabase. Copy the Callback URL.
2. Go to https://discord.com/developers/applications → **New Application** → name it "GameZy".
3. Sidebar → **OAuth2 → General**. Add the Supabase callback URL under **Redirects**.
4. Copy **Client ID** and **Client Secret** into Supabase's Discord provider → **Save**.

### Email
Already on by default. Supabase sends verification emails automatically.

---

## 6. Try it locally

```bash
npm install
npm run dev
```

Open http://localhost:5173, click **Sign in**, create an account.
Then go back to Supabase **Authentication → Users**, copy your UUID, and run the admin INSERT from step 3.

Reload `/admin` — you can now save games to the database and they appear instantly for every visitor.

---

## 7. Deploy

After you push to GitHub:

- **Vercel** (easiest): import the repo at https://vercel.com/new. Add the two env vars in project settings. Done.
- **Netlify**: connect repo, add env vars in **Site settings → Environment variables**.

Both rebuild automatically on every `git push`.

---

## Troubleshooting

- **"Invalid API key"** — env vars not set, or you didn't restart `npm run dev` after creating `.env.local`.
- **"new row violates RLS policy"** when posting a review — you're not signed in.
- **OAuth redirect mismatch** — copy the exact callback URL from Supabase into Google/Discord.
- **Admin edits don't save to DB** — you forgot step 3 (insert into admins).
