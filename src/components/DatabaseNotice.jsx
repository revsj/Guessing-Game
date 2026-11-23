const DEV_MESSAGE =
  "The game can't reach its database. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set, then restart the dev server."

const PROD_MESSAGE =
  "The game can't reach its database right now. Please try again later."

/**
 * Shown when the Supabase env vars are missing. Dev gets the fix-it message;
 * production gets a plain apology so setup details never reach players.
 */
export default function DatabaseNotice({ id, className = '' }) {
  return (
    <p id={id} className={`text-coral ${className}`}>
      {import.meta.env.DEV ? DEV_MESSAGE : PROD_MESSAGE}
    </p>
  )
}
