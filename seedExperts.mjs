// One-time script to seed static experts into Firestore
// Run with: node seedExperts.mjs  (from /Users/tinman/Projects/LifeLog/web2)
import admin from '/Users/tinman/Projects/LifeLog/node_modules/firebase-admin/lib/index.js';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('/Users/tinman/Projects/LifeLog/lifelog-f2904-b5d58f4dfdec.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const experts = [
  { name: 'Alice',   title: 'Dietitian',  specialties: 'Nutrition',        costPerReview: '$15', avatarEmoji: '👩‍⚕️' },
  { name: 'Bob',     title: 'Therapist',  specialties: 'CBT',              costPerReview: '$20', avatarEmoji: '🧠' },
  { name: 'Carlos',  title: 'Coach',      specialties: 'Life Coaching',    costPerReview: '$10', avatarEmoji: '👨‍💼' },
  { name: 'Diana',   title: 'Dietitian',  specialties: 'Sports Nutrition', costPerReview: '$18', avatarEmoji: '🥗' },
  { name: 'Eve',     title: 'Trainer',    specialties: 'Fitness',          costPerReview: '$12', avatarEmoji: '🏋️' },
  { name: 'Frank',   title: 'Coach',      specialties: 'Career',           costPerReview: '$14', avatarEmoji: '👨‍💼' },
  { name: 'Grace',   title: 'Therapist',  specialties: 'Family Therapy',   costPerReview: '$22', avatarEmoji: '🧑‍⚕️' },
  { name: 'Heidi',   title: 'Dietitian',  specialties: 'Pediatrics',       costPerReview: '$16', avatarEmoji: '👩‍⚕️' },
  { name: 'Ivan',    title: 'Other',      specialties: 'Wellness',         costPerReview: '$8',  avatarEmoji: '🧘' },
  { name: 'Judy',    title: 'Trainer',    specialties: 'Yoga',             costPerReview: '$11', avatarEmoji: '🧘' },
  { name: 'Karl',    title: 'Dietitian',  specialties: 'Diabetes',         costPerReview: '$17', avatarEmoji: '💊' },
  { name: 'Liam',    title: 'Coach',      specialties: 'Executive',        costPerReview: '$19', avatarEmoji: '👨‍💼' },
  { name: 'Mallory', title: 'Therapist',  specialties: 'Trauma',           costPerReview: '$25', avatarEmoji: '🧠' },
  { name: 'Niaj',    title: 'Other',      specialties: 'Mindfulness',      costPerReview: '$9',  avatarEmoji: '🧘' },
  { name: 'Olivia',  title: 'Dietitian',  specialties: 'Weight Loss',      costPerReview: '$13', avatarEmoji: '👩‍⚕️' },
  { name: 'Peggy',   title: 'Coach',      specialties: 'Relationships',    costPerReview: '$12', avatarEmoji: '👩‍💼' },
  { name: 'Quentin', title: 'Trainer',    specialties: 'Strength',         costPerReview: '$15', avatarEmoji: '🏋️' },
  { name: 'Rupert',  title: 'Therapist',  specialties: 'Anxiety',          costPerReview: '$21', avatarEmoji: '🧠' },
  { name: 'Sybil',   title: 'Dietitian',  specialties: 'Geriatrics',       costPerReview: '$16', avatarEmoji: '👩‍⚕️' },
  { name: 'Trent',   title: 'Other',      specialties: 'Sleep',            costPerReview: '$10', avatarEmoji: '👤' },
  { name: 'Uma',     title: 'Dietitian',  specialties: 'Digestive Health', costPerReview: '$18', avatarEmoji: '🥗' },
  { name: 'Victor',  title: 'Coach',      specialties: 'Motivation',       costPerReview: '$11', avatarEmoji: '👨‍💼' },
  { name: 'Walter',  title: 'Trainer',    specialties: 'Cardio',           costPerReview: '$13', avatarEmoji: '🏋️' },
  { name: 'Xavier',  title: 'Therapist',  specialties: 'Depression',       costPerReview: '$23', avatarEmoji: '🧠' },
  { name: 'Yvonne',  title: 'Dietitian',  specialties: 'Prenatal',         costPerReview: '$17', avatarEmoji: '👩‍⚕️' },
  { name: 'Zara',    title: 'Coach',      specialties: 'Wellness',         costPerReview: '$10', avatarEmoji: '🧘' },
];

async function seed() {
  for (const expert of experts) {
    const id = `static_${expert.name.toLowerCase()}`;
    await db.collection('experts').doc(id).set({
      ...expert,
      isExpert: true,
      bio: '',
      contactEmail: '',
      website: '',
      uid: id,
    });
    console.log(`✅ Seeded: ${expert.name}`);
  }
  console.log('\n🎉 All experts seeded to Firestore!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
