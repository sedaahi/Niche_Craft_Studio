import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Session, Order, Ticket, ReservationHold, User, ViewState, EmailNotificationLog } from '../types';
import { INITIAL_COURSES, INITIAL_SESSIONS, INITIAL_USER } from '../data/initialData';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {
  sendWelcomeEmail,
  sendTicketConfirmationEmail,
  getEmailLogs,
} from '../services/emailService';

interface StoreContextType {
  courses: Course[];
  sessions: Session[];
  orders: Order[];
  users: User[];
  emailLogs: EmailNotificationLog[];
  currentUser: User | null;
  isAdminLoggedIn: boolean;
  activeHold: ReservationHold | null;
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  setCurrentUser: (user: User | null) => void;
  syncUsersToCloud: () => Promise<{ success: boolean; count: number }>;
  syncCoursesToCloud: () => Promise<{ success: boolean; count: number }>;
  registerUser: (data: {
    name: string;
    username?: string;
    email: string;
    password: string;
    phone?: string;
  }) => { success: boolean; message: string; user?: User };
  loginUser: (
    emailOrUsername: string,
    password: string
  ) => { success: boolean; message: string; user?: User };
  loginWithGoogle: () => Promise<{ success: boolean; message: string; user?: User }>;
  logoutUser: () => void;
  loginAsAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  getAvailableSeats: (sessionId: string) => number;
  startReservationHold: (sessionId: string, quantity: number) => { success: boolean; message?: string };
  releaseReservationHold: () => void;
  createOrder: (data: {
    sessionId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    quantity: number;
    paymentMethod: string;
  }) => Order | null;
  cancelOrRefundOrder: (orderId: string) => { success: boolean; message: string };
  checkInTicket: (ticketCode: string) => { success: boolean; message: string; ticket?: Ticket };
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addSession: (session: Omit<Session, 'id' | 'bookedCount'>) => Session;
  updateSession: (id: string, session: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  exportAttendeesCsv: (sessionId: string) => void;
  resetToSampleData: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  COURSES: 'ncs_courses_v1',
  SESSIONS: 'ncs_sessions_v1',
  ORDERS: 'ncs_orders_v1',
  USERS: 'ncs_users_v1',
  USER: 'ncs_user_v1',
  ADMIN: 'ncs_admin_auth_v1',
  HOLD: 'ncs_active_hold_v1',
  EMAIL_LOGS: 'ncs_email_logs_v1',
};

// Seed an initial demo order so users can see upcoming tickets in account immediately
const INITIAL_DEMO_ORDER: Order = {
  id: 'ord-demo-01',
  orderNumber: 'NCS-2026-7842',
  userId: INITIAL_USER.id,
  customerName: INITIAL_USER.name,
  customerEmail: INITIAL_USER.email,
  customerPhone: INITIAL_USER.phone,
  sessionId: 'sess-cer-1',
  courseId: 'course-ceramic-mug',
  quantity: 2,
  totalAmount: 2500,
  currency: 'TRY',
  status: 'paid',
  createdAt: '2026-10-18T14:20:00Z',
  paymentMethod: 'iyzico Test Kredi Kartı',
  paymentId: 'iyz_pay_982138402',
  tickets: [
    {
      id: 'tk-demo-01-1',
      ticketCode: 'NCS-TK-84920-1',
      orderId: 'ord-demo-01',
      sessionId: 'sess-cer-1',
      courseId: 'course-ceramic-mug',
      attendeeName: 'Seda Ahi',
      attendeeEmail: 'ahiseda@gmail.com',
      attendeePhone: '0555 432 1098',
      checkedIn: false,
      seatNumber: 1,
    },
    {
      id: 'tk-demo-01-2',
      ticketCode: 'NCS-TK-84920-2',
      orderId: 'ord-demo-01',
      sessionId: 'sess-cer-1',
      courseId: 'course-ceramic-mug',
      attendeeName: 'Kerem Ahi',
      attendeeEmail: 'ahiseda@gmail.com',
      attendeePhone: '0555 432 1098',
      checkedIn: false,
      seatNumber: 2,
    },
  ],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (stored) {
        const parsed: Course[] = JSON.parse(stored);
        return parsed.map((c) => {
          const match = INITIAL_COURSES.find((ic) => ic.id === c.id);
          if (match) {
            return { ...c, imageUrl: match.imageUrl };
          }
          return c;
        });
      }
      return INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return stored ? JSON.parse(stored) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : [INITIAL_DEMO_ORDER];
    } catch {
      return [INITIAL_DEMO_ORDER];
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : [INITIAL_USER];
    } catch {
      return [INITIAL_USER];
    }
  });

  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() => {
    return getEmailLogs();
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  const [activeHold, setActiveHold] = useState<ReservationHold | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOLD);
      if (stored) {
        const parsed: ReservationHold = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<ViewState>({ view: 'home' });

  // Local storage persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN, String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  useEffect(() => {
    if (activeHold) {
      localStorage.setItem(STORAGE_KEYS.HOLD, JSON.stringify(activeHold));
    } else {
      localStorage.removeItem(STORAGE_KEYS.HOLD);
    }
  }, [activeHold]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  // Clean expired hold timer
  useEffect(() => {
    if (!activeHold) return;
    const timeLeft = activeHold.expiresAt - Date.now();
    if (timeLeft <= 0) {
      setActiveHold(null);
      return;
    }
    const timer = setTimeout(() => {
      setActiveHold(null);
    }, timeLeft);
    return () => clearTimeout(timer);
  }, [activeHold]);

  // Real-time Cloud Sync & Firestore Seeding for Courses, Sessions, Users, Orders & Email Logs
  useEffect(() => {
    let unsubscribeCourses: (() => void) | undefined;
    let unsubscribeSessions: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeEmailLogs: (() => void) | undefined;

    const initCloudSync = async () => {
      try {
        // 1. Courses Seeding if collection is empty
        const coursesSnap = await getDocs(collection(db, 'courses'));
        if (coursesSnap.empty) {
          console.log('[Firestore] Seeding initial courses...');
          for (const c of INITIAL_COURSES) {
            await setDoc(doc(db, 'courses', c.id), c);
          }
        }

        // 2. Sessions Seeding if collection is empty
        const sessionsSnap = await getDocs(collection(db, 'sessions'));
        if (sessionsSnap.empty) {
          console.log('[Firestore] Seeding initial sessions...');
          for (const s of INITIAL_SESSIONS) {
            await setDoc(doc(db, 'sessions', s.id), s);
          }
        }

        // 3. Ensure initial user exists in Firestore
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          await setDoc(doc(db, 'users', INITIAL_USER.id), INITIAL_USER);
        }

        // 4. Ensure initial demo order exists in Firestore
        const ordersSnap = await getDocs(collection(db, 'orders'));
        if (ordersSnap.empty) {
          await setDoc(doc(db, 'orders', INITIAL_DEMO_ORDER.id), INITIAL_DEMO_ORDER);
        }

        // --- Real-time Listeners ---

        // Courses listener
        unsubscribeCourses = onSnapshot(
          collection(db, 'courses'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteCourses: Course[] = [];
              snapshot.forEach((d) => remoteCourses.push(d.data() as Course));
              setCourses(remoteCourses);
            }
          },
          (err) => {
            console.warn('[Firestore] Courses real-time listener error:', err);
          }
        );

        // Sessions listener
        unsubscribeSessions = onSnapshot(
          collection(db, 'sessions'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteSessions: Session[] = [];
              snapshot.forEach((d) => remoteSessions.push(d.data() as Session));
              setSessions(remoteSessions);
            }
          },
          (err) => {
            console.warn('[Firestore] Sessions real-time listener error:', err);
          }
        );

        // Users listener
        unsubscribeUsers = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteUsers: User[] = [];
              snapshot.forEach((d) => remoteUsers.push(d.data() as User));
              setUsers((prev) => {
                const map = new Map<string, User>();
                prev.forEach((u) => map.set(u.id, u));
                remoteUsers.forEach((u) => map.set(u.id, u));
                return Array.from(map.values());
              });
            }
          },
          (err) => {
            console.warn('[Firestore] Users real-time listener error:', err);
          }
        );

        // Orders listener
        unsubscribeOrders = onSnapshot(
          collection(db, 'orders'),
          (snapshot) => {
            if (!snapshot.empty) {
              const remoteOrders: Order[] = [];
              snapshot.forEach((d) => remoteOrders.push(d.data() as Order));
              setOrders((prev) => {
                const map = new Map<string, Order>();
                prev.forEach((o) => map.set(o.id, o));
                remoteOrders.forEach((o) => map.set(o.id, o));
                return Array.from(map.values()).sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
              });
            }
          },
          (err) => {
            console.warn('[Firestore] Orders real-time listener error:', err);
          }
        );

        // Email logs listener
        unsubscribeEmailLogs = onSnapshot(
          collection(db, 'email_logs'),
          (snapshot) => {
            if (!snapshot.empty) {
              const logs: EmailNotificationLog[] = [];
              snapshot.forEach((d) => logs.push(d.data() as EmailNotificationLog));
              logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
              setEmailLogs(logs);
            }
          },
          (err) => {
            console.warn('[Firestore] Email logs listener error:', err);
          }
        );
      } catch (err) {
        console.warn('[Firestore] Setup sync warning:', err);
      }
    };

    initCloudSync();

    return () => {
      if (unsubscribeCourses) unsubscribeCourses();
      if (unsubscribeSessions) unsubscribeSessions();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeEmailLogs) unsubscribeEmailLogs();
    };
  }, []);

  const syncUsersToCloud = async (): Promise<{ success: boolean; count: number }> => {
    try {
      let count = 0;
      for (const u of users) {
        await setDoc(doc(db, 'users', u.id), u);
        count++;
      }
      return { success: true, count };
    } catch (err) {
      console.error('[Firestore] Manual sync users error:', err);
      return { success: false, count: 0 };
    }
  };

  const syncCoursesToCloud = async (): Promise<{ success: boolean; count: number }> => {
    try {
      let count = 0;
      for (const c of courses) {
        await setDoc(doc(db, 'courses', c.id), c);
        count++;
      }
      for (const s of sessions) {
        await setDoc(doc(db, 'sessions', s.id), s);
        count++;
      }
      return { success: true, count };
    } catch (err) {
      console.error('[Firestore] Manual sync courses error:', err);
      return { success: false, count: 0 };
    }
  };

  const registerUser = (data: {
    name: string;
    username?: string;
    email: string;
    password: string;
    phone?: string;
  }): { success: boolean; message: string; user?: User } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username ? data.username.trim().toLowerCase() : '';

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Lütfen geçerli bir e-posta adresi giriniz.' };
    }

    if (!data.name || data.name.trim().length < 2) {
      return { success: false, message: 'Lütfen adınızı ve soyadınızı giriniz.' };
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, message: 'Şifreniz en az 4 karakterden oluşmalıdır.' };
    }

    // Check if email already registered
    const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return {
        success: false,
        message: 'Bu e-posta adresi ile zaten kayıtlı bir hesap var. Lütfen giriş yapınız.',
      };
    }

    // Check if username already registered
    if (cleanUsername) {
      const existingUsername = users.find((u) => u.username?.toLowerCase() === cleanUsername);
      if (existingUsername) {
        return {
          success: false,
          message: 'Bu kullanıcı adı zaten alınmış. Lütfen başka bir kullanıcı adı seçiniz.',
        };
      }
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      username: cleanUsername || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: data.password,
      phone: data.phone?.trim() || '0555 000 0000',
      role: 'customer',
      createdAt: new Date().toISOString().split('T')[0],
      authProvider: 'password',
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    // Save to Firestore
    setDoc(doc(db, 'users', newUser.id), newUser).catch((err) => {
      console.warn('[Firestore] Failed to save user to cloud:', err);
    });

    // Automatically send welcome email via Resend & Cloud trigger
    sendWelcomeEmail({
      to: newUser.email,
      name: newUser.name,
    }).catch((err) => {
      console.warn('[EmailService] Welcome email error:', err);
    });

    return {
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu! Hoş geldiniz.',
      user: newUser,
    };
  };

  const loginUser = (
    emailOrUsername: string,
    password: string
  ): { success: boolean; message: string; user?: User } => {
    const query = emailOrUsername.trim().toLowerCase();
    if (!query) {
      return { success: false, message: 'Lütfen e-posta veya kullanıcı adınızı giriniz.' };
    }
    if (!password) {
      return { success: false, message: 'Lütfen şifrenizi giriniz.' };
    }

    const found = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        (u.username && u.username.toLowerCase() === query)
    );

    if (!found) {
      return {
        success: false,
        message: 'Bu bilgilerle kayıtlı bir hesap bulunamadı. Lütfen önce kayıt olunuz.',
      };
    }

    if (found.password && found.password !== password) {
      return {
        success: false,
        message: 'Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyiniz.',
      };
    }

    setCurrentUser(found);
    return {
      success: true,
      message: `Giriş başarılı! Hoş geldiniz, ${found.name}.`,
      user: found,
    };
  };

  /**
   * Google Fast Login & Registration with Firebase Auth popup
   */
  const loginWithGoogle = async (): Promise<{ success: boolean; message: string; user?: User }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      const gEmail = gUser.email?.toLowerCase().trim() || '';
      const gName = gUser.displayName || 'Google Kullanıcısı';

      if (!gEmail) {
        return { success: false, message: 'Google hesabınızdan e-posta bilgisi alınamadı.' };
      }

      // Check if user already exists
      let userMatch = users.find((u) => u.email.toLowerCase() === gEmail);

      if (!userMatch) {
        // Create new user profile for Google user
        const newUser: User = {
          id: gUser.uid || ('usr-' + Date.now()),
          name: gName,
          username: (gEmail.split('@')[0] || 'kullanici').toLowerCase().replace(/[^a-z0-9_]/g, ''),
          email: gEmail,
          phone: gUser.phoneNumber || '0555 000 0000',
          role: 'customer',
          createdAt: new Date().toISOString().split('T')[0],
          photoUrl: gUser.photoURL || undefined,
          authProvider: 'google',
        };

        setUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);

        // Save to Firestore
        await setDoc(doc(db, 'users', newUser.id), newUser);

        // Send welcome email via Resend
        sendWelcomeEmail({
          to: newUser.email,
          name: newUser.name,
        }).catch((err) => {
          console.warn('[EmailService] Welcome email error on Google signup:', err);
        });

        return {
          success: true,
          message: `Google ile başarıyla kayıt olundu! Hoş geldiniz, ${newUser.name}.`,
          user: newUser,
        };
      } else {
        // User already registered, log in
        const updatedUser: User = {
          ...userMatch,
          photoUrl: gUser.photoURL || userMatch.photoUrl,
          authProvider: 'google',
        };
        setCurrentUser(updatedUser);
        return {
          success: true,
          message: `Google ile giriş yapıldı! Tekrar hoş geldiniz, ${updatedUser.name}.`,
          user: updatedUser,
        };
      }
    } catch (error: any) {
      console.error('[Google Auth Error]:', error);
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.message?.includes('closed-by-user') ||
        error.message?.includes('popup_closed')
      ) {
        return { success: false, message: 'Google giriş penceresi kapatıldı.' };
      }
      if (error.code === 'auth/popup-blocked') {
        return {
          success: false,
          message:
            'Google giriş penceresi tarayıcınız tarafından engellendi. Lütfen açılır pencerelere izin veriniz.',
        };
      }
      return {
        success: false,
        message: error.message || 'Google ile giriş yapılırken bir sorun oluştu.',
      };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const loginAsAdmin = (password: string): boolean => {
    if (password === 'admin123' || password === 'niche2026') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
  };

  const getAvailableSeats = (sessionId: string): number => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return 0;

    let held = 0;
    if (activeHold && activeHold.sessionId === sessionId && activeHold.expiresAt > Date.now()) {
      held = activeHold.quantity;
    }
    const available = session.capacity - session.bookedCount - held;
    return Math.max(0, available);
  };

  const startReservationHold = (sessionId: string, quantity: number): { success: boolean; message?: string } => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Seans bulunamadı.' };
    }

    const available = session.capacity - session.bookedCount;
    if (quantity > available) {
      return { success: false, message: `Maalesef sadece ${available} kişilik kontenjan kaldı.` };
    }

    const newHold: ReservationHold = {
      id: 'hold-' + Date.now(),
      sessionId,
      quantity,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      holdKey: 'user-session-' + Math.random().toString(36).substring(2, 9),
    };

    setActiveHold(newHold);
    return { success: true };
  };

  const releaseReservationHold = () => {
    setActiveHold(null);
  };

  const createOrder = (data: {
    sessionId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    quantity: number;
    paymentMethod: string;
  }): Order | null => {
    const session = sessions.find((s) => s.id === data.sessionId);
    if (!session) return null;

    const course = courses.find((c) => c.id === session.courseId);
    if (!course) return null;

    const orderId = 'ord-' + Date.now();
    const orderNumber = `NCS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const tickets: Ticket[] = Array.from({ length: data.quantity }).map((_, idx) => ({
      id: `tk-${Date.now()}-${idx + 1}`,
      ticketCode: `NCS-TK-${Math.floor(10000 + Math.random() * 90000)}-${idx + 1}`,
      orderId,
      sessionId: session.id,
      courseId: course.id,
      attendeeName: data.quantity === 1 ? data.customerName : `${data.customerName} (Koltuk ${idx + 1})`,
      attendeeEmail: data.customerEmail,
      attendeePhone: data.customerPhone,
      checkedIn: false,
      seatNumber: session.bookedCount + idx + 1,
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: currentUser?.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      sessionId: session.id,
      courseId: course.id,
      quantity: data.quantity,
      totalAmount: session.price * data.quantity,
      currency: 'TRY',
      status: 'paid',
      createdAt: new Date().toISOString(),
      tickets,
      paymentMethod: data.paymentMethod,
      paymentId: `iyz_pay_${Math.floor(100000000 + Math.random() * 900000000)}`,
    };

    const newBookedCount = session.bookedCount + data.quantity;

    // Update bookedCount in session state
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, bookedCount: newBookedCount } : s))
    );

    // Save order in state
    setOrders((prev) => [newOrder, ...prev]);

    // Persist order to Cloud Firestore
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((err) => {
      console.warn('[Firestore] Failed to save order to cloud:', err);
    });

    // Update session bookedCount in Firestore
    updateDoc(doc(db, 'sessions', session.id), { bookedCount: newBookedCount }).catch((err) => {
      console.warn('[Firestore] Failed to update session bookedCount in cloud:', err);
    });

    // Automatically send Ticket Confirmation Email via Resend & Cloud trigger
    sendTicketConfirmationEmail({
      to: data.customerEmail,
      customerName: data.customerName,
      order: newOrder,
      course,
      session,
    }).catch((err) => {
      console.warn('[EmailService] Order ticket confirmation email error:', err);
    });

    // Release temporary reservation hold
    setActiveHold(null);

    return newOrder;
  };

  const cancelOrRefundOrder = (orderId: string): { success: boolean; message: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: 'Sipariş bulunamadı.' };
    }

    if (order.status !== 'paid') {
      return { success: false, message: 'Bu sipariş zaten iptal/iade edilmiş durumda.' };
    }

    const session = sessions.find((s) => s.id === order.sessionId);
    if (!session) {
      return { success: false, message: 'Seans bilgisine ulaşılamadı.' };
    }

    // Check 48 hours rule
    const sessionDateTime = new Date(`${session.date}T${session.startTime}:00`);
    const now = new Date();
    const diffHours = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 48) {
      return {
        success: false,
        message: `Atölye başlangıcına 48 saatten daha az bir süre (${Math.max(0, Math.round(diffHours))} saat) kaldığı için stüdyo politikası gereği iade yapılamaz. Malzeme hazırlığı tamamlanmıştır.`,
      };
    }

    const updatedBookedCount = Math.max(0, session.bookedCount - order.quantity);

    // Update session bookedCount
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, bookedCount: updatedBookedCount } : s))
    );

    // Update order status in local state
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'refunded' as const } : o))
    );

    // Update in Cloud Firestore
    updateDoc(doc(db, 'orders', orderId), { status: 'refunded' }).catch((err) => {
      console.warn('[Firestore] Failed to update order refund in cloud:', err);
    });

    // Update session bookedCount in Firestore
    updateDoc(doc(db, 'sessions', session.id), { bookedCount: updatedBookedCount }).catch((err) => {
      console.warn('[Firestore] Failed to update session bookedCount on refund:', err);
    });

    return {
      success: true,
      message: `${order.orderNumber} numaralı sipariş başarıyla iptal edildi. ${order.totalAmount} TRY iadesi iyzico üzerinden karta yansıtılmak üzere işleme alındı ve ${order.quantity} kişilik kontenjan havuza geri aktarıldı.`,
    };
  };

  const checkInTicket = (ticketCode: string): { success: boolean; message: string; ticket?: Ticket } => {
    const trimmedCode = ticketCode.trim().toUpperCase();
    for (const order of orders) {
      const ticket = order.tickets.find((t) => t.ticketCode.toUpperCase() === trimmedCode);
      if (ticket) {
        if (order.status !== 'paid') {
          return { success: false, message: `Bu bilet iptal/iade edilmiş bir siparişe aittir (${order.orderNumber}). Giriş onaylanmadı.` };
        }
        if (ticket.checkedIn) {
          const checkInTime = ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
          return {
            success: false,
            message: `Bu bilet daha önce giriş yapmış! (Doğrulama saati: ${checkInTime})`,
            ticket,
          };
        }

        // Mark as checked in
        const nowIso = new Date().toISOString();
        ticket.checkedIn = true;
        ticket.checkedInAt = nowIso;

        setOrders([...orders]);

        // Update in Cloud Firestore
        updateDoc(doc(db, 'orders', order.id), { tickets: order.tickets }).catch((err) => {
          console.warn('[Firestore] Failed to update checkIn in cloud:', err);
        });

        return {
          success: true,
          message: `Giriş Başarılı! Hoş geldiniz, ${ticket.attendeeName}. (Koltuk #${ticket.seatNumber})`,
          ticket,
        };
      }
    }

    return { success: false, message: `"${ticketCode}" koduna sahip geçerli bir bilet bulunamadı. Lütfen kodu kontrol edin.` };
  };

  // --- WORKSHOP / COURSE CRUD (Firestore Connected) ---

  const addCourse = (courseData: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...courseData,
      id: 'course-' + Date.now(),
      slug: courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };
    setCourses((prev) => [newCourse, ...prev]);

    // Persist to Cloud Firestore
    setDoc(doc(db, 'courses', newCourse.id), newCourse).catch((err) => {
      console.warn('[Firestore] Failed to save new course to cloud:', err);
    });

    return newCourse;
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));

    // Update in Cloud Firestore
    updateDoc(doc(db, 'courses', id), updated).catch((err) => {
      console.warn('[Firestore] Failed to update course in cloud:', err);
    });
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));

    // Delete in Cloud Firestore
    deleteDoc(doc(db, 'courses', id)).catch((err) => {
      console.warn('[Firestore] Failed to delete course from cloud:', err);
    });
  };

  // --- SESSION CRUD (Firestore Connected) ---

  const addSession = (sessionData: Omit<Session, 'id' | 'bookedCount'>): Session => {
    const newSession: Session = {
      ...sessionData,
      id: 'sess-' + Date.now(),
      bookedCount: 0,
    };
    setSessions((prev) => [...prev, newSession]);

    // Persist to Cloud Firestore
    setDoc(doc(db, 'sessions', newSession.id), newSession).catch((err) => {
      console.warn('[Firestore] Failed to save session to cloud:', err);
    });

    return newSession;
  };

  const updateSession = (id: string, updated: Partial<Session>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));

    // Update in Cloud Firestore
    updateDoc(doc(db, 'sessions', id), updated).catch((err) => {
      console.warn('[Firestore] Failed to update session in cloud:', err);
    });
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));

    // Delete in Cloud Firestore
    deleteDoc(doc(db, 'sessions', id)).catch((err) => {
      console.warn('[Firestore] Failed to delete session from cloud:', err);
    });
  };

  const exportAttendeesCsv = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const course = courses.find((c) => c.id === session.courseId);

    const sessionOrders = orders.filter((o) => o.sessionId === sessionId && o.status === 'paid');
    const allTickets = sessionOrders.flatMap((o) => o.tickets);

    const rows = [
      ['Bilet Kodu', 'Katilimci Adi', 'E-posta', 'Telefon', 'Siparis No', 'Koltuk No', 'Giris Durumu', 'Giris Zamani'],
      ...allTickets.map((t) => [
        t.ticketCode,
        t.attendeeName,
        t.attendeeEmail,
        t.attendeePhone,
        t.orderId,
        String(t.seatNumber),
        t.checkedIn ? 'GIRIS YAPTI' : 'BEKLENIYOR',
        t.checkedInAt ? new Date(t.checkedInAt).toLocaleString('tr-TR') : '-',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `niche_craft_katilimcilar_${course?.title.substring(0, 15) || 'seans'}_${session.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setCourses(INITIAL_COURSES);
    setSessions(INITIAL_SESSIONS);
    setOrders([INITIAL_DEMO_ORDER]);
    setCurrentUser(INITIAL_USER);
    setActiveHold(null);
    setIsAdminLoggedIn(false);
  };

  return (
    <StoreContext.Provider
      value={{
        courses,
        sessions,
        orders,
        users,
        emailLogs,
        currentUser,
        isAdminLoggedIn,
        activeHold,
        currentView,
        setCurrentView,
        setCurrentUser,
        syncUsersToCloud,
        syncCoursesToCloud,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser,
        loginAsAdmin,
        logoutAdmin,
        getAvailableSeats,
        startReservationHold,
        releaseReservationHold,
        createOrder,
        cancelOrRefundOrder,
        checkInTicket,
        addCourse,
        updateCourse,
        deleteCourse,
        addSession,
        updateSession,
        deleteSession,
        exportAttendeesCsv,
        resetToSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
