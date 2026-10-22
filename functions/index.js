/**
 * Firebase Cloud Functions for Niche Craft Studio
 * Automatically triggers Welcome & Ticket Confirmation emails using Resend on Firestore writes.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

admin.initializeApp();
const db = admin.firestore();

// Resend client - initialized with secret or environment configuration
const resendApiKey = process.env.RESEND_API_KEY || functions.config().resend?.key;
const resend = new Resend(resendApiKey || 're_placeholder_key');

const SENDER_EMAIL = 'Niche Craft Studio <onboarding@resend.dev>'; // or hello@nichecraftstudio.com once domain verified

/**
 * Trigger 1: On User Registration in Firestore
 * Collection: /users/{userId}
 */
exports.onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    if (!user || !user.email) return null;

    console.log(`[Firebase Functions] New user registered: ${user.name} (${user.email})`);

    const html = `
      <div style="font-family: sans-serif; background-color: #FBF6EF; padding: 24px; color: #4A3F3A;">
        <div style="max-width: 580px; margin: 0 auto; background: #FFF; border-radius: 16px; border: 1px solid #E7DDCE; padding: 28px;">
          <h2 style="color: #4A3F3A;">Niche Craft Studio'ya Hoş Geldiniz! ✨</h2>
          <p>Merhaba <strong>${user.name}</strong>,</p>
          <p>Ankara Tunalı'daki seramik ve el sanatları stüdyomuzun kayıtlı üyesi oldunuz. Tüm atölye seanslarına tek tıkla kayıt yaptırabilir ve QR biletlerinizi profilinizden görüntüleyebilirsiniz.</p>
          <div style="background: #FAF7F2; padding: 14px; border-radius: 10px; margin: 16px 0;">
            <p style="margin: 0; font-size: 13px;">📍 Tunalı Hilmi Cd. No: 48/B, Çankaya / Ankara</p>
          </div>
        </div>
      </div>
    `;

    try {
      if (!resendApiKey) {
        console.log('[Firebase Functions] RESEND_API_KEY not configured. Simulated dispatch for welcome email.');
        return null;
      }

      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: user.email,
        subject: "✨ Niche Craft Studio'ya Hoş Geldiniz! Yaratıcı Yolculuğunuz Başlıyor",
        html: html,
      });

      console.log('[Firebase Functions] Resend welcome email sent:', response);
      return response;
    } catch (error) {
      console.error('[Firebase Functions] Error sending welcome email via Resend:', error);
      return null;
    }
  });

/**
 * Trigger 2: On Order / Ticket Purchase in Firestore
 * Collection: /orders/{orderId}
 */
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    if (!order || !order.customerEmail) return null;

    console.log(`[Firebase Functions] New order created: ${order.orderNumber} for ${order.customerName}`);

    // Fetch course and session for rich email content
    let courseTitle = 'Hobi Atölyesi';
    try {
      const courseDoc = await db.collection('courses').doc(order.courseId).get();
      if (courseDoc.exists) {
        courseTitle = courseDoc.data().title;
      }
    } catch (e) {
      console.warn('Could not fetch course doc:', e);
    }

    const ticketsHtml = (order.tickets || [])
      .map(
        (t, i) => `
        <div style="background: #FAF7F2; border: 1px solid #E7DDCE; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
          <strong>Bilet #${i + 1}: ${t.ticketCode}</strong> (Koltuk #${t.seatNumber})<br/>
          Katılımcı: ${t.attendeeName}
        </div>
      `
      )
      .join('');

    const html = `
      <div style="font-family: sans-serif; background-color: #FBF6EF; padding: 24px; color: #4A3F3A;">
        <div style="max-width: 580px; margin: 0 auto; background: #FFF; border-radius: 16px; border: 1px solid #E7DDCE; padding: 28px;">
          <h2 style="color: #4A3F3A;">Atölye Biletiniz Hazır! 🎟️</h2>
          <p>Merhaba <strong>${order.customerName}</strong>,</p>
          <p><strong>${courseTitle}</strong> için rezervasyonunuz onaylandı. Sipariş numaranız: <strong>${order.orderNumber}</strong>.</p>
          <div style="margin: 16px 0;">
            ${ticketsHtml}
          </div>
          <p style="font-size: 12px; color: #7E7067;">Seans kapısında bilet kodunuzu veya stüdyo web sayfanızdaki QR kodu göstermeniz yeterlidir.</p>
        </div>
      </div>
    `;

    try {
      if (!resendApiKey) {
        console.log('[Firebase Functions] RESEND_API_KEY not configured. Simulated dispatch for ticket email.');
        return null;
      }

      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: order.customerEmail,
        subject: `🎟️ Biletiniz Hazır: ${courseTitle} — Sipariş No: ${order.orderNumber}`,
        html: html,
      });

      console.log('[Firebase Functions] Resend ticket email sent:', response);
      return response;
    } catch (error) {
      console.error('[Firebase Functions] Error sending ticket email via Resend:', error);
      return null;
    }
  });
