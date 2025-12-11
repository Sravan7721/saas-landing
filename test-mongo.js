require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("OK CONNECTED"); process.exit(0); })
  .catch((err) => { console.error("ERROR:", err); process.exit(1); });
