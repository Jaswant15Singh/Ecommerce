const express = require('express');
const { FileUploader } = require('../middleware/multer'); // Corrected import
const moment = require('moment');
var router = express.Router();
const { hashPassword, isAuthenticated } = require('../helper/utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { file_utils } = require('../middleware/multer');
const { glob } = require('fs');
const { log } = require('console');
const dotenv = require("dotenv").config()
const fileUploader = new FileUploader();
const xlsx = require('xlsx');
const crypto = require("crypto");
const { toWords } = require('number-to-words');
const fontkit = require('fontkit');
const axios=require("axios")

const fs = require("fs");
const os = require("os");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const nodemailer = require("nodemailer");
const { generateInvoiceAndSendEmail,updateDeleiveryPos } = require('../utils/function');
// const user_auth=require("../middleware/user.middleware")

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
});


router.get('/dashboard', isAuthenticated, function (req, res, next) {
  res.render('Admin/dashboard', { title: 'Dashboard', user: req.session.user });
});

router.get('/category', isAuthenticated, function (req, res, next) {
  res.render('Admin/category', { title: 'Category Add', user: req.session.user });
});

router.get('/products', isAuthenticated, function (req, res, next) {
  res.render('Admin/products', { title: 'Products Add', user: req.session.user });
});

router.get('/pos', isAuthenticated, function (req, res, next) {
  res.render('Admin/pos', { title: 'Point of sale', user: req.session.user });
});
router.get('/producttype', isAuthenticated, function (req, res, next) {
  res.render('Admin/producttype', { title: 'Product Type Creation', user: req.session.user });
});

router.get('/blogs', isAuthenticated, function (req, res, next) {
  res.render('Admin/blogs', { title: 'Blogs Add', user: req.session.user });
});
router.get('/banner', isAuthenticated, function (req, res, next) {
  res.render('Admin/banner', { title: 'Banners Add', user: req.session.user });
});
router.get('/order_details', isAuthenticated, function (req, res, next) {
  res.render('Admin/order_details', { title: 'Order Details', user: req.session.user });
});
router.get('/customerservice', isAuthenticated, function (req, res, next) {
  res.render('Admin/customerservice', { title: 'Customer Service', user: req.session.user });
});
router.get('/customers', isAuthenticated, function (req, res, next) {
  res.render('Admin/customers', { title: 'Customers', user: req.session.user });
});
router.get('/customerreview', isAuthenticated, function (req, res, next) {
  res.render('Admin/customerreview', { title: 'Customer Review', user: req.session.user });
});
router.get("/deletedproducts", isAuthenticated, (req, res, next) => {
  res.render("Admin/deletedproduct", { title: "Deleted Products" })
})
router.get("/receipt",async(req,res)=>{
  res.render("Admin/receipt",{title:"Receipt"})
})
router.get("/flavour",async(req,res)=>{
  res.render("Admin/flavour",{title:"Flavour"})
})
router.get("/brand",async(req,res)=>{
  res.render("Admin/brand",{title:"Flavour"})
})
router.get('/ind_orders/:id', isAuthenticated, async function (req, res, next) {
  const { id } = req.params;
  const result = await global.Database.executeQuery(`select o.order_status,o.deleivery_status from order_def o inner join order_items_def oi on o.id=oi.order_id where oi.order_id =$1 limit 1;`, [id]);
  let showButton = true;
  
  
  if (result.length > 0 && (result[0].order_status === 'PENDING' || result[0].order_status === 'FAILED')) {
    showButton = false;
  }


  res.render('Admin/ind_orders', { title: 'Individual Order Details', user: req.session.user, result, showButton });
});


router.post('/create-category', isAuthenticated, fileUploader.upload.single('category_image'), async (req, res) => {
  try {
    const { category_name ,visibility} = req.body;
    const category_image = req.body.filename ? req.body.filename['category_image'][0] : null;
    if (!category_name || !category_image) {
      return res.status(400).json({ message: 'Missing fields' });
    }
    const isCategory = await global.Database.executeQuery('SELECT * FROM category_def where category_name =$1', [category_name]);

    if (isCategory.length > 0) {
      return res.status(200).json({ success: false, message: "Category already exists" })
    }
    const InsertCategory = await global.Database.executeQuery(
      "INSERT INTO category_def (category_name, category_image, inserted_by, inserted_date,visibility) VALUES ($1, $2, $3, NOW(),$4) returning *",
      [category_name, category_image, 1,visibility]
    );


    const UpdateLog = await global.Database.executeQuery(
      "INSERT INTO category_def_log (category_def_id, category_name, category_image, inserted_by, inserted_date,visibility) VALUES ($1, $2, $3, $4, NOW(),$5)",
      [InsertCategory[0].id, category_name, category_image, 1,visibility]
    );
    res.json({ message: "Category Created Successfully", success: true });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }

});

router.put("/update-cat/:id", isAuthenticated, fileUploader.upload.single('category_image'), async (req, res) => {
  try {
    const { category_name ,visibility} = req.body;
    const { id } = req.params;

    const isCategory = await global.Database.executeQuery('SELECT * FROM category_def where category_name =$1 and id<>$2 ', [category_name, id]);

    if (isCategory.length > 0) {
      return res.status(200).json({ success: false, message: "Category already exists" })
    }
    const fileDetails = req.body.filename ? req.body.filename['category_image'][0] : null;
    const GetImagePath = await global.Database.executeQuery("Select * from category_def cd where cd.id = $1",
      [id]
    )
    const PreviousImage = fileDetails
      ? fileDetails
      : GetImagePath[0].category_image;

    const Update = await global.Database.executeQuery(
      "UPDATE category_def SET category_name = $1,updated_date=$2, category_image = $3,visibility=$4 WHERE id = $5 ",
      [category_name, new Date(), PreviousImage,visibility, id]
    );

    const UpdateLog = await global.Database.executeQuery(
      "INSERT INTO category_def_log (category_def_id, category_name, category_image, updated_by, updated_date,visibility) VALUES ($1, $2, $3, $4, NOW(),$5)",
      [id, category_name, PreviousImage, 1,visibility]
    );
    // try {
    //   if (fileDetails) DeleteFile(GetImagePath[0].category_image);
    // } catch (error) {
    //   return res.json({success:false})
    // }

    if (fileDetails) file_utils.DeleteFile(GetImagePath[0].category_image);

    res.json({ message: "Category has been updated", success: true });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

router.get('/getproduct', isAuthenticated, (req, res) => {
  global.Database.executeQuery('SELECT * FROM product_def')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});

router.post(
  '/create-product', fileUploader.upload.fields([
    { name: 'product_image', maxCount: 1 },
    { name: 'product_image_two', maxCount: 1 },
    { name: 'product_image_three', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let {
        product_name,
        type,
        category_id,
        brand_id,
        featured,
        product_description,
        health_benefits,
        in_stock,
        seo
      } = req.body;
      if(!brand_id){
        brand_id=null
      }
      const trimmedProductName = product_name.trim();
      const isProduct = await global.Database.executeQuery('SELECT * FROM product_def where LOWER(product_name) =LOWER($1)', [trimmedProductName]);

      if (isProduct.length > 0) {
        return res.status(200).json({ success: false, message: "Product already exists" })
      }

      const product_image = req.body.filename?.product_image?.[0] || "";
      const product_image_two = req.body.filename?.product_image_two?.[0] || "";
      const product_image_three = req.body.filename?.product_image_three?.[0] || "";

      let query = `
      INSERT INTO product_def 
      (product_name, product_description, 
       product_image, product_image_two, product_image_three, inserted_date, category_id, 
       featured, health_benefits, type, seo,brand_id)`;

      let params = [
        trimmedProductName,
        product_description,
        product_image,
        product_image_two,
        product_image_three,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        category_id,
        featured || false,
        health_benefits || null,
        type,
        seo,
        brand_id
      ];

 
      if (type === 'UNITS') {
        query += `, in_stock`;
        params.push(in_stock || 0);
      }

      query += ` VALUES (` + params.map((_, i) => `$${i + 1}`).join(", ") + `) RETURNING *;`;

      const result = await global.Database.executeQuery(query, params);
      let product_id = result[0].id;
      if (type === "UNITS") {
        if (!in_stock) {
          return res.json({ success: false, message: "Kindly enter stock" })
        }
        const instock_data = await global.Database.executeQuery('INSERT INTO inventory_def (product_id, batch_id, in_stock, inserted_by, inserted_date) values ($1, NULL, $2, 1, now()) returning in_stock', [product_id, in_stock]);
        const log_instock = Number(instock_data[0].in_stock);
        await global.Database.executeQuery('INSERT INTO product_batch_details_log (product_id, inserted_date, inserted_by, in_stock) values ($1, now(), $2, $3)', [result[0].id, 1, log_instock]);
      }

      await global.Database.executeQuery(`
        INSERT INTO product_def_log 
        (product_def_id, category_id, product_name, product_description,  
          product_image, product_image_two, product_image_three, 
         featured, health_benefits, inserted_by, inserted_date, seo) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), $11)`, 
        [result[0].id, category_id, trimmedProductName, product_description, product_image, product_image_two, product_image_three, featured || false, health_benefits || null, 1, seo]);

      const updateProductCode = `
        UPDATE product_def 
        SET product_code = $1 
        WHERE id = $2 `;

      await global.Database.executeQuery(updateProductCode, [
        'PH100' + result[0].id,
        result[0].id
      ]);

      res.json({
        message: 'Product created successfully.',
        data: result[0],
        success: true,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        message: 'Error occurred while creating product',
        error: error.message,
      });
    }
  }
);

router.put("/update-product/:id", fileUploader.upload.fields([
  { name: 'product_image', maxCount: 1 },
  { name: 'product_image_two', maxCount: 1 },
  { name: 'product_image_three', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      type,
      product_type_subname,
      in_stock,
      featured,
      category_id,
      brand_id,
      health_benefits,
      operation,
      amount,
      batch_data,
      seo
    } = req.body;
    
    const { id } = req.params;
    const isProduct = await global.Database.executeQuery(
      'SELECT * FROM product_def WHERE product_name = $1 AND id <> $2',
      [product_name, id]
    );

    if (isProduct.length > 0) {
      return res.status(200).json({ success: false, message: "Product already exists" });
    }

    const GetImagePath = await global.Database.executeQuery(
      "SELECT * FROM product_def WHERE id = $1",
      [id]
    );

    if (GetImagePath.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }


    const prevImage1 = GetImagePath[0]?.product_image;
    const prevImage2 = GetImagePath[0]?.product_image_two;
    const prevImage3 = GetImagePath[0]?.product_image_three;

    const newImage1 = req.files?.product_image
      ? req.files.product_image[0].path.replace(/^.*?uploads[\\/]/, 'uploads/').replace(/\\/g, "/")
      : prevImage1;

    const newImage2 = req.files?.product_image_two
      ? req.files.product_image_two[0].path.replace(/^.*?uploads[\\/]/, 'uploads/').replace(/\\/g, "/")
      : prevImage2;

    const newImage3 = req.files?.product_image_three
      ? req.files.product_image_three[0].path.replace(/^.*?uploads[\\/]/, 'uploads/').replace(/\\/g, "/")
      : prevImage3;

    const currentStock = parseFloat(GetImagePath[0].in_stock);
    const amounts = parseFloat(amount) || 0;
    let newStockValue = operation === 'credit' ? currentStock + amounts : currentStock - amounts;
    let newStockValues = Math.max(newStockValue, 0);



    const Update = await global.Database.executeQuery(
      `UPDATE product_def 
       SET product_name = $1, product_description = $2,  featured = $3, category_id = $4, 
           product_image = $5, updated_date = $6, health_benefits = $7, 
           type = $8, product_type_subname = $9, product_image_two = $10, 
           product_image_three = $11,seo=$12,brand_id=$13 
       WHERE id = $14 RETURNING *`,
      [product_name, product_description, featured,
        category_id, newImage1, new Date(), health_benefits, type, product_type_subname,
        newImage2, newImage3,seo, brand_id,id]
    );

    await global.Database.executeQuery(`
      INSERT INTO product_def_log 
      (product_def_id, category_id, product_name, product_description,  
        product_image, product_image_two, product_image_three, 
       featured, health_benefits, updated_by, updated_date,seo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(),$11) 
      
    `, [Update[0].id,
      category_id,
      product_name,
      product_description,
      newImage1,
      newImage2,
      newImage3,
    featured || false,
    health_benefits || null,
      1,seo])
    // await global.Database.executeQuery(
    //   `INSERT INTO product_def_log 
    //    (product_def_id, category_id, product_name, product_description, mrp_price, 
    //     product_price, in_stock, product_image, featured, updated_by, updated_date, 
    //     health_benefits, operation, in_hand_stock, count_change, previous_stock) 
    //    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, $13, $14, $15)`,
    //   [id, category_id, product_name, product_description, mrp, prod_price,
    //     newStockValues, newImage1, featured, 1, health_benefits, operation,
    //     newStockValues, amounts, currentStock]
    // );

    try {
      if (newImage1 !== prevImage1 && prevImage1) file_utils.DeleteFile(prevImage1);
      if (newImage2 !== prevImage2 && prevImage2) file_utils.DeleteFile(prevImage2);
      if (newImage3 !== prevImage3 && prevImage3) file_utils.DeleteFile(prevImage3);
    } catch (error) {
      console.error("File deletion error:", error);
    }

    res.json({ message: "Product has been updated", success: true, Update });

  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).json({ message: "Error occurred", error: error });
  }
});

router.post("/update_delievery/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const deleivery_result = await global.Database.executeQuery('update deleivery_def set deleivery_status =$1,updated_date =$2 where order_id=$3', ["SUCCESS", new Date(), id]);
    const order_result = await global.Database.executeQuery('update order_def set deleivery_status =$1,delivery_date=$2 where id=$3', ["SUCCESS", new Date(), id]);

    res.json({ message: "Status Updated" })
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})

router.get("/delivery_status/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await global.Database.executeQuery('SELECT * FROM deleivery_def where order_id=$1', [id]);

    res.json(result)
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})

module.exports = router;


router.post('/create-admin', async (req, res) => {
  const { user_name, password, email, phone_no, address, pincode } = req.body;

  if (!user_name || !password || !email || !phone_no || !address || !pincode) {
    return res.status(400).json({ message: 'All fields (user_name, password, email, phone_no, address, pincode) are required.' });
  }
  const hashedPassword = await hashPassword(password);
  const query = `
    INSERT INTO admin_def (user_name, password, email, phone_no, address, pincode)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_name, email, phone_no, address, pincode;
  `;
  const params = [user_name, hashedPassword, email, phone_no, address, pincode];

  try {
    const result = await global.Database.executeQuery(query, params);
    const newUser = result[0];

    res.json({ message: 'User created successfully.', data: newUser });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred while creating user', error: error.message });
  }
});




router.post('/login', async (req, res, next) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(500).json({ message: 'Both username and password are required' });
  }

  const query = 'SELECT * FROM admin_def WHERE user_name = $1';
  try {
    const result = await global.Database.executeQuery(query, [user_name]);

    if (result.length === 0) {
      return res.status(500).json({ message: 'User not found' });
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(500).json({ message: 'Please Enter Correct Password' });
    }

    const token = jwt.sign(
      { userId: user.id, userName: user.user_name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );
    req.session.user = user;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      redirectUrl: '/admin/dashboard',
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred while processing login', error: error.message });
  }
});

// Assuming you're using express-session
router.post('/logout', (req, res) => {
  if (req.session && req.session.user) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to logout');
      }

      res.clearCookie('connect.sid'); // Clear the session cookie
      res.status(200).send('Logged out successfully');
    });
  } else {
    res.status(400).send('No active session');
  }
});


router.post("/create-user", async (req, res, next) => {
  const { user_name, phone_no, email, password } = req.body;
  if (!user_name || !phone_no || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields (username, phone no, email and password) are required." })
  }

  const isEmailPresent = await global.Database.executeQuery('select * from user_def where email=$1', [email]);

  if (isEmailPresent.length > 0) {
    return res.status(400).json({ success: false, message: "User exists with this email" })
  }

  const isContackPresent = await global.Database.executeQuery('select * from user_def where phone_no=$1', [phone_no]);

  if (isContackPresent.length > 0) {
    return res.status(400).json({ success: false, message: "User exists with this Contact" })
  }
  const hashPass = await hashPassword(password);
  try {
    const result = await global.Database.executeQuery('INSERT INTO user_def (user_name,phone_no,email,password) values ($1,$2,$3,$4) returning user_name,phone_no,email', [user_name, phone_no, email, hashPass]);
    const user = result[0]
    const token = jwt.sign({ userId: user.id, userName: user.user_name, userEmail: user.user_email, userContact: user.phone_no },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1hr" }
    )
    res.json({ success: true, message: "User has been created", data: user, token, redirectUrl: "/" })
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error });
  }

})

router.post("/user-login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" })
  }

  try {
    const user = await global.Database.executeQuery('SELECT * FROM User_def where email=$1', [email]);

    if (user.length < 1) {
      return res.status(401).json({ success: false, message: "User doesnt exists" });
    }

    const userPass = user[0];

    const isPasswordValid = await bcrypt.compare(password, userPass.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Incorrect Password" });
    }

    const token = jwt.sign({ userName: userPass.user_name, userEmail: userPass.user_email, userContact: userPass.phone_no },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1hr" }
    )

    res.status(200).json({ success: true, message: "Logged in successfully", token, redirectUrl: "/" })

  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error });
  }
})

// router.post("/user-forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ success: false, message: "Email field missing." });
//     }

//     const result = await global.Database.executeQuery('SELECT * FROM user_def where email = $1', [email]);
//     if (result.length < 1) {
//       return res.status(401).json({ success: false, message: "User with email doesnt exists." });
//     }
//     const user = result[0];
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//     await global.Database.executeQuery('UPDATE user_def set token=$1', [hashedToken]);

//     var transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'singhjaswant0932@gmail.com'
//       }
//     });
//     const resetLink = `http://localhost:5559/reset-password/${resetToken}`;

//     await transporter.sendMail({
//       from: 'singhjaswant0932@gmail.com',
//       to: 'singhjaswant0932@gmail.com',
//       subject: 'Password Reset Request',
//       html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
//     });
//     res.status(200).json({ success: true, message: 'Password reset email sent successfully!' });

//   } catch (error) {
//     console.error('Database error:', error.message);
//     return res.status(500).json({ message: 'Error occurred', error: error });
//   }
// })

router.get('/get/category/Admin', isAuthenticated, (req, res) => {
  global.Database.executeQuery('SELECT * FROM category_def order by inserted_date desc')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});


router.post('/get/calendar_category/Admin', isAuthenticated, (req, res) => {
  const { start_date, end_date } = req.body;
  global.Database.executeQuery('SELECT * FROM category_def  where DATE(inserted_date) between $1 and $2 order by inserted_date', [start_date, end_date])
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});

router.get('/get/product/Admin', isAuthenticated, (req, res) => {
  global.Database.executeQuery('SELECT * FROM product_def where visibility = TRUE order by inserted_date desc')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});
router.post('/get/calendar_product/Admin', isAuthenticated, (req, res) => {
  const { start_date, end_date } = req.body;

  global.Database.executeQuery('SELECT * FROM product_def where Date(inserted_date) between $1 and $2 order by inserted_date', [start_date, end_date])
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});
router.get("/get/orders/Admin", isAuthenticated, async (req, res, next) => {
  global.Database.executeQuery(`select o.id,pg.order_id ,c.customer_name,c.customer_email,c.customer_contact,c.customer_address,
c.customer_pincode, o.total_price,o.order_status,o.deleivery_status,o.inserted_date,o.delivery_date,pg.payment_mode ,
pg.transaction_id,pg.payment_channel 
from order_def o inner join customer_def c on o.customer_id=c.id 
inner join payment_gateway pg on pg.booking_id = o.id order by inserted_date desc`)
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
})


router.post("/get/calendar_orders/Admin", isAuthenticated, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: "start_date and end_date are required." });
    }

    const query = `
      SELECT 
        o.id,
        c.customer_name,
        c.customer_email,
        c.customer_contact,
        o.total_price,
        o.order_status,
        o.deleivery_status,
        o.inserted_date
      FROM order_def o
      INNER JOIN customer_def c ON o.customer_id = c.id
      WHERE Date(o.inserted_date) BETWEEN $1 AND $2
      order by o.inserted_date
    `;

    const result = await global.Database.executeQuery(query, [start_date, end_date]);

    res.json({ data: result });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});


router.get("/get/pdf-orders/Admin/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params;
  global.Database.executeQuery(`
    SELECT cd.customer_name,cd.customer_contact,cd.customer_email,cd.customer_address,cd.customer_pincode,od.inserted_date,od.id,od.total_price 
    FROM order_def od 
    INNER JOIN order_items_def oid2 ON oid2.order_id = od.id 
    INNER JOIN customer_def cd ON cd.id = od.customer_id 
    WHERE od.id = $1 limit 1` , [id])
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
})
router.get("/get/recent-orders/Admin", isAuthenticated, async (req, res, next) => {
  global.Database.executeQuery('select o.id ,c.customer_name,c.customer_email,c.customer_contact,o.total_price,o.order_status,o.deleivery_status,o.inserted_date from order_def o inner join customer_def c on o.customer_id =c.id order by o.inserted_date desc limit 5')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
})

router.get("/get/ind_orders/Admin/:id", isAuthenticated, async (req, res, next) => {
  const { id } = req.params
  global.Database.executeQuery(`
   SELECT 
            p.product_name,
              pbd.label_name,
            p.product_image,
            oi.price AS item_price,
            oi.total_price AS item_total_price,
            oi.quantity,
            oi.order_time,
            od.order_status,
            coalesce (fd.flavour_name,'NA') as flavour_name
        FROM 
            order_items_def oi 
        INNER JOIN 
            product_def p ON oi.product_id = p.id 
            inner join product_batch_details pbd on oi.batch_id =pbd.id
         left join 
         	flavour_def fd on fd.id=pbd.flavour_id 
          inner join 
            order_def od on od.id =oi.order_id
        WHERE 
            oi.order_id =  $1; 
    
  `, [id])
    .then(result => {

      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});


router.get('/generate-excel-order', async (req, res) => {
  try {
    // Fetch orders from the database
    const orders = await global.Database.executeQuery(`
      SELECT od.id as orderId, od.customer_id, c.customer_contact, od.total_price, od.order_status as payment_status, od.inserted_by, od.inserted_date, od.deleivery_status, od.delivery_date 
      FROM order_def od 
      INNER JOIN customer_def c ON od.customer_id = c.id 
      ORDER BY inserted_date
    `);

    if (!orders || orders.length === 0) {
      return res.status(404).send('No orders found.');
    }

    // Format the order data
    const formattedOrders = orders.map((order) => ({
      ...order,
      inserted_date: order.inserted_date ? formatDate(order.inserted_date) : null,
      delivery_date: order.delivery_date ? formatDate(order.delivery_date) : null,
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(formattedOrders);

    // Adjust column widths dynamically
    const columnWidths = Object.keys(formattedOrders[0]).map((key) => {
      const maxLength = formattedOrders.reduce((max, row) => {
        const cellValue = row[key] ? row[key].toString() : '';
        return Math.max(max, cellValue.length);
      }, key.length); // Include header length as well
      return { wch: maxLength + 2 }; // Add padding for better spacing
    });

    worksheet['!cols'] = columnWidths;

    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a buffer
    const excelFile = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=PahaduiRasyan.xlsx');
    res.setHeader('Content-Type', 'application/octet-stream');

    res.send(excelFile);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating Excel file');
  }
});


router.get('/generate-excel-all', async (req, res) => {
  try {
    const orders = await global.Database.executeQuery(`
          SELECT oi.order_id, c.customer_name, c.customer_email, c.customer_contact, c.customer_address, c.customer_pincode, p.product_name, oi.quantity, oi.price, o.order_status as payment_status, o.deleivery_status, oi.order_time, o.delivery_date  
          FROM order_items_def oi 
          INNER JOIN product_def p ON oi.product_id = p.id 
          INNER JOIN order_def o ON oi.order_id = o.id
          INNER JOIN customer_def c ON o.customer_id = c.id
          ORDER BY oi.order_id DESC
      `);

    if (!orders || orders.length === 0) {
      return res.status(404).send('No orders found.');
    }

    const formattedOrders = orders.map((order) => ({
      ...order,
      order_time: order.order_time ? formatDate(order.order_time) : null,
      delivery_date: order.delivery_date ? formatDate(order.delivery_date) : null,
    }));

    // Create a new workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(formattedOrders);

    // Calculate column widths
    const columnWidths = Object.keys(formattedOrders[0]).map((key) => {
      const maxLength = formattedOrders.reduce((max, row) => {
        const cellValue = row[key] ? row[key].toString() : '';
        return Math.max(max, cellValue.length);
      }, key.length); // Consider header length
      return { wch: maxLength + 2 }; // Add some padding
    });

    // Apply column widths
    worksheet['!cols'] = columnWidths;

    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const excelFile = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.setHeader('Content-Type', 'application/octet-stream');

    res.send(excelFile);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating Excel file');
  }
});


router.get('/individual-excel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch orders from the database
    const orders = await global.Database.executeQuery(`
      SELECT 
        oi.order_id,
        c.customer_name,
        c.customer_email,
        c.customer_contact,
        c.customer_address,
        c.customer_pincode,
        p.product_name,
        oi.quantity,
        oi.price ,  
        o.order_status as payment_status,
        o.deleivery_status,
        oi.order_time,
        o.delivery_date
      FROM 
        order_items_def oi 
      INNER JOIN 
        product_def p ON oi.product_id = p.id 
      INNER JOIN 
        order_def o ON oi.order_id = o.id
      INNER JOIN 
        customer_def c ON o.customer_id = c.id
      WHERE 
        oi.order_id = $1 
      ORDER BY 
        oi.order_id DESC;
    `, [id]);

    if (!orders || orders.length === 0) {
      return res.status(404).send('No orders found.');
    }

    // Format the order data
    const formattedOrder = orders.map((order) => ({
      ...order,
      order_time: order.order_time ? formatDate(order.order_time) : null,
      delivery_date: order.delivery_date ? formatDate(order.delivery_date) : null,
    }));

    // Create a new workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(formattedOrder);

    // Dynamically adjust column widths
    const columnWidths = Object.keys(formattedOrder[0]).map((key) => {
      const maxLength = formattedOrder.reduce((max, row) => {
        const cellValue = row[key] ? row[key].toString() : '';
        return Math.max(max, cellValue.length);
      }, key.length); // Include the header length
      return { wch: maxLength + 2 }; // Add padding
    });

    // Apply column widths
    worksheet['!cols'] = columnWidths;

    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Write the workbook to a buffer
    const excelFile = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=order_${id}.xlsx`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send the generated Excel file
    res.send(excelFile);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Error generating Excel file');
  }
});
// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  // Format the date to 'YYYY-MM-DD HH:mm:ss'
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.post("/create_blog", isAuthenticated, fileUploader.upload.single('blog_image'), async (req, res) => {
  try {
    const { blog_header, blog_content, blog_visibility } = req.body;
    const blog_image = req.body.filename ? req.body.filename['blog_image'][0] : null;
    if ( !blog_header || !blog_content) {
      return res.status(401).json({ success: false, message: "missing fields" })
    }

    await global.Database.executeQuery('INSERT INTO blogs (blog_image,blog_header,blog_content,created_date,blog_visibility) VALUES ($1,$2,$3,now(),$4)',
      [blog_image, blog_header, blog_content, blog_visibility]
    )
    res.json({ success: true, message: "Blog has been created successfully" });

  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error });
  }
});

router.put("/update_blogs/:id", isAuthenticated, fileUploader.upload.single('blog_image'), async (req, res) => {
  try {
    const { blog_header, blog_content, blog_visibility } = req.body;
    const { id } = req.params;

    const fileDetails = req.body.filename ? req.body.filename['blog_image'][0] : null;
    const GetImagePath = await global.Database.executeQuery("Select * from blogs cd where cd.id = $1",
      [id]
    )
    const PreviousImage = fileDetails
      ? fileDetails
      : GetImagePath[0].blog_image;

    const Update = await global.Database.executeQuery(
      "UPDATE blogs SET blog_header = $1,updated_date=$2, blog_image = $3,blog_content=$4,blog_visibility=$5 WHERE id = $6 ",
      [blog_header, new Date(), PreviousImage, blog_content, blog_visibility, id]
    );

    res.json({ message: "Blog has been updated", success: true });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
});
router.get('/get/blogs/Admin', isAuthenticated, (req, res) => {
  global.Database.executeQuery('SELECT * FROM blogs order by created_date desc')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});

router.get("/search-blogs", isAuthenticated, async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const result = await global.Database.executeQuery(
      'SELECT * FROM blogs WHERE LOWER(blog_header) LIKE LOWER($1)',
      [`%${search}%`]
    );

    res.json(result);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/ind_blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await global.Database.executeQuery('SELECT * FROM blogs where id =$1', [id]);
    res.status(200).json({ data: result[0] })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message })

  }
})
router.post("/create_banner", isAuthenticated, fileUploader.upload.single('banner_image'), async (req, res) => {
  try {
    const {banner_hidden}=req.body;
    const bannerImage = req.body.filename ? req.body.filename['banner_image'][0] : null;
    await global.Database.executeQuery('INSERT INTO promotional_def (promotional_image,banner_hidden) values ($1,$2)', [bannerImage,banner_hidden]);
    res.json({ success: true, message: "Banner created successfully" })
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})

router.get("/get/banner/Admin", isAuthenticated, async (req, res) => {
  try {
    global.Database.executeQuery('SELECT * FROM promotional_def order by created_date')
      .then(result => {
        const datas = result;
        res.json({ data: datas });
      })
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})

router.put("/update_banner/:id", isAuthenticated, fileUploader.upload.single('banner_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {banner_hidden}=req.body;
    const fileDetails = req.body.filename ? req.body.filename['banner_image'][0] : null;
    const GetImagePath = await global.Database.executeQuery("Select * from promotional_def cd where cd.id = $1",
      [id]
    )
    const PreviousImage = fileDetails
      ? fileDetails
      : GetImagePath[0].promotional_image;

    const Update = await global.Database.executeQuery(
      "UPDATE promotional_def SET promotional_image = $1,updated_date = $2,banner_hidden=$3 WHERE id = $4 ",
      [PreviousImage, new Date(),banner_hidden, id]
    );

    res.json({ message: "Banner has been updated", success: true });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

router.post("/create_product_type", isAuthenticated, async (req, res) => {
  try {
    const { label_name, batch_quantity, quantity } = req.body;
    const data = await global.Database.executeQuery("INSERT INTO product_unit(label_name,batch_quantity,quantity) VALUES ($1,$2,$3) returning *", [label_name, batch_quantity, quantity]);
    res.json({ success: true, message: "successful", data })
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
});

router.put("/update_Product_type/:id", isAuthenticated, async (req, res) => {
  try {
    const { label_name, batch_quantity, quantity } = req.body;
    const { id } = req.params

    await global.Database.executeQuery('UPDATE product_unit set label_name=$1,batch_quantity=$2,quantity=$3 where id=$4', [label_name, batch_quantity, quantity, id])
    res.status(200).json({ success: true, message: "Product type has been updated" })
  } catch (error) {

  }
})
router.get("/get_product_type", isAuthenticated, async (req, res) => {
  try {
    const data = await global.Database.executeQuery("SELECT * FROM product_unit order by batch_quantity");
    res.json({ data: data })
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})

router.get("/get_units_prices/:product_id", isAuthenticated, async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const data = await global.Database.executeQuery('Select mrp,discount_price,label_name,batch_quantity,id as batch_id from product_batch_details where product_id =$1', [product_id])
      ;
    res.status(200).json(data)
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})

router.get("/scheduler", async (req, res) => {
  try {
    const result = await global.Database.executeQuery(`
     SELECT od.id as order_id,pd.type,id.in_stock, od.order_status, oi.product_id, oi.batch_id, oi.quantity AS order_quantity, 
      COALESCE(CAST(pbd.batch_quantity AS NUMERIC), 1) AS batch_quantity,  (CAST(oi.quantity AS NUMERIC) * COALESCE(CAST(pbd.batch_quantity AS NUMERIC), 1)) AS returned_value 
      FROM order_def od
      INNER JOIN order_items_def oi ON oi.order_id = od.id
      LEFT JOIN product_batch_details pbd ON pbd.product_id = oi.product_id AND pbd.id = oi.batch_id
      INNER JOIN product_def pd ON pd.id = pbd.product_id OR oi.product_id = pd.id
      LEFT JOIN inventory_def id 
      ON (pd.type = 'PIECES' AND id.batch_id = pbd.id) 
      OR (pd.type <> 'PIECES' AND id.product_id = pd.id)
      WHERE od.order_status IN ('PENDING', 'FAILED') 
      AND od.quantity_return = 'false'`
    );
    
    for (const row of result) {
      const { order_id, product_id, returned_value,type,batch_id } = row;
      
      // await global.Database.executeQuery(
      //   "UPDATE public.product_def SET in_stock = in_stock + $1 WHERE id = $2;",
      //   [returned_value, product_id]
      // );

      if(type==="UNITS"){
       await global.Database.executeQuery(`UPDATE inventory_def SET in_stock = in_stock + $1 WHERE product_id = $2;`,
        [returned_value, product_id]
       )
      }
      else{
       await global.Database.executeQuery(`UPDATE inventory_def SET in_stock = in_stock + $1 WHERE batch_id = $2;`,
        [returned_value, batch_id]
       )
      }

      await global.Database.executeQuery(
        "UPDATE public.order_def SET quantity_return = TRUE WHERE id = $1;",
        [order_id]
      );

    }
    res.json({ message: "Success" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
});



router.get("/get_customer_service", async (req, res) => {
  try {
    const result = await global.Database.executeQuery('SELECT * FROM customer_service_def order by inserted_date desc');
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})

router.get("/get_customers", async (req, res) => {
  try {
    const result = await global.Database.executeQuery('SELECT * FROM customer_def');
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})


router.get("/get_customer_review", async (req, res) => {
  try {
    const result = await global.Database.executeQuery('SELECT * FROM customer_review order by inserted_date desc');
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
})

router.get("/ind_review/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await global.Database.executeQuery('SELECT * FROM customer_review where id =$1', [id]);
    res.status(200).json({ data: result[0] })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message })

  }
})

router.put("/update_review/:id", isAuthenticated, async (req, res) => {
  try {
    const { visiblity } = req.body;
    const { id } = req.params;

    const result = await global.Database.executeQuery('UPDATE customer_review set visiblity = $1 where id =$2', [visiblity, id])

    res.json({ message: "Visibility has been changed", success: true });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.status(500).json({ message: "Error occurred", error: error.message });
  }
});




router.get("/emailsending/:order_id", async (req, res) => {
  // const downloadsPath = path.join(os.homedir(), "Downloads");

  try {
    const order_id = req.params.order_id;
    const invoiceDir = "public/invoice";
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
    // Fetch order details from the database
    const data = await global.Database.executeQuery(
      `Select od2.id ,od.id ,concat(cd.customer_address,',',cd.customer_pincode) as address,od2.order_time ,cd.customer_name ,cd.customer_contact,concat(pd.product_name ,coalesce(Concat(' ',fd.flavour_name),''))as product_name,
        od2.quantity ,coalesce(pbd.label_name,'1Pc') as label_name ,od2.price ,od2.total_price ,pd.product_code
        from order_def od 
        inner join order_items_def od2 on
        od2.order_id = od.id
        inner join product_def pd on 
        pd.id = od2.product_id
        inner join product_batch_details pbd on
        pbd.id = od2.batch_id 
        left join flavour_def fd on
        fd.id =pbd.flavour_id 
        inner join customer_def_log cd on
        cd.id = od.new_customer_id 
        WHERE od.id= ${order_id} order by od2.id desc `
    );

    if (data.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = data[0]; // Customer details
    const pdfPath = "public/mail-template/invoice.pdf"; // Template PDF
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];

    pdfDoc.registerFontkit(fontkit);

    const fontBytes = fs.readFileSync('public/font/TiroDevanagariMarathi-Regular.ttf');

    const font = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBytes);
    const fontSize = 10;
    // **Header (Invoice & Customer Details)**


    page.drawText(`${order.id}`, { x: 552, y: 637, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText(`${new Intl.DateTimeFormat("en-GB").format(new Date(order.order_time))}`, { x: 515, y: 623, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText("Bill to:", { x: 10, y: 675, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    page.drawText(`${order.customer_name}`, { x: 11, y: 660, size: 11, font: fontBold, color: rgb(0, 0, 0) });
    page.drawText("Contact:", { x: 10, y: 645, size: 10, font: fontBold, color: rgb(0, 0, 0) });

    page.drawText(`${order.customer_contact}`, { x: 55, y: 645, size: 11, font, color: rgb(0, 0, 0) });
    // page.drawText(order.address.slice(0, 20), { x: 12, y: 632, size: 11, font, color: rgb(0, 0, 0) });
    const maxLineLength = 35; // Maximum characters per line
    const address = order.address;
    const addressLines = [];

    for (let i = 0; i < address.length; i += maxLineLength) {
      addressLines.push(address.substring(i, i + maxLineLength));
    }

    let yPosition = 630; // Starting y position
    addressLines.forEach(line => {
      page.drawText(line, { x: 11, y: yPosition, size: 9, font, color: rgb(0, 0, 0) });
      yPosition -= 14; // Adjust y position for the next line
    });

    // **Table Header (Aligned Properly)**
    const headerY = 570;
    const colX = { no: 10, name: 40, code: 220, qty: 330, batchQty: 400, price: 450, total: 530 };
    // **Product List**


    let currentPage = pdfDoc.getPages()[0]; // Start with the first page
    let y = headerY - 20; // Initial Y-position for product list
    minY = 100; // Minimum space before adding a new page

    data.forEach((item, index) => {
      // If Y-position goes below minY, create a new page
      if (y < minY) {
        currentPage = pdfDoc.addPage([576, 792]); // Create new A4 page
        y = 750; // Reset Y-position for new page
        // Re-draw table headers on the new page

        y -= 20; // Move down for content
      }

      currentPage.drawText((index + 1).toString(), { x: colX.no, y, size: fontSize, font, color: rgb(0, 0, 0) });

      // **Handle Wrapped Product Name**
      const productLines = item.product_name.match(/.{1,20}/g) || [];
      let currentY = y;

      productLines.forEach((line, i) => {
        currentPage.drawText(line, { x: colX.name, y: currentY - i * 12, size: fontSize, characterSpacing: 1, font, color: rgb(0, 0, 0) });
      });

      // Adjust Y for the rest of the row
      const maxNameHeight = (productLines.length - 1) * 12;
      currentPage.drawText(item.product_code, { x: colX.code, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(item.quantity.toString(), { x: colX.qty, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(`${item.label_name}`, { x: colX.batchQty, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(` ${item.price}`, { x: colX.price, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });
      currentPage.drawText(` ${item.total_price}`, { x: colX.total, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) });

      // Reduce Y for next item
      y -= 20 + maxNameHeight;
    });

    // **Total Calculation**
    const totalAmount = data.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const totalquantity = data.reduce((sum, item) => sum + parseFloat(item.quantity.toString()), 0);

    const capitalizedAmountInWords = toWords(totalAmount);
    const totalAmountInWords = capitalizedAmountInWords
      .split(" ") // Split into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
      .join(" "); // Join words back


    // **Dynamically Move Footer Below Last Item**
    const totalHeight = 5; // Approximate height needed for footer
    const availableSpacefortotal = y - minY; // Space left on the current page


    // If there is not enough space, create a new page
    if (availableSpacefortotal < totalHeight) {
      currentPage = pdfDoc.addPage([576, 792]); // Create new page
      y = 750; // Reset Y position for footer placement
    }

    currentPage.drawLine({
      start: { x: 5, y: y - 5 },  // Start from leftmost edge
      end: { x: 570, y: y - 5 },    // Extend to rightmost edge
      thickness: 1,
      color: rgb(0.502, 0.502, 0.502) // Gray (#808080)
    });

    currentPage.drawText(`Total: `, { x: 40, y: y - 20, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText(`Rs ${totalAmount}`, { x: 520, y: y - 20, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText(`${totalquantity}`, { x: 330, y: y - 20, size: 12, font: fontBold, color: rgb(0, 0, 0) });

    currentPage.drawLine({
      start: { x: 5, y: y - 30 },  // Start from leftmost edge
      end: { x: 570, y: y - 30 },   // Extend to rightmost edge
      thickness: 1,
      color: rgb(0.502, 0.502, 0.502) // Gray (#808080),
    });
    // Define minimum space required for the footer section
    const footerHeight = 85; // Approximate height needed for footer
    const availableSpace = y - minY; // Space left on the current page

    // If there is not enough space, create a new page
    if (availableSpace < footerHeight) {
      currentPage = pdfDoc.addPage([576, 792]); // Create new page
      y = 750; // Reset Y position for footer placement
    }

    // **Invoice Amount in Words**
    currentPage.drawText("Invoice Amount In Words:", { x: 10, y: y - 50, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText(`${totalAmountInWords}`, { x: 15, y: y - 70, size: fontSize, font, color: rgb(0, 0, 0) });

    // **Terms and Conditions**
    currentPage.drawText("Terms And Conditions", { x: 10, y: y - 100, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText("Good day, and thank you for choosing ANH Supplements! We", { x: 14, y: y - 122, size: fontSize, font, color: rgb(0, 0, 0) });
    currentPage.drawText("truly appreciate your trust and look forward to serving you", { x: 14, y: y - 134, size: fontSize, font, color: rgb(0, 0, 0) });
    currentPage.drawText("even more in the future", { x: 14, y: y - 147, size: fontSize, font, color: rgb(0, 0, 0) });

    // **Total Calculation Box**
    currentPage.drawRectangle({
      x: 330,
      y: y - 86,
      width: 240,
      height: 20,
      color: rgb(0.976, 0.573, 0.110),
      opacity: 1,
    });
    currentPage.drawText("Sub Total:", { x: 330, y: y - 55, size: 12, font: fontBold, color: rgb(0, 0, 0) });
    currentPage.drawText(`Rs ${totalAmount}`, { x: 530, y: y - 55, size: fontSize, font, color: rgb(0, 0, 0) });

    currentPage.drawText("Total:", {
      x: 335,
      y: y - 80,
      size: 12,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    currentPage.drawText(`Rs ${totalAmount}`, { x: 527, y: y - 78, size: fontSize, font, color: rgb(0, 0, 0) });

    currentPage.drawLine({
      start: { x: 330, y: y - 100 },
      end: { x: 570, y: y - 101 },
      thickness: 2,
      color: rgb(0.502, 0.502, 0.502),
    });

    // **Signature Placement**
    const signImagePath = 'public/mail-template/signature.png';
    const signImageBytes = fs.readFileSync(signImagePath);
    const signImage = await pdfDoc.embedPng(signImageBytes);
    const signImageDims = signImage.scale(0.5);

    // Place signature at the bottom of the current or new page
    currentPage.drawImage(signImage, {
      x: 415,
      y: y - 175,
      width: signImageDims.width,
      height: signImageDims.height
    });



    const pdfBytes = await pdfDoc.save();
    //   const invoicePath = path.join("public/invoice",`invoice_${order_id}.pdf`);
    //   fs.writeFileSync(invoicePath, pdfBytes);
    //   res.json({ downloadUrl: `/invoice/invoice_${order_id}.pdf` });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');
    res.send(Buffer.from(pdfBytes));
      } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating invoice", error: error.message });
  }
});


router.post("/create_batch", fileUploader.upload.array("batch_image",10),async (req, res) => {
  try {
    let { type, product_id, label_name, batch_quantity, discount_price, mrp, in_stock,flavour_id } = req.body;
    if(!flavour_id){
      flavour_id=null;
    }
    const query = `
      INSERT INTO product_batch_details 
      (product_id, label_name, batch_quantity, discount_price, mrp, type,flavour_id) 
      VALUES ($1, $2, $3, $4, $5, $6,$7) 
      RETURNING *`;

    const data = await global.Database.executeQuery(query, [
      product_id,
      label_name,
      batch_quantity,
      discount_price,
      mrp,
      type,
      flavour_id
    ]);
    // await global.Database.executeQuery('INSERT INTO product_batch_details_log (product_id,label_name,batch_quantity,discount_price,mrp,type,inserted_by,inserted_date) VALUES ($1,$2,$3,$4,$5,$6,$7,now())', [product_id, label_name, batch_quantity, discount_price, mrp, type, 1])

    const batch_id = data[0].id;
    if (type === "PIECES") {
      try {
        await global.Database.executeQuery('INSERT INTO inventory_def (product_id,batch_id,in_stock,inserted_by,inserted_date) VALUES ($1,$2,$3,1,now())', [product_id, batch_id, in_stock])

        await global.Database.executeQuery('INSERT INTO product_batch_details_log (product_id,label_name,batch_quantity,discount_price,mrp,type,inserted_by,inserted_date,in_stock,flavour_id) VALUES ($1,$2,$3,$4,$5,$6,$7,now(),$8,$9)', [product_id, label_name, batch_quantity, discount_price, mrp, type, 1, in_stock,flavour_id])
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating batch inventory", error: error.message });
      }
    }
    res.json({ data });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating batch", error: error.message });
  }
})

router.put("/update_batch/:id", async (req, res) => {
  try {
    let { product_id, label_name, batch_quantity, discount_price, mrp ,flavour_id} = req.body;
    const id = req.params.id;
    if(!flavour_id){
      flavour_id=null
    }
    const data = await global.Database.executeQuery("update product_batch_details set label_name = $1 ,batch_quantity=$2,discount_price=$3,mrp=$4,flavour_id=$5 where id =$6", [label_name, batch_quantity, discount_price, mrp,flavour_id, id]);
    await global.Database.executeQuery('INSERT INTO product_batch_details_log (product_id,label_name,batch_quantity,discount_price,mrp,updated_by,updated_date,flavour_id) VALUES ($1,$2,$3,$4,$5,$6,now(),$7)', [product_id, label_name, batch_quantity, discount_price, mrp, 1,flavour_id])
    res.json({ data })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating batch", error: error.message });
  }
})


router.get("/get_batch/:id", async (req, res) => {
  try {
    const id = req.params.id
    const data = await global.Database.executeQuery('SELECT pbd.* from product_batch_details pbd inner join product_def pd on pbd.product_id=pd.id where pbd.product_id = $1 order by pbd.visibility desc', [id]);
    res.json({ data })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching batches", error: error.message });
  }
})

router.get("/get_pieces_batch/:id", async (req, res) => {
  try {
    const id = req.params.id
    const data = await global.Database.executeQuery('SELECT  pbd.*,ind.in_stock FROM product_batch_details pbd INNER JOIN product_def pd ON pbd.product_id = pd.id INNER JOIN inventory_def ind ON pd.id = ind.product_id WHERE pbd.product_id = $1 and pbd.id = ind.batch_id order by pbd.visibility desc', [id]);
    res.json({ data })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching batches", error: error.message });
  }
})

router.put("/delete_batch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Correct SQL query
    const data = await global.Database.executeQuery(
      "UPDATE product_batch_details SET visibility = NOT visibility WHERE id = $1",
      [id]
    );

    res.json({ success: true, data, message: "Successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

// router.get("/get_batch/:id",async(req,res)=>{
//   try {
//     const id=req.params.id
//     const data=await global.Database.executeQuery('SELECT pbd.* from product_batch_details pbd inner join product_def pd on pbd.product_id=pd.id where pbd.product_id = $1',[id]);
//     res.json({data})
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching batches", error: error.message });
//   }
// })
router.put("/delete_product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updateproduct = await global.Database.executeQuery('UPDATE product_def set visibility=FALSE where id=$1', [id]);

    const InsertProductDeleted = await global.Database.executeQuery('INSERT INTO deleted_product (product_id, update_date) VALUES($1, now())', [id]);

    res.status(200).json({ success: true, message: "Product has been deleted" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error While Doing Process", error: error.message });
  }
});
router.put("/restore_product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updateproduct = await global.Database.executeQuery(`UPDATE product_def set visibility= 'TRUE' where id=$1`, [id]);

    res.status(200).json({ success: true, message: "Product has been restored" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error While Doing Process", error: error.message });
  }
});

router.get("/get_deleted_product", async (req, res) => {
  try {
    const result = await global.Database.executeQuery(`
SELECT DISTINCT ON (pd.id) 
    d.id AS deleted_id,
    pd.id AS product_id,
    pd.product_image,
    pd.product_name,
    d.update_date
FROM deleted_product d
INNER JOIN product_def pd 
    ON pd.id = d.product_id
WHERE pd.visibility = 'false'
ORDER BY pd.id, d.update_date DESC;
         `);
    res.status(200).json({ data: result })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error While Getting Data', error: error.message })
  }
});

router.get("/stock_get", isAuthenticated, async (req, res) => {
  try {
    const data = await global.Database.executeQuery(`SELECT distinct on (pbd.product_id)pd.product_name,pd.id,pd.type FROM product_def pd inner join product_batch_details pbd on pd.id=pbd.product_id where pd.visibility = true`);
    res.json({ data })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error While Getting Data', error: error.message })
  }
})

router.get("/units_update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await global.Database.executeQuery('SELECT ind.in_stock from inventory_def ind  where product_id = $1', [id]);
    res.json({ data: data[0] });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error While Getting Data', error: error.message })
  }
})

router.get("/batch_update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await global.Database.executeQuery(`SELECT pbd.id,pbd.label_name,ind.in_stock,coalesce(fd.flavour_name,'') as flavour_name from product_batch_details pbd left join flavour_def fd on fd.id = pbd.flavour_id inner join inventory_def ind on pbd.id=ind.batch_id where ind.product_id =$1`, [id]);
    res.json({ data: data });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error While Getting Data', error: error.message })
  }
})

router.get("/batch_stock/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await global.Database.executeQuery('SELECT ind.in_stock from inventory_def ind  where batch_id = $1', [id]);
    res.json({ data: data[0] });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error While Getting Data', error: error.message })
  }
})

router.post("/stock_update", isAuthenticated, async (req, res) => {
  try {
    const { update_select, batch_stock, amount, operation } = req.body;

    
    const deductedAmount = amount;
    if (!batch_stock) {
      let in_stock=await global.Database.executeQuery('select * from inventory_def where product_id = $1',[update_select]);
      
      let prev_in_stock=Number(in_stock[0].in_stock);
      
      let log_in_stock;
      if (operation === "debit") {
        

        
        
        log_in_stock=prev_in_stock-Number(amount);
        await global.Database.executeQuery('insert into product_batch_details_log (product_id,updated_by,updated_date,in_stock,prev_in_stock,operation,type,amount) values($1,$2,now(),$3,$4,$5,$6,$7)',[update_select,1,log_in_stock,prev_in_stock,operation,'UNITS',Number(amount)])
        await global.Database.executeQuery('UPDATE inventory_def set in_stock = (in_stock - $1) where product_id = $2', [deductedAmount, update_select])

      
      }
      else {

        
        log_in_stock=prev_in_stock+Number(amount);

        
        await global.Database.executeQuery('insert into product_batch_details_log (product_id,updated_by,updated_date,in_stock,prev_in_stock,operation,type,amount) values($1,$2,now(),$3,$4,$5,$6,$7)',[update_select,1,log_in_stock,prev_in_stock,operation,'UNITS',Number(amount)])
        await global.Database.executeQuery('UPDATE inventory_def set in_stock = (in_stock + $1) where product_id = $2', [deductedAmount, update_select])
      }
    }
    else {

      const in_stock=await global.Database.executeQuery('select ind.in_stock,pbd.label_name,pbd.batch_quantity,pbd.discount_price,pbd.mrp from inventory_def ind inner join product_batch_details pbd on ind.batch_id = pbd.id where batch_id = $1',[batch_stock]);
      let prev_in_stock=Number(in_stock[0].in_stock);
      
      let log_in_stock;
      if (operation === "debit") {

        
        
        log_in_stock=prev_in_stock-Number(amount);
        await global.Database.executeQuery('insert into product_batch_details_log (product_id,updated_by,updated_date,in_stock,prev_in_stock,operation,type,amount,label_name,batch_quantity,discount_price,mrp,batch_id) values($1,$2,now(),$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[update_select,1,log_in_stock,prev_in_stock,operation,'PIECES',Number(amount),in_stock[0].label_name,in_stock[0].batch_quantity,in_stock[0].discount_price,in_stock[0].mrp,Number(batch_stock)])

        await global.Database.executeQuery('UPDATE inventory_def set in_stock = (in_stock - $1) where batch_id = $2', [deductedAmount, batch_stock])
      }
      else {
        log_in_stock=prev_in_stock+Number(amount);
        await global.Database.executeQuery('insert into product_batch_details_log (product_id,updated_by,updated_date,in_stock,prev_in_stock,operation,type,amount,label_name,batch_quantity,discount_price,mrp,batch_id) values($1,$2,now(),$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[update_select,1,log_in_stock,prev_in_stock,operation,'PIECES',Number(amount),in_stock[0].label_name,in_stock[0].batch_quantity,in_stock[0].discount_price,in_stock[0].mrp,batch_stock])

        await global.Database.executeQuery('UPDATE inventory_def set in_stock = (in_stock + $1) where batch_id = $2', [deductedAmount, batch_stock])

      }
    }
    return res.json({ success: true, message: "Stock Updated" })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error While Updating Stock', error: error.message })
  }
})

router.get("/pos_products", isAuthenticated, async (req, res) => {
  try {
    const data = await global.Database.executeQuery(`SELECT pbd.id as batch_id,pd.*,
      pbd.discount_price, pbd.mrp, CONCAT(pbd.label_name, ' ', COALESCE(fd.flavour_name, '')) as label_name,
      pbd.batch_quantity,
      CASE WHEN 
      (CASE WHEN pd.type = 'UNITS' 
      THEN (SELECT SUM(ind.in_stock)
      FROM inventory_def ind 
      WHERE ind.product_id = pd.id) ELSE ind.in_stock END) > 0 
      THEN TRUE ELSE FALSE END AS in_stock_status
      FROM product_def pd INNER join
      product_batch_details pbd ON 
      pd.id = pbd.product_id 
      left join flavour_def fd on fd.id =pbd.flavour_id 
      LEFT JOIN inventory_def ind on
      (CASE WHEN pd.type = 'PIECES' 
      THEN ind.batch_id = pbd.id ELSE ind.product_id = pd.id END) 
      WHERE pbd.visibility = TRUE AND pd.visibility = TRUE ORDER BY pd.product_name;
`)
    res.status(200).json({ data })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error getting products', error: error.message })
  }
})

router.get("/pos_customer_details", isAuthenticated, async (req, res) => {
  try {
    const { customer_contact } = req.query;

    const data = await global.Database.executeQuery('select * from customer_def where customer_contact = $1', [customer_contact]);

    if (data.length < 1) {
      return res.status(400).json({ success: false, message: "No such customer" })
    }
    else {
      res.status(200).json({ success: true, data: data[0] })
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error fetching customer data" });
  }
})

router.post("/pos_place_order", async (req, res) => {
  try {
    const {
      customer_id,
      inserted_by,
      customer_name,
      customer_email,
      customer_contact,
      customer_address,
      customer_pincode,
      customer_city,
      customer_state,
      products,
      transaction_id,
      payment_type,
      payment_channel,admin_remark
    } = req.body;
    
    let email;
    let parsedProducts = [];
    
    try {
      parsedProducts = typeof products === 'string' ? JSON.parse(products) : products;
    } catch (error) {
      return res.status(400).json({ message: "Invalid products data format." });
    }

    if (!customer_name || !customer_email || !customer_contact || !customer_address ||
      !customer_pincode || !customer_city || !customer_state) {
      return res.status(400).json({ message: "Invalid input data." });
    }
    let trimmed_order_id;
    let order_def_id;
    await global.Database.getConnection().tx(async t => {
      let customerResult;
      let customerId;
      let new_customer_id;

      customerResult = await t.query(
        "SELECT id,customer_email FROM customer_def WHERE customer_contact = $1",
        [customer_contact]
      );

      if (customerResult.length > 0) {
        const updatedCustomerDetails=await t.query('UPDATE customer_def set customer_name=$1,customer_email=$2,customer_address=$3,customer_pincode=$4,customer_city=$5,customer_state=$6 returning *',[customer_name,customer_email,customer_address,customer_pincode,customer_city,customer_state])
        // customerId = customerResult[0].id;
        customerId=updatedCustomerDetails[0].id
        customerId = customerResult[0].id;
        email=customerResult[0].customer_email;
      } else {
        const insertResult = await t.query(
          `INSERT INTO customer_def (
             customer_name, customer_email, customer_contact, customer_address, 
             customer_pincode, customer_city, customer_state
           ) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id,customer_email`,
          [
            customer_name,
            customer_email,
            customer_contact,
            customer_address,
            customer_pincode,
            customer_city,
            customer_state
          ]
        );
        customerId = insertResult[0].id;
        email=insertResult[0].customer_email;
      }

      const newCustomerInsertResult=await t.query(`INSERT INTO customer_def_log (
        customer_name, customer_email, customer_contact, customer_address, 
        customer_pincode, customer_city, customer_state,inserted_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7,now()) RETURNING id`,
     [
       customer_name,
       customer_email,
       customer_contact,
       customer_address,
       customer_pincode,
       customer_city,
       customer_state
     ]);


    new_customer_id=newCustomerInsertResult[0].id  

      let totalPrice = 0;
      const productsInfo = [];
      parsedProducts.forEach((e) => {
      })
      for (const data of parsedProducts) {

        let productResult;
        let unit_stock = 0;

        if (data.type === "PIECES") {
          unit_stock = data.batch_quantity;
          productResult = await t.query(
            `SELECT ind.in_stock, pb.discount_price as product_price, p.product_name, p.type FROM product_batch_details pb
             INNER JOIN product_def p ON p.id = pb.product_id INNER JOIN inventory_def ind  on ind.product_id = p.id  WHERE pb.id = $1 and pb.id = ind.batch_id`,
            [data.batchId]
          );
        } else {
          unit_stock = data.batch_quantity;
          productResult = await t.query(
            `SELECT ind.in_stock, pb.discount_price as product_price, p.product_name, p.type FROM product_batch_details pb 
            INNER JOIN product_def p ON p.id = pb.product_id inner join inventory_def ind on ind.product_id = p.id
            WHERE pb.id = $1`,
            [data.batchId]
          );
        }

        if (!productResult || productResult.length === 0) {
          throw new Error(`Product not found for ID ${data.id}`);
        }

        const { in_stock, product_price, product_name, type } = productResult[0];


        let totalItemPrice = data.type === "PIECES"
          ? data.quantity * product_price
          : data.quantity * product_price;

        totalPrice += totalItemPrice;

        productsInfo.push({ id: data.id, quantity: data.quantity, price: product_price, totalItemPrice, type: data.type, unit_stock, batchId: data.batchId });
      }
      const orderResult = await t.query(
        `INSERT INTO order_def (customer_id, total_price, order_status,order_address,order_pincode, inserted_date,payment_mode,deleivery_status,delivery_date,new_customer_id)
         VALUES ($1, $2, $3,$4,$5, now(),$6,$7,NOW(),$8) RETURNING id;`,
        [customerId, totalPrice, "SUCCESS", customer_address, customer_pincode,payment_type,"SUCCESS",new_customer_id]
      );
      const orderId = orderResult[0].id;
      trimmed_order_id='ANH' + '10000'+orderId;
      order_def_id=orderId
      // await global.Database.executeQuery('insert into deleivery_def (deleivery_status ,updated_date ,order_id) values ($1,$2,$3)', ["SUCCESS", new Date(), orderId]);      
      await t.query('INSERT INTO public.payment_gateway (name, phone,email, amount, zip_code, customer_id, booking_id,payment_status,order_id,payment_mode,response_message,payment_datetime,response_code,transaction_id,payment_channel,admin_remark,new_customer_id) VALUES ($1, $2, $3, $4, $5, $6,$7,$8,$9,$10,$11,now(),$12,$13,$14,$15,$16) RETURNING id',[customer_name, customer_contact,customer_email, totalPrice, customer_pincode, customerId, orderId,'S',trimmed_order_id,payment_type,'Transaction successful',0,transaction_id,payment_channel,admin_remark,new_customer_id])
      
      for (const { id, quantity, price, totalItemPrice, type, unit_stock, batchId } of productsInfo) {
        await t.query(
          `INSERT INTO order_items_def (order_id, product_id, quantity, price, total_price, order_time, batch_id)
       VALUES ($1, $2, $3, $4, $5, now(), $6);`,
          [orderId, id, quantity, price, totalItemPrice, batchId]
        );

        const deductionAmount = quantity * unit_stock;

        if (type === "PIECES") {
          await t.query(
            `UPDATE inventory_def SET in_stock = in_stock - $1 WHERE batch_id = $2;`,
            [deductionAmount, batchId]
          );
        } else {
          await t.query(
            `UPDATE inventory_def SET in_stock = in_stock - $1 WHERE product_id = $2;`,
            [deductionAmount, id]
          );
        }
      }
    })


     updateDeleiveryPos(order_def_id);
     
     generateInvoiceAndSendEmail(order_def_id,email)
     
    res.status(200).json({ success: true, message: "Order Placed successfully",order_def_id })
  }

  catch (e) {
    res.status(500).json({ success: false, message: "Error placing order" })
  }
})

router.get('/receipt/:order_id', async (req, res) => {
  const order_id = req.params.order_id;

  try {
      // Making API call to emailsending endpoint
      const response = await axios.get(`${url_pathname}admin/emailsending/${order_id}`);

      const receiptData = response.data; 

      res.render('Admin/receipt', { receipt: receiptData });
  } catch (error) {
      console.error('Error fetching receipt:', error);
      res.status(500).send('Error loading receipt');
  }
});


router.post("/create_flavour",async(req,res)=>{
  try {    
    const {flavour_name}=req.body;
    await global.Database.executeQuery('INSERT into flavour_def (flavour_name,created_date) values($1,now())',[flavour_name]);
    res.status(200).json({success:true,message:"Flavour created successfully"})
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).send('Error creating flavour');
  }
})

router.get('/get/flavours/Admin', isAuthenticated, (req, res) => {
  global.Database.executeQuery('SELECT * FROM flavour_def order by created_date desc')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});

router.get("/ind_flavours/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await global.Database.executeQuery('SELECT * FROM flavour_def where id =$1', [id]);
    res.status(200).json({ data: result[0] })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message })

  }
})


router.put("/update_flavour/:id",async(req,res)=>{
  try {    
    const {flavour_name}=req.body;
    const {id}=req.params;
    await global.Database.executeQuery('Update flavour_def set flavour_name = $1,updated_date =now() where id = $2',[flavour_name,id]);
    res.status(200).json({success:true,message:"Flavour Updated  successfully"})
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).send('Error creating flavour');
  }
})


router.post("/create_brand",fileUploader.upload.single('brand_image'),async(req,res)=>{
  try {    
    const {brand_name,visibility}=req.body;
    const brand_image = req.file ? `uploads/brand_image/${req.file.filename}` : "";
    
    await global.Database.executeQuery('INSERT into brand_def (brand_name,brand_image,inserted_by,inserted_date,visibility) values($1,$2,$3,now(),$4)',[brand_name,brand_image,1,visibility]);
    res.status(200).json({success:true,message:"Brand created successfully"})
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).send('Error creating flavour');
  }
})

router.put("/update_brand/:id",fileUploader.upload.single('brand_image'),async(req,res)=>{
  try {   
    const {brand_name,visibility}=req.body;
    const {id}=req.params;
    const brandData=await global.Database.executeQuery('select * from brand_def where id = $1',[id]);
    const fileDetails=  req.file ? `uploads/brand_image/${req.file.filename}`:null;

    const brand_image=fileDetails ? fileDetails : brandData[0].brand_image;
    if(fileDetails){
      file_utils.DeleteFile(brandData[0].brand_image)
    }
    
    await global.Database.executeQuery('Update brand_def set brand_name = $1,brand_image=$2,updated_by=$3,updated_date =now(),visibility=$4 where id = $5',[brand_name,brand_image,1,visibility,id]);
    res.status(200).json({success:true,message:"Flavour Updated  successfully"})
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).send('Error creating flavour');
  }
})

router.get('/get/brands/Admin', isAuthenticated, (req, res) => {
  global.Database.executeQuery('SELECT * FROM brand_def order by inserted_date desc')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});

router.get("/ind_brand/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await global.Database.executeQuery('SELECT * FROM brand_def where id =$1', [id]);
    res.status(200).json({ data: result[0] })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message })
  }
})


router.get("/search-brands", isAuthenticated, async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const result = await global.Database.executeQuery(
      'SELECT * FROM brand_def WHERE LOWER(brand_name) LIKE LOWER($1)',
      [`%${search}%`]
    );

    res.json(result);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});




module.exports = router;
