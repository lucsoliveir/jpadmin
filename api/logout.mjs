export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'fc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  res.status(200).json({ ok: true });
}
