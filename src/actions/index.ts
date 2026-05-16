'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { clearSessionCookie, createSessionCookie, getSession } from '@/lib/auth';
import { generateLandInsights } from '@/lib/ai';
import { redirect } from 'next/navigation';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['LANDOWNER', 'FARMER', 'INVESTOR']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  });
  if (!parsed.success) throw new Error('Invalid signup details');

  const { name, email, password, role } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, role, passwordHash, isVerified: false },
  });

  await createSessionCookie({ sub: user.id, role: user.role });
  return user;
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: 'Invalid login details' };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) return { error: 'Invalid email or password' };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: 'Invalid email or password' };

  await createSessionCookie({ sub: user.id, role: user.role });
  return { success: true, user };
}

export async function logout() {
  await clearSessionCookie();
  revalidatePath('/');
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function submitLandListing(data: FormData) {
  const name = data.get('name') as string;
  const location = data.get('location') as string;
  const sizeAcres = parseFloat(data.get('sizeAcres') as string);
  if (isNaN(sizeAcres) || sizeAcres <= 0) {
    throw new Error('Land size must be a positive number greater than 0');
  }
  const ownerId = data.get('ownerId') as string;
  const latitudeRaw = data.get('latitude') as string | null;
  const longitudeRaw = data.get('longitude') as string | null;
  const latitude = latitudeRaw ? Number(latitudeRaw) : null;
  const longitude = longitudeRaw ? Number(longitudeRaw) : null;

  const ai = await generateLandInsights({
    location,
    sizeAcres,
    latitude: Number.isFinite(latitude as any) ? (latitude as number) : null,
    longitude: Number.isFinite(longitude as any) ? (longitude as number) : null,
  });
  const insights = {
    soilType: ai.soilType,
    suitableCrops: ai.suitableCrops.join(', '),
    estBudget: ai.estBudget,
    estYield: ai.estYield,
    pesticides: ai.pesticides.join(', '),
  };

  await prisma.land.create({
    data: {
      name,
      location,
      sizeAcres,
      ownerId,
      latitude: Number.isFinite(latitude as any) ? (latitude as number) : undefined,
      longitude: Number.isFinite(longitude as any) ? (longitude as number) : undefined,
      ...insights,
    },
  });

  revalidatePath('/dashboard/landowner');
}

export async function getLands() {
  return prisma.land.findMany({
    include: { owner: true, renter: true, updates: { orderBy: { createdAt: 'desc' } } },
    orderBy: { location: 'asc' },
  });
}

export async function rentLand(landId: string, renterId: string) {
  await prisma.land.update({
    where: { id: landId },
    data: { status: 'RENTED', renterId },
  });
  revalidatePath('/dashboard/farmer');
}

export async function createInvestment(landId: string, investorId: string, amount: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${appUrl}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landId, investorId, amount }),
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => null)) as any;
  const url = json?.url as string | undefined;
  if (!res.ok || !url) throw new Error(json?.error || 'Unable to start checkout');
  redirect(url);
}

export async function getInvestments() {
  return prisma.investment.findMany({
    include: { 
      land: {
        include: { updates: { orderBy: { createdAt: 'desc' } } }
      }, 
      investor: true 
    },
  });
}

export async function postUpdate(landId: string, title: string, content: string, imageUrl?: string) {
  await prisma.projectUpdate.create({
    data: {
      landId,
      title,
      content,
      imageUrl,
    }
  });
  revalidatePath('/dashboard/farmer');
  revalidatePath('/dashboard/investor');
}

export async function listOtherUsers() {
  const me = await getCurrentUser();
  if (!me) throw new Error('Unauthorized');
  return prisma.user.findMany({
    where: { id: { not: me.id } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, role: true, avatarUrl: true, isVerified: true },
  });
}

export async function getConversation(withUserId: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error('Unauthorized');

  const withUser = await prisma.user.findUnique({
    where: { id: withUserId },
    select: { id: true, name: true, role: true, avatarUrl: true, isVerified: true },
  });
  if (!withUser) throw new Error('User not found');

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me.id, receiverId: withUserId },
        { senderId: withUserId, receiverId: me.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });

  return { me, withUser, messages };
}

export async function sendMessage(toUserId: string, content: string) {
  const me = await getCurrentUser();
  if (!me) throw new Error('Unauthorized');

  const text = content.trim();
  if (!text) throw new Error('Message is empty');

  await prisma.message.create({
    data: {
      senderId: me.id,
      receiverId: toUserId,
      content: text,
    },
  });

  revalidatePath('/messages');
  revalidatePath(`/messages?to=${toUserId}`);
}

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me) throw new Error('Unauthorized');
  if (me.role !== 'ADMIN') throw new Error('Forbidden');
  return me;
}

export async function adminListUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: [{ name: 'asc' }, { id: 'desc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      bio: true,
      isVerified: true,
    },
  });
}

export async function adminSetUserVerified(userId: string, isVerified: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isVerified } });
  revalidatePath('/admin');
}

export async function adminSetUserRole(userId: string, role: string) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin');
}

export async function adminListLands() {
  await requireAdmin();
  return prisma.land.findMany({
    orderBy: { location: 'asc' },
    include: { owner: true, renter: true, investments: true, updates: true },
  });
}

export async function adminSetLandStatus(landId: string, status: string) {
  await requireAdmin();
  await prisma.land.update({ where: { id: landId }, data: { status } });
  revalidatePath('/admin');
}

export async function adminListMessages() {
  await requireAdmin();
  return prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      receiver: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function adminDeleteMessage(messageId: string) {
  await requireAdmin();
  await prisma.message.delete({ where: { id: messageId } });
  revalidatePath('/admin');
}

export async function adminMarketOverview() {
  await requireAdmin();

  const [
    userTotal,
    landTotal,
    landAvailable,
    landRented,
    landSuspended,
    investmentPaidTotal,
    investmentPaidSum,
    paymentPaidSum,
    paymentPaidCount,
    payoutPaidSum,
    payoutPaidCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.land.count(),
    prisma.land.count({ where: { status: 'AVAILABLE' } }),
    prisma.land.count({ where: { status: 'RENTED' } }),
    prisma.land.count({ where: { status: 'SUSPENDED' } }),
    prisma.investment.count({ where: { status: 'PAID' } }),
    prisma.investment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payout.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payout.count({ where: { status: 'PAID' } }),
  ]);

  return {
    users: { total: userTotal },
    lands: {
      total: landTotal,
      available: landAvailable,
      rented: landRented,
      suspended: landSuspended,
    },
    investments: {
      paidCount: investmentPaidTotal,
      paidAmount: investmentPaidSum._sum.amount ?? 0,
    },
    payments: {
      paidCount: paymentPaidCount,
      paidAmount: paymentPaidSum._sum.amount ?? 0,
    },
    payouts: {
      paidCount: payoutPaidCount,
      paidAmount: payoutPaidSum._sum.amount ?? 0,
    },
  };
}

export async function adminRecentActivity() {
  await requireAdmin();

  const [recentPayments, recentInvestments, recentUpdates] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        investor: { select: { id: true, name: true, email: true } },
        land: { select: { id: true, name: true, location: true } },
      },
    }),
    prisma.investment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        investor: { select: { id: true, name: true, email: true } },
        land: { select: { id: true, name: true, location: true } },
      },
    }),
    prisma.projectUpdate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        land: { include: { owner: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  return { recentPayments, recentInvestments, recentUpdates };
}

export async function resetPasswordMock(formData: FormData) {
  const email = formData.get('email') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!email || !newPassword) return { error: 'Email and new password are required' };
  if (newPassword.length < 8) return { error: 'Password must be at least 8 characters' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'If this email exists, the password will be updated (user not found for prototyping)' };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  });

  return { success: true };
}

export async function getAIContext() {
  const [landCount, userCount, investmentCount] = await Promise.all([
    prisma.land.count({ where: { status: 'AVAILABLE' } }),
    prisma.user.count(),
    prisma.investment.count({ where: { status: 'PAID' } }),
  ]);

  return {
    availableLands: landCount,
    totalUsers: userCount,
    successfulInvestments: investmentCount,
    marketStatus: landCount > 5 ? 'High Activity' : 'Stable',
  };
}

export async function adminBroadcastMessage(content: string) {
  const me = await requireAdmin();
  const allUsers = await prisma.user.findMany({
    where: { id: { not: me.id } },
    select: { id: true }
  });

  const messagePromises = allUsers.map(user => 
    prisma.message.create({
      data: {
        senderId: me.id,
        receiverId: user.id,
        content: content.trim()
      }
    })
  );

  await Promise.all(messagePromises);
  revalidatePath('/messages');
  return { success: true, count: allUsers.length };
}

export async function sendRentalRequest(landId: string, message: string) {
  const me = await getCurrentUser();
  if (!me || me.role !== 'FARMER') throw new Error('Only farmers can request rentals');

  await prisma.rentalRequest.create({
    data: {
      landId,
      farmerId: me.id,
      message,
    }
  });

  revalidatePath('/');
  revalidatePath('/dashboard/farmer');
}

export async function getRentalRequestsForOwner() {
  const me = await getCurrentUser();
  if (!me || me.role !== 'LANDOWNER') return [];

  return prisma.rentalRequest.findMany({
    where: {
      land: { ownerId: me.id },
      status: 'PENDING'
    },
    include: {
      land: true,
      farmer: { select: { name: true, email: true, isVerified: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function handleRentalRequest(requestId: string, status: 'APPROVED' | 'REJECTED') {
  const me = await getCurrentUser();
  if (!me || me.role !== 'LANDOWNER') throw new Error('Unauthorized');

  const request = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { land: true }
  });

  if (!request || request.land.ownerId !== me.id) throw new Error('Request not found');

  await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status }
  });

  if (status === 'APPROVED') {
    await prisma.land.update({
      where: { id: request.landId },
      data: { 
        status: 'RENTED',
        renterId: request.farmerId
      }
    });
  }

  revalidatePath('/');
  revalidatePath('/dashboard/landowner');
  revalidatePath('/dashboard/farmer');
}
