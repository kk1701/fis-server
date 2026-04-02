import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOTP(email: string, otp: string, name: string) {
    try {
      await this.resend.emails.send({
        from: process.env.FROM_EMAIL ?? 'onboarding@resend.dev',
        to: email,
        subject: 'FIS — Password Reset OTP',
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f7f4ef;">
            <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(26,26,46,0.08);">
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
                <div style="width: 10px; height: 10px; background: #c8491a; border-radius: 50%;"></div>
                <span style="font-family: serif; font-weight: 900; font-size: 1.4rem; color: #1a1a2e;">FIS</span>
              </div>

              <h2 style="font-family: serif; font-size: 1.5rem; color: #1a1a2e; margin: 0 0 8px;">
                Password Reset Request
              </h2>
              <p style="color: #6b6b8a; font-size: 0.9rem; margin: 0 0 24px;">
                Hi ${name}, use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.
              </p>

              <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="color: rgba(247,244,239,0.6); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px;">
                  Your OTP
                </p>
                <p style="color: #f7f4ef; font-size: 2.5rem; font-weight: 900; font-family: monospace; letter-spacing: 0.2em; margin: 0;">
                  ${otp}
                </p>
              </div>

              <p style="color: #6b6b8a; font-size: 0.8rem; margin: 0;">
                If you didn't request this, ignore this email. Your password won't change.
              </p>
            </div>
          </div>
        `,
      });
    } catch {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
