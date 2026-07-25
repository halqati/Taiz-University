export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-telegram-secret'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  const pathname = url.split('?')[0];

  // Native route matching
  if (pathname === '/telegram/health' || pathname === '/api/telegram/health' || pathname.endsWith('/health')) {
    return res.status(200).json({
      success: true,
      status: 'ok',
    });
  }

  return res.status(200).json({
    success: true,
    status: 'ok',
    path: pathname,
  });
}



