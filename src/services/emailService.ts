import { Order, Course, Session, EmailNotificationLog } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const STORAGE_KEY_EMAIL_LOGS = 'ncs_email_logs_v1';

// Helper to save email log locally and to Firestore
export const logEmailNotification = async (log: EmailNotificationLog) => {
  try {
    // 1. Local storage save
    const existing: EmailNotificationLog[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_EMAIL_LOGS) || '[]'
    );
    const updated = [log, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(updated));

    // 2. Try Firestore log (failsafe)
    await setDoc(doc(db, 'email_logs', log.id), log);
  } catch (err) {
    console.warn('[EmailService] Failed to persist email log to Firestore:', err);
  }
};

export const getEmailLogs = (): EmailNotificationLog[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_EMAIL_LOGS) || '[]');
  } catch {
    return [];
  }
};

/**
 * Builds responsive, warm HTML for Welcome Email
 */
export const buildWelcomeEmailHtml = (name: string, email: string): string => {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Niche Craft Studio'ya Hoş Geldiniz</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBF6EF; margin: 0; padding: 24px; color: #4A3F3A; }
    .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E7DDCE; overflow: hidden; }
    .header { background: #FAF7F2; padding: 32px 28px; text-align: center; border-bottom: 1px solid #E7DDCE; }
    .brand { font-size: 24px; font-weight: 700; color: #4A3F3A; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: #7E7067; margin-top: 4px; }
    .body { padding: 32px 28px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 600; color: #4A3F3A; margin-bottom: 14px; }
    .card { background: #FAF7F2; border-radius: 14px; padding: 18px; border: 1px solid #E7DDCE; margin: 20px 0; }
    .card-title { font-size: 14px; font-weight: 600; color: #DE997C; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .perk-item { font-size: 13px; color: #4A3F3A; margin-bottom: 8px; display: flex; align-items: center; }
    .btn { display: inline-block; background-color: #F4B59A; color: #4A3F3A; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 12px; margin-top: 14px; }
    .footer { background: #FAF7F2; padding: 20px 28px; font-size: 11px; color: #7E7067; text-align: center; border-top: 1px solid #E7DDCE; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Niche Craft Studio</div>
      <div class="subtitle">Tunalı Hilmi Cd. No: 48/B, Çankaya / Ankara</div>
    </div>
    <div class="body">
      <div class="greeting">Hoş Geldiniz, ${name}! ✨</div>
      <p style="font-size: 14px; color: #5D5049;">
        Niche Craft Studio ailesine katıldığınız için çok mutluyuz. Ankara Tunalı'daki butik stüdyomuzda çamurun, boyanın ve el sanatlarının dinginliğini birlikte keşfetmeye hazır mısınız?
      </p>
      
      <div class="card">
        <div class="card-title">Üyelik Ayrıcalıklarınız</div>
        <div class="perk-item">🎟️ <strong>Hızlı QR Biletleme:</strong> Satın aldığınız seans biletleri ve karekodları anında cebinizde.</div>
        <div class="perk-item">🛡️ <strong>48 Saat Kesintisiz İade:</strong> Planınız değişirse seansa 48 saat kalana kadar tek tıkla iade.</div>
        <div class="perk-item">☕ <strong>İkram & Malzeme Dahil:</strong> Tüm atölyelerde araç gereçler ve taze filtre kahve stüdyomuzdan.</div>
      </div>

      <p style="font-size: 13px; color: #7E7067;">
        Hesabınız <strong>${email}</strong> e-posta adresiyle aktif edildi. Yaklaşan seansları incelemek ve yerinizi ayırtmak için hemen atölyelerimize göz atabilirsiniz.
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="https://nichecraftstudio.com" class="btn">Atölye Seanslarını Keşfet →</a>
      </div>
    </div>
    <div class="footer">
      Niche Craft Studio · Tunalı Hilmi Cd. No: 48/B, Çankaya / Ankara · Tel: 0312 428 90 90<br/>
      Bu otomatik bilgilendirme e-postası Resend & Firebase altyapısıyla gönderilmiştir.
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Builds responsive, warm HTML for Ticket Confirmation Email
 */
export const buildTicketConfirmationEmailHtml = ({
  customerName,
  order,
  course,
  session,
}: {
  customerName: string;
  order: Order;
  course: Course;
  session: Session;
}): string => {
  const formattedDate = new Date(session.date).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const ticketsHtml = order.tickets
    .map(
      (t, idx) => `
    <div style="background: #FFFFFF; border: 1px solid #E7DDCE; border-radius: 12px; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 11px; color: #7E7067; text-transform: uppercase;">Bilet #${idx + 1} · Koltuk #${t.seatNumber}</div>
        <div style="font-size: 15px; font-weight: 700; font-family: monospace; color: #4A3F3A; letter-spacing: 0.5px; margin-top: 2px;">${t.ticketCode}</div>
        <div style="font-size: 12px; color: #7E7067; margin-top: 2px;">Katılımcı: <strong>${t.attendeeName}</strong></div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 10px; background: #EAF4E8; color: #2E6930; padding: 4px 8px; border-radius: 6px; font-weight: 600;">Girişe Hazır</span>
      </div>
    </div>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <title>Biletiniz Hazır - ${course.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FBF6EF; margin: 0; padding: 24px; color: #4A3F3A; }
    .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E7DDCE; overflow: hidden; }
    .header { background: #FAF7F2; padding: 28px; text-align: center; border-bottom: 1px solid #E7DDCE; }
    .brand { font-size: 22px; font-weight: 700; color: #4A3F3A; }
    .badge { display: inline-block; background: #EAF4E8; color: #2E6930; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
    .body { padding: 28px; }
    .order-box { background: #FAF7F2; border-radius: 14px; padding: 18px; border: 1px solid #E7DDCE; margin: 18px 0; }
    .grid-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .grid-label { color: #7E7067; }
    .grid-val { font-weight: 600; color: #4A3F3A; }
    .footer { background: #FAF7F2; padding: 20px 28px; font-size: 11px; color: #7E7067; text-align: center; border-top: 1px solid #E7DDCE; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Niche Craft Studio</div>
      <div class="badge">✓ Rezervasyon Onaylandı</div>
      <h2 style="font-size: 20px; color: #4A3F3A; margin: 12px 0 4px 0;">Biletleriniz Hazır! 🎟️</h2>
      <div style="font-size: 12px; color: #7E7067;">Sipariş Kodu: <strong>${order.orderNumber}</strong></div>
    </div>
    
    <div class="body">
      <p style="font-size: 14px; line-height: 1.5; color: #5D5049;">
        Merhaba <strong>${customerName}</strong>, atölye kaydınız tamamlandı. Seans günü stüdyomuza geldiğinizde aşağıdaki bilet kodunu veya stüdyo web panelinizdeki QR kodu kapıda göstermeniz yeterlidir.
      </p>

      <div class="order-box">
        <div style="font-size: 15px; font-weight: 700; color: #4A3F3A; margin-bottom: 12px;">${course.title}</div>
        
        <div class="grid-row">
          <span class="grid-label">📅 Tarih:</span>
          <span class="grid-val">${formattedDate}</span>
        </div>
        <div class="grid-row">
          <span class="grid-label">⏰ Saat:</span>
          <span class="grid-val">${session.startTime} – ${session.endTime}</span>
        </div>
        <div class="grid-row">
          <span class="grid-label">👩‍🎨 Eğitmen:</span>
          <span class="grid-val">${course.instructor.name}</span>
        </div>
        <div class="grid-row">
          <span class="grid-label">📍 Konum:</span>
          <span class="grid-val">Tunalı Hilmi Cd. No: 48/B, Çankaya / Ankara</span>
        </div>
        <div class="grid-row" style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #E7DDCE;">
          <span class="grid-label">💳 Toplam Tutar:</span>
          <span class="grid-val" style="color: #DE997C; font-size: 14px;">${order.totalAmount.toLocaleString('tr-TR')} TRY (${order.quantity} Bilet)</span>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <div style="font-size: 12px; font-weight: 700; color: #7E7067; text-transform: uppercase; margin-bottom: 8px;">Giriş Biletleriniz:</div>
        ${ticketsHtml}
      </div>

      <div style="background: #F8F4EE; border-radius: 10px; padding: 12px 14px; font-size: 11px; color: #7E7067; line-height: 1.5;">
        ℹ️ <strong>İptal & İade:</strong> Seanstan 48 saat öncesine kadar stüdyo web sayfanızdan veya profilinizden kesintisiz iade talebinde bulunabilirsiniz. Tüm malzemeler stüdyomuz tarafından sağlanır.
      </div>
    </div>

    <div class="footer">
      Niche Craft Studio · Tunalı Hilmi Cd. No: 48/B, Çankaya / Ankara · Tel: 0312 428 90 90<br/>
      Otomatik Resend & Firebase Trigger Servisi ile iletilmiştir.
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Trigger sending Welcome Email (Calls /api/send-email or fallback)
 */
export const sendWelcomeEmail = async ({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<{ success: boolean; resendId?: string; simulated?: boolean }> => {
  const subject = "✨ Niche Craft Studio'ya Hoş Geldiniz! Yaratıcı Yolculuğunuz Başlıyor";
  const html = buildWelcomeEmailHtml(name, to);

  const logId = 'email-wel-' + Date.now();
  let status: 'sent' | 'simulated' | 'failed' = 'simulated';
  let resendId: string | undefined = 're_sim_' + Math.random().toString(36).substring(2, 9);

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        type: 'welcome',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.id) resendId = data.id;
      status = data.simulated ? 'simulated' : 'sent';
      console.log('[Resend Trigger] Welcome email dispatched successfully:', data);
    } else {
      console.warn('[Resend Trigger] /api/send-email returned status', res.status);
    }
  } catch (err) {
    console.warn('[Resend Trigger] Using client fallback for welcome email:', err);
  }

  // Persist record
  await logEmailNotification({
    id: logId,
    recipientEmail: to,
    recipientName: name,
    type: 'welcome',
    subject,
    sentAt: new Date().toISOString(),
    status,
    resendId,
    details: 'Yeni üyelik hoş geldin e-postası otomatik tetiklendi.',
  });

  return { success: true, resendId, simulated: status === 'simulated' };
};

/**
 * Trigger sending Ticket Confirmation Email (Calls /api/send-email or fallback)
 */
export const sendTicketConfirmationEmail = async ({
  to,
  customerName,
  order,
  course,
  session,
}: {
  to: string;
  customerName: string;
  order: Order;
  course: Course;
  session: Session;
}): Promise<{ success: boolean; resendId?: string; simulated?: boolean }> => {
  const subject = `🎟️ Biletiniz Hazır: ${course.title} — Sipariş No: ${order.orderNumber}`;
  const html = buildTicketConfirmationEmailHtml({
    customerName,
    order,
    course,
    session,
  });

  const logId = 'email-ord-' + Date.now();
  let status: 'sent' | 'simulated' | 'failed' = 'simulated';
  let resendId: string | undefined = 're_sim_' + Math.random().toString(36).substring(2, 9);

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        html,
        type: 'ticket_confirmation',
        orderNumber: order.orderNumber,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.id) resendId = data.id;
      status = data.simulated ? 'simulated' : 'sent';
      console.log('[Resend Trigger] Ticket confirmation email dispatched successfully:', data);
    } else {
      console.warn('[Resend Trigger] /api/send-email returned status', res.status);
    }
  } catch (err) {
    console.warn('[Resend Trigger] Using client fallback for ticket email:', err);
  }

  // Persist record
  await logEmailNotification({
    id: logId,
    recipientEmail: to,
    recipientName: customerName,
    type: 'ticket_confirmation',
    subject,
    sentAt: new Date().toISOString(),
    status,
    resendId,
    details: `${order.orderNumber} numaralı sipariş bilet onay e-postası otomatik tetiklendi.`,
  });

  return { success: true, resendId, simulated: status === 'simulated' };
};
