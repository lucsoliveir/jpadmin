import { next } from '@vercel/functions';

// Middleware de protecao do painel FitConsult.
// Roda no servidor (Edge), antes da pagina ser entregue ao navegador.
// Sem o cookie de sessao valido, o pedido nunca chega a ver o HTML da pagina protegida.

const COOKIE_NAME = 'fc_session';

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

async function verifySession(token, secret) {
  if (!token || !token.includes('.')) return false;
  const [payloadB64, sigB64] = token.split('.');
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const payloadBytes = base64urlDecode(payloadB64);
    const sigBytes = base64urlDecode(sigB64);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes);
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    return typeof payload.exp === 'number' && payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

export default async function middleware(request) {
  const secret = process.env.SESSION_SECRET;

  // Se a variavel de ambiente nao estiver configurada, bloqueia por seguranca
  if (!secret) {
    return new Response(
      'Configuracao ausente: defina SESSION_SECRET nas variaveis de ambiente do projeto na Vercel.',
      { status: 500 }
    );
  }

  const token = getCookie(request, COOKIE_NAME);
  const ok = await verifySession(token, secret);

  if (!ok) {
    const loginUrl = new URL('/admin/', request.url);
    return Response.redirect(loginUrl, 307);
  }

  return next();
}

export const config = {
  matcher: [
    '/admin/dashboard.html',
    '/admin/alunos.html',
    '/admin/agenda.html',
    '/admin/treinos.html',
    '/admin/avaliacoes.html',
    '/admin/evolucao.html',
    '/admin/financeiro.html',
    '/admin/relatorios.html',
    '/admin/configuracoes.html',
  ],
};
