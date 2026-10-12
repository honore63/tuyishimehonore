// supabaseClient.js
// Initialize Supabase client via CDN (UMD version must be loaded before this script)

const SUPABASE_URL = 'https://lupmpmexnlnfscxxgjaa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zBxWvh18Ou3XQ1A7VUIxug_pZ32t1uK';

// The CDN script provides a global `supabase` object with a `createClient` method.
// Create the client and expose it as `window.supabase` for the rest of the app.
if (typeof supabase !== 'undefined') {
  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabase = client;
} else {
  console.error('Supabase library not loaded. Ensure the UMD script is included before this file.');
}

