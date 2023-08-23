const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
     {
          name: {
               type : String,
          },
          path : {
               type : String,
          }
     },
     {
          timestamps : true,
     }
)
const File =  mongoose.model('File',FileSchema); 
module.exports = File;