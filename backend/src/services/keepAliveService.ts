/**
 * Keep-alive service to prevent Render free-tier instances from spinning down (sleeping).
 * Render's free tier spins down web services after 15 minutes of inactivity.
 * This background worker periodically pings the public endpoint to keep the container awake.
 */
export function startKeepAliveService() {
  // Render automatically injects RENDER_EXTERNAL_URL (e.g. https://your-app.onrender.com)
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

  if (!targetUrl) {
    console.log('ℹ️ Keep-alive service: RENDER_EXTERNAL_URL not set (running locally or custom domain).');
    return;
  }

  const cleanUrl = targetUrl.replace(/\/+$/, '');
  const pingUrl = `${cleanUrl}/api/v1/ping`;

  // Interval: 10 minutes (Render sleeps after 15 minutes)
  const PING_INTERVAL = 10 * 60 * 1000;

  console.log(`⏱️ Keep-alive service initialized. Target: ${pingUrl} (every 10 minutes)`);

  setInterval(async () => {
    try {
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Render-KeepAlive-Worker/1.0' },
      });
      if (response.ok) {
        console.log(`[Keep-Alive] Ping successful at ${new Date().toISOString()}`);
      } else {
        console.warn(`[Keep-Alive] Ping returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error('[Keep-Alive] Ping error:', error?.message || error);
    }
  }, PING_INTERVAL);
}

