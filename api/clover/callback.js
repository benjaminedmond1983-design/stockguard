export default async function handler(req, res) {
  const CLOVER_APP_ID = process.env.CLOVER_APP_ID;
  const CLOVER_APP_SECRET = process.env.CLOVER_APP_SECRET;
  const CLOVER_BASE = 'https://sandbox.dev.clover.com';
  const { code, merchant_id, client_id } = req.query;

  if (!merchant_id) return res.status(400).send('Missing merchant_id from Clover redirect');

  if (!code) {
    const redirectUri = encodeURIComponent('https://app.getstockguard.com/api/clover/callback');
    const authUrl = `${CLOVER_BASE}/oauth/authorize?client_id=${CLOVER_APP_ID}&merchant_id=${merchant_id}&redirect_uri=${redirectUri}`;
    return res.redirect(authUrl);
  }

  try {
    const tokenRes = await fetch(`${CLOVER_BASE}/oauth/token?client_id=${CLOVER_APP_ID}&client_secret=${CLOVER_APP_SECRET}&code=${code}`);
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ error: 'Failed to get access token', details: tokenData });
    return res.redirect(`https://app.getstockguard.com?clover_token=${tokenData.access_token}&clover_mid=${merchant_id}&clover_connected=1`);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
