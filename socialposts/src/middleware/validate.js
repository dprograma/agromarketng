/**
 * Simple request validation middleware helpers.
 */

const PLATFORMS = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'];
const STATUSES  = ['pending', 'approved', 'skipped'];

function validatePlatform(req, res, next) {
  const { platform } = req.params;
  if (platform && !PLATFORMS.includes(platform)) {
    return res.status(400).json({ ok: false, error: `Invalid platform: "${platform}". Must be one of: ${PLATFORMS.join(', ')}` });
  }
  next();
}

function validatePostPatch(req, res, next) {
  const { content, status, imageUrl } = req.body;

  if (content !== undefined && typeof content !== 'string') {
    return res.status(400).json({ ok: false, error: 'content must be a string' });
  }
  if (content !== undefined && content.trim().length === 0) {
    return res.status(400).json({ ok: false, error: 'content cannot be empty' });
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: `status must be one of: ${STATUSES.join(', ')}` });
  }
  if (imageUrl !== undefined && typeof imageUrl !== 'string') {
    return res.status(400).json({ ok: false, error: 'imageUrl must be a string' });
  }
  next();
}

function validateBatchApprove(req, res, next) {
  const { platformStatuses } = req.body;
  if (platformStatuses && typeof platformStatuses !== 'object') {
    return res.status(400).json({ ok: false, error: 'platformStatuses must be an object' });
  }
  if (platformStatuses) {
    for (const [plat, stat] of Object.entries(platformStatuses)) {
      if (!PLATFORMS.includes(plat)) {
        return res.status(400).json({ ok: false, error: `Unknown platform: ${plat}` });
      }
      if (!['approved', 'skipped', 'pending'].includes(stat)) {
        return res.status(400).json({ ok: false, error: `Invalid status for ${plat}: ${stat}` });
      }
    }
  }
  next();
}

module.exports = { validatePlatform, validatePostPatch, validateBatchApprove };
