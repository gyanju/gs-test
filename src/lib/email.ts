// src/lib/email.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set. Password reset emails will NOT be sent.");
}

if (!fromEmail) {
  console.warn("FROM_EMAIL is not set. Password reset emails will NOT be sent.");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  console.log("[sendPasswordResetEmail] Called for:", to);
  console.log("[sendPasswordResetEmail] Reset URL:", resetUrl);

  if (!resend || !fromEmail) {
    console.log(
      "[sendPasswordResetEmail] resend or fromEmail missing. Only logging URL instead of sending."
    );
    return;
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Reset your password",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5;">
          <h2>Reset your password</h2>
          <p>You requested to reset your password. Click the button below to create a new one:</p>
          <p>
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 10px 16px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
              "
            >
              Reset password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #111827;">${resetUrl}</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
            If you didn't request this, you can ignore this email.
          </p>
        </div>
      `,
    });

    console.log("[sendPasswordResetEmail] Resend response:", result);
  } catch (err) {
    console.error("[sendPasswordResetEmail] Error sending email:", err);
    throw err;
  }
}
