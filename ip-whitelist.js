export default async (request, context) => {
  const whitelist = ['154.222.5.105', '203.156.1.99', '154.222.5.233', '115.84.103.85', '45.115.209.194', '96.9.69.233'];
  const clientIP = request.headers.get('x-nf-client-connection-ip') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  console.log(`[ip-whitelist] Client IP: ${clientIP}`);

  // Cek apakah IP di whitelist
  if (!clientIP || !whitelist.includes(clientIP)) {
    console.log(`[ip-whitelist] Access Denied for ${clientIP}`);
    return new Response(`Access Denied. Your IP ${clientIP} is not whitelisted.`, {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // Izinkan akses ke halaman login dan fungsi login tanpa pengecekan lebih lanjut
  if (request.url.includes("/login.html") || request.url.includes("/.netlify/functions/login")) {
    console.log(`[ip-whitelist] Allowing access to login page: ${request.url}`);
    return context.next();
  }

  // Ambil cookie untuk autentikasi
  const cookies = request.headers.get("cookie") || "";
  console.log(`[ip-whitelist] Cookies: ${cookies}`);

  // Jika tidak ada cookie auth, lakukan redirect ke login.html
  if (!cookies.includes("auth=loggedin")) {
    // Cegah looping redirect
    if (request.headers.get("X-Redirected") === "true") {
      console.log("[ip-whitelist] Redirect loop detected, stopping request");
      return new Response("Redirect loop detected, stopping request", { status: 400 });
    }

    console.log("[ip-whitelist] Redirecting to /login.html");
    
    const headers = new Headers();
    headers.set("X-Redirected", "true");

    return Response.redirect("/login.html", 302, { headers });
  }

  console.log("[ip-whitelist] Access granted, forwarding request.");
  return context.next();
};
