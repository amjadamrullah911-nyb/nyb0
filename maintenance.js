export default async (request, context) => {
  const whitelist = ['::1'];
  const clientIP = request.headers.get('x-nf-client-connection-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  console.log('Client IP:', clientIP);

  if (!whitelist.includes(clientIP)) {
    const maintenancePage = `
      <html>
        <head>
          <title>Maintenance Mode</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
            h1 { color: #333; }
            p { font-size: 18px; color: #666; }
            a { color: blue; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>🚧 Under Maintenance 🚧</h1>
          <p>We are currently performing scheduled maintenance.</p>
          <p>Please check back later.</p>
          <p>If you need assistance, contact us on <a href="https://t.me/fzein" target="_blank">Telegram</a>.</p>
        </body>
      </html>
    `;

    return new Response(maintenancePage, {
      status: 503,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  return context.next();
};
