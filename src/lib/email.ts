/**
 * Resend email sender for the Notepad form.
 *
 * If RESEND_API_KEY is unset (local dev, or before Resend is configured),
 * messages are logged to the server console and treated as successfully
 * "sent" so the form's success animation still plays for testing. The
 * caller can read the returned `delivered` flag to surface that distinction
 * if needed.
 */

interface SendArgs {
  name: string;
  message: string;
  fromEmail?: string;
}

interface SendResult {
  ok: boolean;
  delivered: boolean; // true if Resend actually sent; false if dev fallback
  error?: string;
}

export async function sendNotepad(args: SendArgs): Promise<SendResult> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM ?? 'Porter Portfolio <onboarding@resend.dev>';
  const to = import.meta.env.RESEND_TO ?? 'pfairbourne@gmail.com';

  const subject = `Notepad: ${args.name}`;
  const replyTo = args.fromEmail || undefined;
  const body = [
    `From: ${args.name}${args.fromEmail ? ` <${args.fromEmail}>` : ''}`,
    '',
    args.message,
  ].join('\n');

  if (!apiKey) {
    // Dev fallback — log so the developer can see the submission worked.
    // eslint-disable-next-line no-console
    console.log('[notepad] RESEND_API_KEY not set — would have sent:', { to, from, subject, replyTo, body });
    return { ok: true, delivered: false };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: body,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, delivered: false, error: `resend_${res.status}: ${errText}` };
    }
    return { ok: true, delivered: true };
  } catch (err) {
    return { ok: false, delivered: false, error: String(err) };
  }
}
