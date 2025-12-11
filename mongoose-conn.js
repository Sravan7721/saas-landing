// mongoose-conn.js
const mongoose = require('mongoose');

const uri = 'mongodb+srv://USERNAME:ENCODED_PASSWORD@cluster0.jgi1ntm.mongodb.net/yourDB?retryWrites=true&w=majority';

async function connect() {
  try {
    await mongoose.connect(uri, {
      // options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 10000, // optional
    });
    console.log('Mongoose connected');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Mongoose connection error:', err);
    process.exit(1);
  }
}

connect();
