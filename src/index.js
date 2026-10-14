export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

      let data;
      try {
        data = await request.json();
      } catch {
        return json({ error: 'Request body must be valid JSON.' }, 400);
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return json({ error: 'Request body must be a JSON object.' }, 400);
      }

      const name = typeof data.name === 'string' ? data.name.trim().slice(0, 120) : '';
      const email = typeof data.email === 'string' ? data.email.trim().slice(0, 200) : '';
      const service = typeof data.service === 'string' ? data.service.trim().slice(0, 120) : '';
      const message = typeof data.message === 'string' ? data.message.trim().slice(0, 5000) : '';

      if (data.website) return json({ ok: true });
      if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Please complete all fields correctly.' }, 400);
      }
      if (!env.EMAIL) return json({ error: 'Email service is not configured.' }, 503);

      try {
        await env.EMAIL.send({
          from: 'mail@zanderbooyzen.com',
          to: 'zanderbooyzen@gmail.com',
          replyTo: email,
          subject: `Website message from ${name.replace(/[\r\n]+/g, ' ')}`,
          text: `${message}\n\nService: ${service || 'Not specified'}\nFrom: ${name} <${email}>`,
          html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p><p><strong>Service:</strong> ${escapeHtml(service || 'Not specified')}<br><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
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
