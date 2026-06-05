const admin = require('firebase-admin');
const eventCatalog = require('../src/mocks/eventCatalog2026.json');

const toStartDate = (value) => new Date(`${value}T00:00:00+09:00`);
const toEndDate = (value) => new Date(`${value}T23:59:59+09:00`);
const getDetailImage = (event) =>
  event.detailImage ??
  (event.bannerImage?.includes('/events/2026/') && event.bannerImage.endsWith('-banner.webp')
    ? event.bannerImage.replace('-banner.webp', '-detail.webp')
    : event.bannerImage);

const mockEvents = eventCatalog.map((event) => ({
  ...event,
  detailImage: getDetailImage(event),
  startDate: toStartDate(event.startDate),
  endDate: toEndDate(event.endDate),
  createdAt: toStartDate(event.createdAt),
  updatedAt: toStartDate(event.updatedAt),
}));

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'hebimall',
  });
}

const db = admin.firestore();

async function seedEvents() {
  try {
    console.log('Seeding events...');

    const batch = db.batch();
    const eventsCollection = db.collection('events');

    for (const event of mockEvents) {
      const { id, createdAt, updatedAt, startDate, endDate, ...eventData } = event;
      const docRef = eventsCollection.doc(id);

      batch.set(docRef, {
        ...eventData,
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        createdAt: admin.firestore.Timestamp.fromDate(createdAt),
        updatedAt: admin.firestore.Timestamp.fromDate(updatedAt),
      }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully upserted ${mockEvents.length} events`);

    mockEvents.forEach((event) => {
      console.log(`${event.title} (${event.eventType})`);
      console.log(
        `  기간: ${event.startDate.toLocaleDateString()} ~ ${event.endDate.toLocaleDateString()}`
      );
      console.log(`  상태: ${event.isActive ? '활성' : '비활성'}`);
      console.log(`  참여자: ${event.participantCount.toLocaleString()}명`);
      console.log('');
    });
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

async function main() {
  await seedEvents();
  console.log('Event seeding completed.');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { seedEvents, mockEvents };
