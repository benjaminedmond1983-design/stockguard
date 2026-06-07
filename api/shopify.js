export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, shop_url, access_token } = req.body;

  if (!shop_url || !access_token) {
    return res.status(400).json({ error: 'Missing shop_url or access_token' });
  }

  const shopDomain = shop_url.replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
  const shopifyBase = `https://${shopDomain}/admin/api/2024-01`;
  const headers = {
    'X-Shopify-Access-Token': access_token,
    'Content-Type': 'application/json',
  };

  try {
    if (action === 'test_connection') {
      const r = await fetch(`${shopifyBase}/shop.json`, { headers });
      if (!r.ok) {
        const err = await r.json();
        return res.status(401).json({ error: 'Invalid credentials', detail: err });
      }
      const data = await r.json();
      return res.status(200).json({ success: true, shop: data.shop });
    }

    if (action === 'fetch_products') {
      let products = [];
      let url = `${shopifyBase}/products.json?limit=250&fields=id,title,variants,images,product_type,vendor`;
      while (url) {
        const r = await fetch(url, { headers });
        if (!r.ok) throw new Error(`Shopify API error: ${r.status}`);
        const data = await r.json();
        products = products.concat(data.products);
        const link = r.headers.get('Link');
        if (link && link.includes('rel="next"')) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/);
          url = match ? match[1] : null;
        } else { url = null; }
      }
      return res.status(200).json({ success: true, products });
    }

    if (action === 'fetch_orders') {
      const since = req.body.since_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let orders = [];
      let url = `${shopifyBase}/orders.json?status=any&fulfillment_status=fulfilled&updated_at_min=${since}&limit=250&fields=id,name,line_items,created_at,fulfillment_status`;
      while (url) {
        const r = await fetch(url, { headers });
        if (!r.ok) throw new Error(`Shopify API error: ${r.status}`);
        const data = await r.json();
        orders = orders.concat(data.orders);
        const link = r.headers.get('Link');
        if (link && link.includes('rel="next"')) {
          const match = link.match(/<([^>]+)>;\s*rel="next"/);
          url = match ? match[1] : null;
        } else { url = null; }
      }
      return res.status(200).json({ success: true, orders });
    }

    if (action === 'update_inventory') {
      const { inventory_item_id, location_id, available } = req.body;
      let locId = location_id;
      if (!locId) {
        const locR = await fetch(`${shopifyBase}/locations.json`, { headers });
        const locData = await locR.json();
        locId = locData.locations[0]?.id;
      }
      const r = await fetch(`${shopifyBase}/inventory_levels/set.json`, {
        method: 'POST', headers,
        body: JSON.stringify({ inventory_item_id, location_id: locId, available }),
      });
      const data = await r.json();
      return res.status(200).json({ success: true, inventory_level: data.inventory_level });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });

  } catch (err) {
    console.error('Shopify proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}