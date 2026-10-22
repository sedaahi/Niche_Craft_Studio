export type CourseCategory = 
  | 'ceramic' 
  | 'painting' 
  | 'textile' 
  | 'jewelry' 
  | 'calligraphy' 
  | 'candle';

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: CourseCategory;
  categoryLabel: string;
  description: string;
  longDescription: string;
  durationMinutes: number;
  level: 'Başlangıç' | 'Orta Seviye' | 'Tüm Seviyeler';
  includedItems: string[];
  instructorId: string;
  instructor: Instructor;
  imageUrl: string;
  basePrice: number;
  featured: boolean;
  maxCapacityPerSession: number;
}

export interface Session {
  id: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: number; // TRY
  capacity: number;
  bookedCount: number; // Definite paid tickets
}

export interface ReservationHold {
  id: string;
  sessionId: string;
  quantity: number;
  expiresAt: number; // epoch ms
  holdKey: string;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
  photoUrl?: string;
  authProvider?: 'password' | 'google';
}

export interface EmailNotificationLog {
  id: string;
  recipientEmail: string;
  recipientName: string;
  type: 'welcome' | 'ticket_confirmation';
  subject: string;
  sentAt: string;
  status: 'sent' | 'simulated' | 'failed';
  resendId?: string;
  details?: string;
}

export interface Ticket {
  id: string;
  ticketCode: string; // e.g. NCS-2026-8492-01
  orderId: string;
  sessionId: string;
  courseId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  checkedIn: boolean;
  checkedInAt?: string;
  seatNumber: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. NCS-ORD-4921
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sessionId: string;
  courseId: string;
  quantity: number;
  totalAmount: number;
  currency: 'TRY';
  status: 'paid' | 'cancelled' | 'refunded';
  createdAt: string;
  tickets: Ticket[];
  paymentMethod: string;
  paymentId: string;
}

export type ViewState = 
  | { view: 'home' }
  | { view: 'courses'; category?: CourseCategory }
  | { view: 'course-detail'; courseId: string; autoSelectSessionId?: string }
  | { view: 'checkout'; sessionId: string; initialQuantity?: number }
  | { view: 'confirmation'; orderId: string }
  | { view: 'account' }
  | { view: 'about' }
  | { view: 'admin' }
  | { view: 'auth'; initialTab?: 'login' | 'register'; returnTo?: ViewState };
