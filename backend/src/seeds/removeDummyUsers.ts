import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';

async function removeDummyUsers() {
  try {
    console.log('[Remove Dummy Data] Connecting to database...');
    await connectDatabase();

    console.log('[Remove Dummy Data] Deleting dummy users...');
    const result = await User.deleteMany({ email: { $regex: /^dummy\.user/ } });
    
    console.log(`[Remove Dummy Data] ✅ Successfully removed ${result.deletedCount} dummy users!`);
  } catch (error) {
    console.error('[Remove Dummy Data Error]', error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
    process.exit();
  }
}

removeDummyUsers();
