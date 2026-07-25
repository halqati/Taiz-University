import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

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

  try {
    // Health endpoint
    if (pathname === '/telegram/health' || pathname === '/api/telegram/health' || pathname.endsWith('/health')) {
      return res.status(200).json({
        success: true,
        status: 'ok',
      });
    }

    // Colleges endpoint - Direct Firebase test
    if (pathname === '/telegram/colleges' || pathname === '/api/telegram/colleges' || pathname.endsWith('/colleges')) {
      try {
        const snap = await getDocs(collection(db, 'colleges'));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return res.status(200).json({
          success: true,
          count: list.length,
          data: list,
        });
      } catch (fbError: any) {
        console.error('Firebase test fetch error:', fbError);
        return res.status(200).json({
          success: false,
          error: fbError?.message || String(fbError),
          code: fbError?.code || 'UNKNOWN_FIREBASE_ERROR',
        });
      }
    }

    return res.status(404).json({
      success: false,
      error: 'Not Found',
      path: pathname,
    });
  } catch (error: any) {
    console.error('Serverless Handler Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      details: error?.message || String(error),
    });
  }
}





