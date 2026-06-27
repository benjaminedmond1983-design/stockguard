const { URL } = require('url');

const SQUARE_APP_ID = process.env.SQUARE_APP_ID;
const SQUARE_APP_SECRET = process.env.SQUARE_APP_SECRET;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_BASE_URL = 'https://connect.squareupsandbox.com';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname, searchParams } = new URL(req.url, `https://${req.headers.host}`);
  const action = searchParams.get('action') || pathname.split('/').pop();

  try {
    // --- STATUS ---
    if (action === 'status') {
      return res.status(200).json({ ok: true, message: 'Square API online' });
    }

    // --- SYNC INVENTORY: pull catalog items from Square ---
    if (action === 'sync-inventory') {
      const response = await fetch(`${SQUARE_BASE_URL}/v2/catalog/list?types=ITEM`, {
        headers: {
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-18',
        },
      });
      const data = await response.json();
      if (data.errors) return res.status(400).json({ error: data.errors[0].detail });
      const items = (data.objects || []).map(obj => ({
        square_id: obj.id,
        name: obj.item_data?.name || 'Unknown',
        sku: obj.item_data?.variations?.[0]?.item_variation_data?.sku || '',
        price: (obj.item_data?.variations?.[0]?.item_variation_data?.price_money?.amount || 0) / 100,
      }));
      return res.status(200).json({ items, count: items.length });
    }

    // --- SYNC SALES: pull recent orders from Square ---
    if (action === 'sync-sales') {
      const { location_id } = req.body || {};
      
      // First get locations if not provided
      let locationId = location_id;
      if (!locationId) {
        const locRes = await fetch(`${SQUARE_BASE_URL}/v2/locations`, {
          headers: {
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Square-Version': '2024-01-18',
          },
        });
        const locData = await locRes.json();
        locationId = locData.locations?.[0]?.id;
        if (!locationId) return res.status(400).json({ error: 'No Square location found' });
      }

      // Get orders from last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const ordersRes = await fetch(`${SQUARE_BASE_URL}/v2/orders/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-18',
        },
        body: JSON.stringify({
          location_ids: [locationId],
          query: {
            filter: {
              date_time_filter: {
                created_at: { start_at: startDate.toISOString() }
              },
              state_filter: { states: ['COMPLETED'] }
            }
          },
          limit: 100,
        }),
      });
      const ordersData = await ordersRes.json();
      if (ordersData.errors) return res.status(400).json({ error: ordersData.errors[0].detail });
      
      const orders = (ordersData.orders || []).map(order => ({
        square_order_id: order.id,
        total: (order.total_money?.amount || 0) / 100,
        created_at: order.created_at,
        items: (order.line_items || []).map(item => ({
          name: item.name,
          quantity: parseInt(item.quantity),
          price: (item.base_price_money?.amount || 0) / 100,
        })),
      }));
      return res.status(200).json({ orders, count: orders.length, location_id: locationId });
    }

    // --- GET LOCATIONS ---
    if (action === 'locations') {
      const response = await fetch(`${SQUARE_BASE_URL}/v2/locations`, {
        headers: {
          'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Square-Version': '2024-01-18',
        },
      });
      const data = await response.json();
      if (data.errors) return res.status(400).json({ error: data.errors[0].detail });
      return res.status(200).json({ locations: data.locations || [] });
    }

    return res.status(404).json({ error: 'Unknown action' });

  } catch (err) {
    console.error('Square API error:', err);
    return res.status(500).json({ error: err.message });
  }
};
