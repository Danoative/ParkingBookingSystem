/**
 * Auth note:
 * Assume an authentication middleware runs earlier and sets req.user = { id, role }
 * For example, after verifying a JWT/session. Only admin can manage users below.
 */
function requireAdmin(req, res, next) {
  // expects req.user.role to exist
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin only' });
}

// Helpers
function sanitizeUpdatableFields(body) {
  const out = {};
  if (typeof body.username === 'string') out.username = body.username.trim();
  if (typeof body.email === 'string') out.email = body.email.trim();
  if (typeof body.role === 'string' && ['admin', 'customer'].includes(body.role)) out.role = body.role;
  if (typeof body.password === 'string') out.password = body.password; // will hash later if present
  return out;
}

module.exports = { requireAuth, requireAdmin };