const mongoose = require('mongoose');
const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Board = require('./models/Board');
const Channel = require('./models/Channel');
const Document = require('./models/Document');
const config = require('./config');

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected for Seeding.');

    // Clear existing data
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Board.deleteMany({});
    await Channel.deleteMany({});
    await Document.deleteMany({});

    // Create Demo User
    const user = await User.create({
      name: 'Demo Admin',
      email: 'admin@pulsespace.com',
      password: 'Password123!'
    });
    console.log(`Created User: ${user.email} (Password: Password123!)`);

    // Create Demo Workspace
    const workspace = await Workspace.create({
      name: 'Engineering Hub',
      slug: 'engineering-hub',
      description: 'Primary engineering and product development workspace',
      owner: user._id,
      members: [{ user: user._id, role: 'OWNER' }]
    });
    console.log(`Created Workspace: ${workspace.name}`);

    // Create Default Board with Lists & Cards
    const board = await Board.create({
      workspace: workspace._id,
      title: 'Product Roadmap',
      lists: [
        {
          title: 'Backlog',
          position: 0,
          cards: [
            { title: 'Setup CI/CD Pipeline', description: 'GitHub actions setup', position: 0, labels: ['DevOps'] }
          ]
        },
        {
          title: 'In Progress',
          position: 1,
          cards: [
            { title: 'MongoDB Aggregations', description: 'Optimize search queries', position: 0, labels: ['Backend'] }
          ]
        },
        {
          title: 'Done',
          position: 2,
          cards: [
            { title: 'JWT Authentication', description: 'Token blacklisting with Redis', position: 0, labels: ['Security'] }
          ]
        }
      ]
    });
    console.log(`Created Board: ${board.title}`);

    // Create Default General Channel
    await Channel.create({
      workspace: workspace._id,
      name: 'general',
      description: 'Workspace-wide general discussion',
      isPrivate: false,
      members: [user._id]
    });
    console.log('Created General Channel');

    // Create Default Knowledge Spec Document
    await Document.create({
      workspace: workspace._id,
      title: 'Architecture Overview Spec',
      author: user._id,
      content: '# System Architecture\nPulseSpace integrates Knowledge Hub, Workflow Boards, and Stream Sync.'
    });
    console.log('Created Spec Document');

    console.log('\n--- SEED COMPLETED SUCCESSFULLY ---');
    console.log('Demo Login Credentials:');
    console.log('Email: admin@pulsespace.com');
    console.log('Password: Password123!\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
