// const mongoose = require('mongoose')
// mongoose.connect('mongodb://127.0.0.1:27017/registerform')
// .then(()=>{
//     console.log("connected")
// }).catch((error)=>{
//     console.log(error)
// })

const mongoose = require('mongoose');

// MongoDB Atlas connection string
const atlasUri = 'mongodb+srv://kplevies1972:SzaJ43ZyiMh3KRNr@cluster0.1xk0svv.mongodb.net/nerittProject?retryWrites=true&w=majority';

mongoose.connect(atlasUri)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB Atlas:", error);
  });

// mongodb+srv://kplevies1972:*****@cluster0.1xk0svv.mongodb.net/