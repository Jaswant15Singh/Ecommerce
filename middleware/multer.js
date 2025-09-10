const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const crypto = require('crypto');  // For generating a random 4-digit string
const { imagePublicPath } = require('../helper/constant');


const file_utils = {
  DeleteFile: (file_path) => {
    if (!file_path) {
      console.log('A File is not present');
      return;
    }
    
    const fullPath = path.join(__dirname, '../public', file_path);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err.message}`);
        return;
      }
      console.log(`File deleted: ${file_path}`);
    });
  }
};


class FileUploader {
  constructor() {
    const uploadFolder = path.join(__dirname, '../public/uploads');
    
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    const folders = [
      'category_image',
      'product_image',
      'product_image_two',
      'product_image_three',
      'blog_image',
      'banner_image',
      'batch_image',
      'brand_image'
    ];

    folders.forEach(folder => {
      const folderPath = path.join(uploadFolder, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });

    const storage = multer.diskStorage({
      destination: function (req, file, callBack) {
        const destinationMap = {
          'category_image': 'category_image',
          'product_image': 'product_image',
          'product_image_two': 'product_image_two',
          'product_image_three': 'product_image_three',
          'blog_image': 'blog_image',
          'banner_image': 'banner_image',
          'batch_image':'batch_image',
          'brand_image':'brand_image'
        };        
        const folderName = destinationMap[file.fieldname] || '';
        const targetFolder = folderName ? path.join(uploadFolder, folderName) : uploadFolder;
        callBack(null, targetFolder);
      },

      filename: function (req, file, callBack) {
        const filenamePrefix = moment().format('YYYYMMDDHHmmss');
        console.log("nondisk1",file);
        // Generate a random 4-digit string
        const randomString = crypto.randomInt(1000, 10000); // Random 4-digit number

        // Construct the filename with random string + timestamp
        const filename = `${randomString}-${filenamePrefix}${path.extname(file.originalname)}`;

        // Store the filename in the req.body to use it in the database insertion
        req.body.filename = req.body.filename || {};
        req.body.filename[file.fieldname] = req.body.filename[file.fieldname] || [];
        req.body.filename[file.fieldname].push(imagePublicPath[file.fieldname] + filename);

        callBack(null, filename);
      }
    });

    this.upload = multer({ storage: storage });
  }
}

module.exports = { FileUploader, file_utils };
