// Funcao serverless (Node.js) que verifica a senha no servidor.
// A senha real nunca fica no codigo enviado ao navegador nem no repositorio:
// ela mora apenas na variavel de ambiente ADMIN_PASSWORD, configurada na Vercel.

function base64urlEncode(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return Buffer.from(str, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signSession(secret, hoursValid) {
  const payload = JSON.stringify({ exp: Date.now() + hoursValid * 60 * 60 * 1000 });
  const enc = new TextEncoder();
  const cryptoObj = globalThis.crypto;
  const key = await cryptoObj.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await cryptoObj.subtle.sign('HMAC', key, enc.encode(payload));
  const payloadB64 = base64urlEncode(enc.encode(payload));
  const sigB64 = base64urlEncode(new Uint8Array(sig));
  return `${payloadB64}.${sigB64}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido' });
    return;
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const SESSION_SECRET = process.env.SESSION_SECRET;

  if (!ADMIN_PASSWORD || !SESSION_SECRET) {
    res.status(500).json({
      error: 'Servidor mal configurado: defina ADMIN_PASSWORD e SESSION_SECRET nas variaveis de ambiente da Vercel.',
    });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const password = body.password || '';

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Senha incorreta' });
    return;
  }

  const HOURS_VALID = 12;
  const token = await signSession(SESSION_SECRET, HOURS_VALID);
  const maxAge = HOURS_VALID * 60 * 60;

  res.setHeader(
    'Set-Cookie',
    `fc_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`
  );
  res.status(200).json({ ok: true });
}
