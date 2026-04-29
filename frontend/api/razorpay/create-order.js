// Vercel Serverless Function — /api/razorpay/create-order
// SECURITY: RAZORPAY_KEY_SECRET is ONLY used here, never in frontend
const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { amount, receipt, currency = 'INR' } = req.body || {};

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay keys not configured on server' });
  }

  const orderBody = JSON.stringify({
    amount: Math.round(Number(amount) * 100), // paise
    currency,
    receipt: (receipt || `LNY-${Date.now()}`).slice(0, 40),
    payment_capture: 1,
  });

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orderBody),
        'Authorization': `Basic ${auth}`,
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const order = JSON.parse(data);
          if (apiRes.statusCode === 200) {
            res.status(200).json(order);
          } else {
            res.status(500).json({ error: order.error?.description || 'Razorpay order creation failed' });
          }
        } catch (e) {
          res.status(500).json({ error: 'Invalid response from Razorpay' });
        }
        resolve();
      });
    });

    apiReq.on('error', (err) => {
      res.status(500).json({ error: err.message });
      resolve();
    });

    apiReq.write(orderBody);
    apiReq.end();
  });
};
