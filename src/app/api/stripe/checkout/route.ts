import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  landId: z.string().min(1),
  investorId: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { landId, investorId, amount } = parsed.data;
  const land = await prisma.land.findUnique({ where: { id: landId } });
  const investor = await prisma.user.findUnique({ where: { id: investorId } });
  if (!land || !investor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: investor.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `Investment in ${land.name}`,
            description: `${land.location} • ${land.sizeAcres} acres`,
          },
        },
      },
    ],
    success_url: `${appUrl}/dashboard/investor?paid=1`,
    cancel_url: `${appUrl}/dashboard/investor?canceled=1`,
    metadata: {
      landId,
      investorId,
      amount: String(amount),
    },
  });

  await prisma.payment.create({
    data: {
      provider: 'STRIPE',
      providerRef: session.id,
      status: 'CREATED',
      amount,
      currency: 'usd',
      investorId,
      landId,
    },
  });

  return NextResponse.json({ url: session.url });
}

