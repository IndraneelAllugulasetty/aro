import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: 'Missing webhook secret' }, { status: 400 });

  const stripe = getStripe();
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency: if we recorded this event already, ignore.
  const existing = await prisma.payment.findFirst({ where: { rawEventId: event.id } });
  if (existing) return NextResponse.json({ received: true });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const sessionId = session.id as string;

    const payment = await prisma.payment.findUnique({ where: { providerRef: sessionId } });
    if (!payment) return NextResponse.json({ received: true });

    const landId = session.metadata?.landId as string | undefined;
    const investorId = session.metadata?.investorId as string | undefined;
    const amount = Number(session.metadata?.amount);

    if (!landId || !investorId || !Number.isFinite(amount)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', rawEventId: event.id },
      });
      return NextResponse.json({ received: true });
    }

    const investment = await prisma.investment.create({
      data: {
        landId,
        investorId,
        amount,
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        rawEventId: event.id,
        investmentId: investment.id,
      },
    });
  } else {
    // Record the event ID on any matching payment if present, to prevent reprocessing.
    const obj = event.data.object as any;
    const providerRef = typeof obj?.id === 'string' ? obj.id : null;
    if (providerRef) {
      await prisma.payment.updateMany({
        where: { providerRef, rawEventId: null },
        data: { rawEventId: event.id },
      });
    }
  }

  return NextResponse.json({ received: true });
}

