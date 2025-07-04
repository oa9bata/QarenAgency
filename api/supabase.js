
// api/config.js
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return Supabase config from environment variables
  res.status(200).json({
    supabaseUrl: process.env.VITE_SUPABASE_URL || null,
    supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || null
  });
}