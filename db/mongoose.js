const mongoose = require('mongoose');

const atlasUri = 'mongodb+srv://kplevies1972:SzaJ43ZyiMh3KRNr@cluster0.1xk0svv.mongodb.net/nerittProject?retryWrites=true&w=majority';

mongoose.connect(atlasUri)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB Atlas:", error);
  });