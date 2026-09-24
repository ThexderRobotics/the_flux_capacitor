export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

      try {
        const data = await request.json();
        const name = String(data.name || '').trim().slice(0, 120);
        const email = String(data.email || '').trim().slice(0, 200);
        const message = String(data.message || '').trim().slice(0, 5000);

        if (data.website) return json({ ok: true });
        if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return json({ error: 'Please complete all fields correctly.' }, 400);
        }
        if (!env.EMAIL) return json({ error: 'Email service is not configured.' }, 503);

        await env.EMAIL.send({
          from: 'mail@zanderbooyzen.com',
          to: 'mail@zanderbooyzen.com',
          replyTo: email,
          subject: `Website message from ${name}`,
          text: `${message}\n\nFrom: ${name} <${email}>`,
          html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p><p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
        });

        return json({ ok: true });
      } catch (error) {
        console.error('Contact email failed:', error?.code || error?.message || error);
        return json({ error: error?.code || 'Email service could not send the message.' }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } });
}

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
