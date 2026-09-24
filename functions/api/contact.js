export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const name = String(data.name || '').trim().slice(0, 120);
    const email = String(data.email || '').trim().slice(0, 200);
    const message = String(data.message || '').trim().slice(0, 5000);

    if (data.website) return Response.json({ ok: true });
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Please complete all fields correctly.' }, { status: 400 });
    }
    if (!env.EMAIL) {
      return Response.json({ error: 'Email service is not configured.' }, { status: 503 });
    }

    await env.EMAIL.send({
      from: 'mail@zanderbooyzen.com',
      to: 'mail@zanderbooyzen.com',
      replyTo: email,
      subject: `Website message from ${name}`,
      text: `${message}\n\nFrom: ${name} <${email}>`,
      html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p><p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Unable to send message.' }, { status: 500 });
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
