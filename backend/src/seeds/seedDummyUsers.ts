import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

async function seedDummyUsers() {
  try {
    console.log('[Dummy Seed] Connecting to database...');
    await connectDatabase();

    // 1. Get or create a default "User" role
    let userRole = await Role.findOne({ name: 'User' });
    if (!userRole) {
      userRole = await Role.create({
        name: 'User',
        description: 'Standard user role',
        permissions: ['READ_DASHBOARD'],
      });
      console.log('[Dummy Seed] Created default User role.');
    }

    // 2. Hash a generic password once for performance
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Generate 1000 users
    console.log('[Dummy Seed] Generating 1000 dummy users...');
    const dummyUsers = [];
    
    const firstNames = ['Aarav', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Anaya', 'Aryan', 'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Mia', 'Robert', 'Emma', 'Rahul', 'Priya', 'Amit'];
    const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Desai', 'Joshi', 'Chauhan', 'Shah', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];

    for (let i = 1; i <= 1000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const isActive = Math.random() > 0.3; // 70% active, 30% inactive
      
      dummyUsers.push({
        name: `${firstName} ${lastName} ${i}`,
        email: `dummy.user${i}.${Date.now()}@example.com`,
        password: hashedPassword,
        role: userRole._id,
        isActive: isActive,
        phone: `+9198765${String(i).padStart(5, '0')}`,
      });
    }

    // 4. Insert users
    console.log('[Dummy Seed] Inserting 1000 users into database (this might take a few seconds)...');
    await User.insertMany(dummyUsers);
    
    console.log('[Dummy Seed] ✅ Successfully inserted 1000 dummy users!');
    console.log('[Dummy Seed] You can login using any email (e.g. dummy.user1... ) and password: password123');

  } catch (error) {
    console.error('[Dummy Seed Error]', error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    process.exit();
  }
}

seedDummyUsers();
