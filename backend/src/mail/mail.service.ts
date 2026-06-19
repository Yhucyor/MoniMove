import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * MailService — từ MoniMove v3
 * Gửi email HTML cảnh báo khẩn cấp qua SMTP
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.SMTP_PORT ?? 465);
    const pass = (process.env.SMTP_PASS ?? '').replace(/\s+/g, '');

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('❌ SMTP connection failed:', error.message);
      } else {
        this.logger.log('✅ SMTP connection verified — ready to send emails');
      }
    });
  }

  /**
   * Gửi email cảnh báo khẩn cấp đến người thân
   */
  async sendEmergencyEmail(
    toEmail: string,
    alertData: {
      alertType: string;
      message: string;
      deviceId: string;
      timestamp: number;
      location?: { lat: number; lng: number };
    },
  ): Promise<void> {
    const time = new Date(alertData.timestamp).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    const mapsLink = alertData.location
      ? `https://maps.google.com/?q=${alertData.location.lat},${alertData.location.lng}`
      : null;

    const severityColor =
      alertData.alertType.toLowerCase().includes('ngã') ||
      alertData.alertType.toLowerCase().includes('va chạm') ||
      alertData.alertType.toLowerCase().includes('chấn động') ||
      alertData.alertType.toLowerCase().includes('fall') ||
      alertData.alertType.toLowerCase().includes('impact') ||
      alertData.alertType.toLowerCase().includes('crash') ||
      alertData.alertType.toLowerCase().includes('emergency')
        ? '#dc2626'
        : '#d97706';

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Cảnh báo khẩn cấp MoniMove</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#12a1c0,#00b494);padding:28px 32px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <span style="font-size:24px;">📍</span>
              </div>
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">MoniMove</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;">Hệ thống Giám sát Hành trình IoT</p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding:24px 32px 0;text-align:center;">
              <div style="display:inline-block;background:${severityColor}1a;border:1.5px solid ${severityColor}40;border-radius:12px;padding:6px 16px;margin-bottom:16px;">
                <span style="color:${severityColor};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">
                  ⚠️ CẢNH BÁO KHẨN CẤP
                </span>
              </div>
              <h2 style="margin:0 0 8px;color:#0f172a;font-size:18px;font-weight:800;">${alertData.alertType}</h2>
              <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;">${alertData.message}</p>
            </td>
          </tr>

          <!-- Info Grid -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;padding:10px;background:#f8fafc;border-radius:12px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;">Thiết bị</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#1e293b;">${alertData.deviceId}</p>
                  </td>
                  <td style="width:8px;"></td>
                  <td style="width:50%;padding:10px;background:#f8fafc;border-radius:12px;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;">Thời gian</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#1e293b;">${time}</p>
                  </td>
                </tr>
                ${alertData.location ? `
                <tr>
                  <td colspan="3" style="padding-top:8px;">
                    <div style="padding:10px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
                      <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#3b82f6;">📌 Tọa độ GPS</p>
                      <p style="margin:0;font-size:12px;font-weight:600;color:#1e293b;font-family:monospace;">
                        ${alertData.location.lat.toFixed(6)}°N, ${alertData.location.lng.toFixed(6)}°E
                      </p>
                    </div>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          ${mapsLink ? `
          <tr>
            <td style="padding:0 32px 24px;text-align:center;">
              <a href="${mapsLink}" target="_blank"
                style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:12px 28px;border-radius:12px;letter-spacing:0.3px;">
                🗺️ Xem vị trí trên Google Maps
              </a>
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.6;">
                Email này được gửi tự động bởi hệ thống MoniMove IoT.<br/>
                Vui lòng không trả lời email này.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || `"MoniMove Alert" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `🚨 [MoniMove] ${alertData.alertType} — Cảnh báo khẩn cấp lúc ${time}`,
        html,
      });
      this.logger.log(`✅ Emergency email sent to ${toEmail} | messageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${toEmail}: ${error instanceof Error ? error.message : String(error)}`);
      // Không throw — email lỗi không được crash flow tạo alert
    }
  }
}
