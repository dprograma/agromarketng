const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send the approval email with post previews.
 * @param {Object} batch  - post_batches row
 * @param {Array}  posts  - posts rows for this batch
 */
async function sendApprovalEmail(batch, posts) {
  const approvalUrl = `${process.env.APP_URL}/review/${batch.token}`;
  const scheduledTime = new Date(batch.scheduled_at).toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const platformIcons = {
    facebook: '📘',
    twitter: '🐦',
    instagram: '📸',
    linkedin: '💼',
    tiktok: '🎵',
  };

  const postPreviews = posts.map(post => {
    const icon = platformIcons[post.platform] || '📱';
    const preview = post.content.length > 200
      ? post.content.substring(0, 200) + '…'
      : post.content;

    const imageBlock = post.image_url
      ? `<div style="margin:8px 0;">
           <img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.image_alt || '')}"
                style="max-width:100%;border-radius:8px;max-height:200px;object-fit:cover;" />
           <div style="font-size:11px;color:#999;margin-top:2px;">${escapeHtml(post.image_credit || '')}</div>
         </div>`
      : '';

    return `
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px;background:#fff;">
        <div style="font-weight:700;font-size:15px;margin-bottom:8px;color:#374151;">
          ${icon} ${capitalize(post.platform)}
        </div>
        ${imageBlock}
        <p style="margin:0;font-size:14px;color:#4b5563;white-space:pre-wrap;line-height:1.6;">${escapeHtml(preview)}</p>
      </div>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Social Posts Ready for Review</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:32px auto;">
    <tr>
      <td style="background:#16a34a;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">🌾 ${escapeHtml(process.env.SITE_NAME || 'AgroMarket')} Social Posts</h1>
        <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px;">Scheduled for ${scheduledTime}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#f9fafb;padding:24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
        <p style="color:#374151;font-size:15px;margin:0 0 20px;">
          Your AI-generated social media posts are ready! Review them below, then click the button to edit and approve before they go live.
        </p>

        ${postPreviews}

        <div style="text-align:center;margin-top:24px;">
          <a href="${escapeHtml(approvalUrl)}"
             style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;
                    padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
            ✏️ Review &amp; Edit Posts
          </a>
          <p style="font-size:12px;color:#9ca3af;margin-top:12px;">
            This link expires in 48 hours.
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#f3f4f6;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;
                 padding:16px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">
          Sent by ${escapeHtml(process.env.SITE_NAME || 'AgroMarket')} Social Scheduler •
          <a href="${escapeHtml(process.env.APP_URL || '')}/settings" style="color:#6b7280;">Settings</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
${process.env.SITE_NAME || 'AgroMarket'} Social Posts — Ready for Review
Scheduled: ${scheduledTime}

${posts.map(p => `[${p.platform.toUpperCase()}]\n${p.content}\n`).join('\n---\n')}

Review and approve: ${approvalUrl}

This link expires in 48 hours.
`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `"${process.env.SITE_NAME} Social" <${process.env.SMTP_USER}>`,
    to: process.env.APPROVAL_EMAIL,
    subject: `🌾 [${process.env.SITE_NAME}] ${posts.length} Social Posts Ready — ${scheduledTime}`,
    text,
    html,
  });

  console.log(`[Email] Approval email sent to ${process.env.APPROVAL_EMAIL}`);
}

/**
 * Send a confirmation email after posts have been published.
 */
async function sendPublishedConfirmation(batch, results) {
  const successCount = results.filter(r => r.status === 'posted').length;
  const failCount = results.filter(r => r.status === 'failed').length;

  const rows = results.map(r => {
    const icon = r.status === 'posted' ? '✅' : '❌';
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${icon} ${capitalize(r.platform)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${r.status === 'posted' ? '#16a34a' : '#dc2626'};">
        ${r.status === 'posted' ? 'Published' : 'Failed: ' + escapeHtml(r.error || 'Unknown error')}
      </td>
    </tr>`;
  }).join('');

  const html = `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f3f4f6;padding:32px;">
<div style="max-width:500px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
  <div style="background:#16a34a;padding:20px;text-align:center;">
    <h2 style="color:#fff;margin:0;">🚀 Posts Published</h2>
  </div>
  <div style="padding:24px;">
    <p style="color:#374151;">${successCount} post(s) published successfully${failCount > 0 ? `, ${failCount} failed` : ''}.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
  </div>
</div>
</body></html>`;

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || `"${process.env.SITE_NAME} Social" <${process.env.SMTP_USER}>`,
    to: process.env.APPROVAL_EMAIL,
    subject: `🚀 [${process.env.SITE_NAME}] Posts Published — ${successCount}/${results.length} successful`,
    html,
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

module.exports = { sendApprovalEmail, sendPublishedConfirmation };
