import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Unsplash images
const avatarUrls = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
];

const landImages = [
  "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1508546594248-c8751bf878d6?auto=format&fit=crop&q=80&w=800"
];

async function main() {
  console.log('Fetching users and lands...');
  const users = await prisma.user.findMany();
  const lands = await prisma.land.findMany();

  // Update Users
  for (let i = 0; i < users.length; i++) {
    await prisma.user.update({
      where: { id: users[i].id },
      data: {
        avatarUrl: avatarUrls[i % avatarUrls.length],
        bio: `Experienced ${users[i].role.toLowerCase()} who believes in sustainable and scalable agriculture. Let's make farming better together.`,
        isVerified: true
      }
    });
  }

  // Update Lands
  for (let i = 0; i < lands.length; i++) {
    await prisma.land.update({
      where: { id: lands[i].id },
      data: {
        imageUrl: landImages[i % landImages.length],
        latitude: 31.9686 + (Math.random() - 0.5), // fake near Texas somewhere 
        longitude: -99.9018 + (Math.random() - 0.5)
      }
    });
  }

  // Add dummy milestone to the first rented land if possible
  const rentedLand = lands.find(l => l.status === 'RENTED');
  if (rentedLand && rentedLand.renterId) {
    // Check if it already has updates to avoid dupes on accidental rerun
    const count = await prisma.projectUpdate.count({ where: { landId: rentedLand.id } });
    if (count === 0) {
      await prisma.projectUpdate.create({
        data: {
          landId: rentedLand.id,
          title: "Initial Seeding Completed",
          content: "We have fully seeded the primary 50-acre block with the premium soybeans we discussed in our budget plan.",
          imageUrl: "https://images.unsplash.com/photo-1595185966395-fc7183eec152?auto=format&fit=crop&q=80&w=800"
        }
      })
    }
  }

  console.log('Seed update completed! Users and Lands have dummy media/bio.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
