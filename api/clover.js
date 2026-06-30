export default async function handler(req, res) {
  const CLOVER_APP_ID = process.env.CLOVER_APP_ID;
  const CLOVER_APP_SECRET = process.env.CLOVER_APP_SECRET;
  const CLOVER_BASE = 'https://sandbox.dev.clover.com';
  const { action } = req.query;

  if (action === 'callback') {
    const { code, merchant_id } = req.query;
    if (!code || !merchant_id) return res.status(400).json({ error: 'Missing code or merchant_id' });
    try {
      const tokenRes = await fetch(`${CLOVER_BASE}/oauth/token?client_id=${CLOVER_APP_ID}&client_secret=${CLOVER_APP_SECRET}&code=${code}`);
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.status(400).json({ error: 'Failed to get access token', details: tokenData });
      return res.redirect(`https://app.getstockguard.com?clover_token=${tokenData.access_token}&clover_mid=${merchant_id}&clover_connected=1`);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (action === 'inventory') {
    const { token, merchant_id } = req.query;
    if (!token || !merchant_id) return res.status(400).json({ error: 'Missing token or merchant_id' });
    try {
      const r = await fetch(`${CLOVER_BASE}/v3/merchants/${merchant_id}/items?expand=itemStock&limit=500`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (action === 'update_stock' && req.method === 'POST') {
    const { token, merchant_id, item_id, quantity } = req.body;
    if (!token || !merchant_id || !item_id) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const r = await fetch(`${CLOVER_BASE}/v3/merchants/${merchant_id}/item_stocks/${item_id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (action === 'merchant') {
    const { token, merchant_id } = req.query;
    try {
      const r = await fetch(`${CLOVER_BASE}/v3/merchants/${merchant_id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
