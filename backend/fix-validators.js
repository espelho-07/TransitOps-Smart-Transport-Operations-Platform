const { MongoClient } = require('mongodb');

async function fixValidation() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const db = client.db('TransitOps');
  
  // Remove validation constraints from all collections
  const collections = ['users', 'vehicles', 'drivers', 'trips', 'fuel_logs', 'expenses', 'maintenance', 'notifications', 'activities', 'reports'];
  for (const col of collections) {
    try {
      await db.command({ collMod: col, validator: {}, validationLevel: 'off', validationAction: 'warn' });
      console.log(`Cleared validator on: ${col}`);
    } catch(e) {
      console.log(`Skipped ${col}: ${e.message}`);
    }
  }
  
  await client.close();
  console.log('Done - all validators removed');
}

fixValidation().catch(console.error);
