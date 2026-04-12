'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock function for AI soil/crop prediction
function generateMockAIInsights(location: string) {
  const possibleSoils = ['Loamy', 'Clay', 'Sandy', 'Silt'];
  const possibleCropsList = [
    ['Wheat', 'Corn', 'Soybeans'],
    ['Cotton', 'Peanuts'],
    ['Rice', 'Sugarcane'],
    ['Tomatoes', 'Potatoes', 'Carrots'],
  ];
  const possiblePesticides = [
    'Glyphosate, Atrazine',
    'Organophosphates, Pyrethroids',
    'Neonicotinoids, Fungicides',
  ];

  const hash = location.length; // Fake randomizer
  const soilType = possibleSoils[hash % possibleSoils.length];
  const suitableCrops = possibleCropsList[hash % possibleCropsList.length].join(', ');
  const estBudget = (hash * 1500) % 10000 + 2000;
  const estYield = estBudget * 1.6; // 60% ROI prediction
  const pesticides = possiblePesticides[hash % possiblePesticides.length];

  return { soilType, suitableCrops, estBudget, estYield, pesticides };
}

// Ensure mock users exist
export async function seedMockUsers() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    await prisma.user.createMany({
      data: [
        { name: 'John Doe (Owner)', email: 'john@owner.com', role: 'LANDOWNER' },
        { name: 'Alice Smith (Farmer)', email: 'alice@farmer.com', role: 'FARMER' },
        { name: 'Bob Capital (Investor)', email: 'bob@invest.com', role: 'INVESTOR' },
      ],
    });
  }
}

export async function submitLandListing(data: FormData) {
  const name = data.get('name') as string;
  const location = data.get('location') as string;
  const sizeAcres = parseFloat(data.get('sizeAcres') as string);
  const ownerId = data.get('ownerId') as string; // Usually from session

  // Generate AI Insights based on location
  const insights = generateMockAIInsights(location);

  await prisma.land.create({
    data: {
      name,
      location,
      sizeAcres,
      ownerId,
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
  await prisma.investment.create({
    data: {
      landId,
      investorId,
      amount,
    },
  });
  revalidatePath('/dashboard/investor');
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

export async function getUsers() {
  await seedMockUsers();
  return prisma.user.findMany();
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
