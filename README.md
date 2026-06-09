# Alokjatra

This project is now prepared to run as a static frontend on Netlify with Supabase for auth and report storage.

## What’s included

- `index.html`, `style.css`, and `app.js` for the static UI
- `config.js` placeholder for Supabase credentials
- `netlify.toml` for Netlify deployment and SPA routing
- Login / signup / logout flows
- Admin permission gating via Supabase roles
- Report create/update/delete integration with Supabase

## Set up Supabase

1. Create a free Supabase project at `https://app.supabase.com`.
2. Create a table named `reports` with these columns:
   - `id` (text, primary key)
   - `category` (text)
   - `location` (text)
   - `details` (text)
   - `status` (text)
   - `phone` (text)
   - `mediaSrc` (text)
3. In the Supabase dashboard, enable Email auth under Authentication.
4. In the Supabase dashboard, assign admin role(s) to trusted users:
   - open the user record in Auth → Users
   - add `admin` inside `app_metadata.roles`

## Configure the frontend

1. Open `config.js`.
2. Fill in your Supabase values:

```js
window.SUPABASE_URL = "https://your-project.supabase.co";
window.SUPABASE_ANON_KEY = "your-anon-public-key";
```

## Deploy to Netlify

1. Push the repository to GitHub.
2. Sign in at `https://app.netlify.com`.
3. Create a new site from Git.
4. Choose your GitHub repo.
5. Set the build command to blank and the publish directory to `.`.
6. Deploy.

## How it works

- The app is static and hosted by Netlify.
- Supabase handles authentication and report storage.
- Admin access is controlled by Supabase user roles.
- The `page-admin` area is visible only when the logged-in user has the admin role.

## Notes

- If you do not want Supabase, the app still falls back to the local browser state.
- For true production, configure Supabase policies and storage security rules.
