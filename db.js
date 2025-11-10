const mongoose = require('mongoose')
const mongoURI = "mongodb+srv://developers:He11o-W0rld@decipher-insights.sumr1.mongodb.net/?retryWrites=true&w=majority&appName=decipher-insights"

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectToMongo;
