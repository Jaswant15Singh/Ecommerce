var express = require('express');
const { isAuthenticated } = require('../helper/utils');
const sendsms = require('../helper/sendsms');

const { API_KEY, SALT_KEY ,Pay_Mode} = require('../helper/constant');
var router = express.Router();
const { glob } = require('fs');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const sendSMS = require('../helper/sendsms');
const axios = require('axios');
const { generateInvoiceAndSendEmail } = require('../utils/function');
const { log } = require('console');
const e = require('express');

router.get('/', async (req, res, next) => {
  try {
    const category = await global.Database.executeQuery('SELECT * FROM category_def where visibility =true order by inserted_date');
    const brand=await global.Database.executeQuery('SELECT * FROM brand_def where visibility =true order by inserted_date');
    const result = await global.Database.executeQuery('SELECT * FROM customer_review where visiblity=TRUE order by inserted_date desc');
    const products_instock = await global.Database.executeQuery(`
SELECT 
    pd.*, 
    pbd.discount_price, 
    pbd.mrp, 
    pbd.label_name, 
    pbd.batch_quantity, 

    CASE 
        WHEN 
                CASE 
                    WHEN pd.type = 'UNITS' THEN 
                        (SELECT SUM(ind.in_stock) 
                         FROM inventory_def ind 
                         WHERE ind.product_id = pd.id)  
                    ELSE ind.in_stock 
                END 
             > 0 
        THEN TRUE 
        ELSE FALSE 
    END AS in_stock_status  

    FROM product_def pd  
    INNER JOIN product_batch_details pbd 
    ON pd.id = pbd.product_id  
    LEFT JOIN inventory_def ind  
    ON (CASE 
            WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
            ELSE ind.product_id = pd.id 
        END)
        where pbd.visibility = TRUE and pd.visibility = true
    ORDER BY pd.inserted_date desc limit 12;
       `);
    const banner = await global.Database.executeQuery('SELECT * FROM promotional_def where banner_hidden = false order by created_date');

    res.render(`${UI_TEMPLATE}/index`, { category, products_instock, banner, result ,brand});
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get('/contact', async (req, res, next) => {
  try {


    res.render(`${UI_TEMPLATE}/contact`, { title: "Home" });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});
// router.get('/shop', async (req, res, next) => {
//  try {
//     const products = await global.Database.executeQuery(`
// SELECT 
//               p.*, 
//               (p.in_stock > 0) AS in_stock_status,
//               json_agg(json_build_object(
//                   'batch_id', pbd.id,
//                   'label_name', pbd.label_name,
//                   'batch_quantity', pbd.batch_quantity,
//                   'discount_price', pbd.discount_price,
//                   'mrp', pbd.mrp
//               ) ORDER BY pbd.discount_price ) AS batch_details
//           FROM 
//               product_def p 
//           INNER JOIN 
//               category_def c ON p.category_id = c.id 
//           LEFT JOIN 
//               product_batch_details pbd ON p.id = pbd.product_id
//           GROUP BY 
//               p.id, c.category_name
//           ORDER BY 
//               c.category_name, p.product_name;
//     `);

//     res.render('webview/shop', { products, title: "All Products" });
//     // res.json(products)
//   } catch (error) {
//     console.error('Database error:', error.message);
//     return res.status(500).json({ message: 'Error occurred', error: error.message });
//   }
// });
router.get('/testimonial', async (req, res, next) => {
  try {

    const result = await global.Database.executeQuery('SELECT * FROM customer_review where visiblity=TRUE order by inserted_date desc');
    res.render(`${UI_TEMPLATE}/testimonial`, { title: "Home", result });

  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});


router.get('/why', async (req, res, next) => {
  try {


    res.render(`${UI_TEMPLATE}/why`, { title: "Home" });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});
// router.get('/', async (req, res, next) => {
//   try {
//     const category = await global.Database.executeQuery('SELECT * FROM category_def order by inserted_date');
//     const products_instock = await global.Database.executeQuery(`
//             SELECT 
//               p.*, 
//               (p.in_stock > 0) AS in_stock_status,
//               json_agg(
//         json_build_object(
//             'batch_id', pbd.id,
//             'label_name', pbd.label_name,
//             'batch_quantity', pbd.batch_quantity,
//             'discount_price', pbd.discount_price,
//             'mrp', pbd.mrp
//         ) ORDER BY pbd.discount_price
//     ) AS batch_details
//           FROM 
//               product_def p 
//           INNER JOIN 
//               category_def c ON p.category_id = c.id 
//           LEFT JOIN 
//               product_batch_details pbd ON p.id = pbd.product_id
//           GROUP BY 
//               p.id, c.category_name
//           ORDER BY 
//               c.category_name, p.product_name;
//        `);

//     const banner = await global.Database.executeQuery('SELECT * FROM promotional_def');

//     res.render('index', { category, products_instock, banner });
//   } catch (error) {
//     console.error('Database error:', error.message);
//     return res.status(500).json({ message: 'Error occurred', error: error.message });
//   }
// });

// router.get('/account/userregister', function (req, res, next) {
//   res.render('web/userregister', { title: 'Create Account' });
// });
// router.get('/account/validateotp', function (req, res, next) {
//   res.render('web/validateotp', { title: 'Validate otp' });
// });
// router.get('/account/userlogin', function (req, res, next) {
//   res.render('web/userlogin', { title: 'User Login' });
// });

// router.get('/account/usersignin', function (req, res, next) {
//   res.render('web/usersignin', { title: 'User Login' });
// });
router.get('/account/forgotpassword', function (req, res, next) {
  res.render(`${UI_TEMPLATE}/forgotpassword`, { title: 'Forgot Password' });
});
router.get('/aboutus', function (req, res, next) {
  res.render(`${UI_TEMPLATE}/aboutus`, { title: 'About Us' });
});
router.get('/privacypolicy', function (req, res, next) {
  res.render('web/privacypolicy', { title: 'Privacy Policy' });
});
router.get('/refundpolicy', function (req, res, next) {
  res.render(`${UI_TEMPLATE}refundpolicy`, { title: 'Refund Policy' });
});
router.get('/shippingpolicy', function (req, res, next) {
  res.render('web/shippingpolicy', { title: 'Shipping Policy' });
});
router.get('/termsservice', function (req, res, next) {
  res.render(`${UI_TEMPLATE}/termsservice`, { title: 'Terms Of Service' });
});
router.get('/blogs', async function (req, res, next) {
  try {

    const result = await global.Database.executeQuery('SELECT * FROM customer_review where visiblity=TRUE order by inserted_date desc');
    const data = await global.Database.executeQuery('SELECT * FROM blogs where blog_visibility=TRUE');
    res.render(`${UI_TEMPLATE}/blogs`, { title: 'Blogs', blogs: data, testimonials: result });

  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while searching for products');
  }
});

router.get("/profile", (req, res) => {
  res.render(`${UI_TEMPLATE}/profile`, { title: "Profile" })
})
// router.get('/blogs', async function (req, res, next) {
//   try {
//     const data = await global.Database.executeQuery('SELECT * FROM blogs where blog_visibility=TRUE');
//     res.render('web/blogs', { title: 'Blogs', blogs: data });

//   } catch (error) {
//     console.error('Database error:', error.message);
//     res.status(500).send('An error occurred while searching for products');
//   }
// });

router.get('/blog/:id', async function (req, res, next) {
  try {
    const id = req.params.id;
    const data = await global.Database.executeQuery('SELECT * FROM blogs where id=$1', [id]);


    res.render(`${UI_TEMPLATE}/blog`, { title: 'Blogs', blog: data[0] });

  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while searching for products');
  }
});

// router.get('/contact', function (req, res, next) {
//   res.render('web/contact', { title: 'Contact Us' });
// });
router.get('/cart_productss', async (req, res) => {
  try {
    const products = await global.Database.executeQuery('SELECT * FROM product_def ');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

router.get('/search', async (req, res, next) => {
  let searchQuery = req.query.q;
  searchQuery = searchQuery.toLowerCase();  
  try {
    const result = await global.Database.executeQuery(
      `SELECT pd.*,pbd.id as batch_id,pbd.label_name,pbd.mrp,pbd.discount_price,COALESCE(fd.flavour_name, '') AS flavour_name FROM product_def pd 
        INNER JOIN product_batch_details pbd 
        on pd.id = pbd.product_id left JOIN flavour_def fd on fd.id = pbd.flavour_id where LOWER(pd.product_name) LIKE $1 AND pd.visibility=TRUE order by pbd.discount_price limit 10`,
      [`%${searchQuery}%`]
    );
    
    res.json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('An error occurred while searching for products', error);
  }
});

router.get("/categoriess", async (req, res, next) => {
  try {
    const category = await global.Database.executeQuery('SELECT * FROM category_def where visibility=true order by inserted_date');
    res.status(200).json(category)
  } catch (error) {
    res.status(500).json({ message: 'Error occurred', error: error.message })
  }
})
router.get("/all_categories_product/:category_id", async (req, res, next) => {
  const { category_id } = req.params;
  try {
    const cat_products = await global.Database.executeQuery(`select id from product_def where category_id = $1`, [category_id])
    res.json(cat_products)
  } catch (error) {

    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});
router.get('/category_product/:id', async (req, res, next) => {
  const categoryId = req.params.id;
  try {
    const result = await global.Database.executeQuery(`select *,case when in_stock > 0 then 'in stock' when in_stock=0 then 'Out of stock' end  as stock_status from product_def where category_id = $1`, [categoryId])
    const products = await global.Database.executeQuery(`
SELECT 
    pd.*, 
    pbd.discount_price, 
    pbd.mrp, 
    pbd.label_name, 
    pbd.batch_quantity, 

    CASE 
        WHEN 
                CASE 
                    WHEN pd.type = 'UNITS' THEN 
                        (SELECT SUM(ind.in_stock) 
                         FROM inventory_def ind 
                         WHERE ind.product_id = pd.id)  
                    ELSE ind.in_stock 
                END 
             > 0 
        THEN TRUE 
        ELSE FALSE 
    END AS in_stock_status  

FROM product_def pd  
INNER JOIN category_def c on c.id = pd.category_id
INNER JOIN product_batch_details pbd 
    ON pd.id = pbd.product_id  
LEFT JOIN inventory_def ind  
    ON (CASE 
            WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
            ELSE ind.product_id = pd.id 
        END)
        where c.id = $1 and  pbd.visibility = TRUE and pd.visibility = TRUE
ORDER BY pd.product_name; 
              `, [categoryId]);

    if (result.length === 0) {
      res.render(`${UI_TEMPLATE}/not_found`)
    }
    const product = products;
    res.render(`${UI_TEMPLATE}/category_product`, { product, products, title: `Products in Category ID:${categoryId}` })
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});

// router.get('/category_products/:id', async (req, res, next) => {
//   const categoryId = req.params.id;
//   try {
//     const result = await global.Database.executeQuery(`select *,case when in_stock > 0 then 'in stock' when in_stock=0 then 'Out of stock' end  as stock_status from product_def where category_id = $1`, [categoryId])
//     const products = await global.Database.executeQuery(`
//               SELECT 
//                   pd.*, 
//                   (pd.in_stock > 0) AS in_stock_status,
//                   json_agg(json_build_object(
//                       'batch_id', pbd.id,
//                       'label_name', pbd.label_name,
//                       'batch_quantity', pbd.batch_quantity,
//                       'discount_price', pbd.discount_price,
//                       'mrp', pbd.mrp
//                   ) ORDER BY pbd.discount_price ) AS batch_details
//               FROM 
//                   product_def pd
//               LEFT JOIN 
//                   product_batch_details pbd ON pd.id = pbd.product_id
//               INNER JOIN 
//                   category_def c ON pd.category_id = c.id
//               WHERE 
//                   c.id = $1 
//               GROUP BY 
//                   pd.id
//               ORDER BY 
//                   pd.product_name;
//               `, [categoryId]);

//     if (result.length === 0) {
//       res.render("webview/not_found")
//     }
//     const product = products;
//     res.render("webview/category_products", { product, products, title: `Products in Category ID:${categoryId}` })
//   } catch (error) {
//     console.error('Database error:', error.message);
//     res.status(500).send('An error occurred while fetching product details');
//   }
// });



router.get('/product/:id', async (req, res, next) => {
  const productId = req.params.id;

  try {
    const result = await global.Database.executeQuery(
      'SELECT * FROM product_def WHERE id = $1',
      [productId]
    );


    if (result.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = result;
    res.render(`${UI_TEMPLATE}product`, { product });
    // res.json(product)
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});

router.get('/ind-product/:id', async (req, res, next) => {
  const productId = req.params.id;

  try {
    const result = await global.Database.executeQuery(
      'SELECT ind.in_stock FROM inventory_def ind inner join product_def pd on ind.product_id=pd.id WHERE pd.id = $1',
      [productId]
    );


    if (result.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = result;
    res.json(product[0]);
    // res.json(product)
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});
router.get('/ind-batch-product/:id', async (req, res, next) => {
  const productId = req.params.id;

  try {
    const result = await global.Database.executeQuery('SELECT  pbd.*,ind.in_stock FROM product_batch_details pbd INNER JOIN product_def pd ON  pbd.product_id = pd.id INNER JOIN inventory_def ind ON pd.id = ind.product_id where pbd.id = $1 and pbd.id = ind.batch_id order by pbd.visibility desc', [productId])


    if (result.length === 0) {
      return res.status(404).send('Product not found');
    }

    const product = result;
    res.json(product[0]);
    // res.json(product)
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});
router.get("/individual_products/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    let product = await global.Database.executeQuery(`
      SELECT 
          pd.*, 
          (pd.in_stock > 0) AS in_stock_status,
          json_agg(json_build_object(
              'batch_id', pbd.id,
              'label_name', pbd.label_name,
              'batch_quantity', pbd.batch_quantity,
              'discount_price', pbd.discount_price,
              'mrp', pbd.mrp
          ) ORDER BY pbd.discount_price ) AS batch_details
      FROM 
          product_def pd
      LEFT JOIN 
          product_batch_details pbd ON pd.id = pbd.product_id
      WHERE 
          pd.id = $1 
      GROUP BY 
          pd.id;
  `, [id]);
    product = product[0];
    const products_instock = await global.Database.executeQuery(`
  SELECT 
              p.*, 
              (p.in_stock > 0) AS in_stock_status,
              json_agg(json_build_object(
                  'batch_id', pbd.id,
                  'label_name', pbd.label_name,
                  'batch_quantity', pbd.batch_quantity,
                  'discount_price', pbd.discount_price,
                  'mrp', pbd.mrp
              ) ORDER BY pbd.discount_price ) AS batch_details
          FROM 
              product_def p 
          INNER JOIN 
              category_def c ON p.category_id = c.id 
          LEFT JOIN 
              product_batch_details pbd ON p.id = pbd.product_id
          GROUP BY 
              p.id, c.category_name
          ORDER BY 
              c.category_name, p.product_name;
   `);

    res.render(`${UI_TEMPLATE}/individual_products`, { product, products_instock })
    // res.json(product)

  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
})
router.get("/prods/:product_name", async (req, res, next) => {
  let { product_name } = req.params;
  try {
    let product = await global.Database.executeQuery(`
      SELECT 
          pd.*, 
          c.category_name,
          bd.brand_name,
          (pd.in_stock > 0) AS in_stock_status,
          json_agg(json_build_object(
              'batch_id', pbd.id,
              'label_name', pbd.label_name,
              'batch_quantity', pbd.batch_quantity,
              'discount_price', pbd.discount_price,
              'mrp', pbd.mrp,
              'flavour',coalesce(fd.flavour_name,'')
          ) ORDER BY pbd.discount_price ) AS batch_details
      FROM 
          product_def pd
      INNER JOIN 
          category_def c on c.id=pd.category_id
          LEFT JOIN 
          brand_def bd on bd.id=pd.brand_id
      LEFT JOIN 
          product_batch_details pbd ON pd.id = pbd.product_id
      LEFT JOIN 
          flavour_def fd on fd.id=pbd.flavour_id
      WHERE 
          pd.id=$1 
      GROUP BY 
          pd.id,c.category_name,bd.brand_name;
  `, [product_name]);

    product = product[0];
      
    res.render(`${UI_TEMPLATE}/individual_product`, { product });

  } catch (error) {
    console.error(' error:', error);

    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});
router.get('/units_products/:id', async (req, res, next) => {
  const productId = req.params.id;
  try {
    const result = await global.Database.executeQuery(
      'SELECT pd.product_name,pd.product_image,ind.in_stock FROM product_def pd inner join inventory_def ind on pd.id=ind.product_id WHERE pd.id = $1',
      [productId]
    );


    if (result.length === 0) {
      return res.status(404).send('Product not found');
    }
    const product = result;
    res.json(product);
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});

router.get('/pieces_products/:id', async (req, res, next) => {
  const productId = req.params.id;
  try {
    const result = await global.Database.executeQuery('SELECT  pd.product_name,pd.product_image,pbd.*,ind.in_stock FROM product_batch_details pbd INNER JOIN product_def pd ON pbd.product_id = pd.id INNER JOIN inventory_def ind ON pd.id = ind.product_id WHERE pbd.product_id = $1 and pbd.id = ind.batch_id order by pbd.visibility desc', [productId]);
    if (result.length === 0) {
      return res.status(404).send('Product not found');
    }
    const product = result;
    res.json(product);
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching product details');
  }
});

router.get("/pieces_instock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await global.Database.executeQuery('SELECT in_stock FROM inventory_def where batch_id=$1', [id]);
    res.json({ data: data[0] })
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).send('An error occurred while fetching batch instock');
  }
})
router.get('/product', async (req, res, next) => {
  const { categoryId,brandId } = req.query;
  let products;
  try {
    if (categoryId) {
      products = await global.Database.executeQuery(`
        SELECT 
            pd.*, 
            pbd.discount_price, 
            pbd.mrp, 
            pbd.label_name, 
            pbd.batch_quantity, 
            CASE 
                WHEN 
                        CASE 
                            WHEN pd.type = 'UNITS' THEN 
                                (SELECT SUM(ind.in_stock) 
                                 FROM inventory_def ind 
                                 WHERE ind.product_id = pd.id)  
                            ELSE ind.in_stock 
                        END 
                     > 0 
                THEN TRUE 
                ELSE FALSE 
            END AS in_stock_status  
        
        FROM product_def pd  
        INNER JOIN category_def c on c.id = pd.category_id
        INNER JOIN product_batch_details pbd 
            ON pd.id = pbd.product_id  
        LEFT JOIN inventory_def ind  
            ON (CASE 
                    WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
                    ELSE ind.product_id = pd.id 
                END)
                where c.id = $1 and  pbd.visibility = TRUE and pd.visibility = TRUE
        ORDER BY pd.product_name; 
                      `, [categoryId]);
      res.render(`${UI_TEMPLATE}/product`, { products, title: "All Products", categoryId:categoryId, brandId:"" });

    }

    else if(brandId){
      products = await global.Database.executeQuery(`
        SELECT 
            pd.*, 
            pbd.discount_price, 
            pbd.mrp, 
            pbd.label_name, 
            pbd.batch_quantity, 
            CASE 
                WHEN 
                        CASE 
                            WHEN pd.type = 'UNITS' THEN 
                                (SELECT SUM(ind.in_stock) 
                                 FROM inventory_def ind 
                                 WHERE ind.product_id = pd.id)  
                            ELSE ind.in_stock 
                        END 
                     > 0 
                THEN TRUE 
                ELSE FALSE 
            END AS in_stock_status  
        
        FROM product_def pd  
        INNER JOIN brand_def bd on bd.id = pd.brand_id
        INNER JOIN product_batch_details pbd 
            ON pd.id = pbd.product_id  
        LEFT JOIN inventory_def ind  
            ON (CASE 
                    WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
                    ELSE ind.product_id = pd.id 
                END)
                where bd.id = $1 and  pbd.visibility = TRUE and pd.visibility = TRUE
        ORDER BY pd.product_name; 
                      `, [brandId]);
      res.render(`${UI_TEMPLATE}/product`, { products, title: "All Products",categoryId:"",brandId:brandId});

    }
    else {
      products = await global.Database.executeQuery(`
        SELECT 
            pd.*, 
            pbd.discount_price, 
            pbd.mrp, 
            pbd.label_name, 
            pbd.batch_quantity, 
        
            CASE 
                WHEN 
                        CASE 
                            WHEN pd.type = 'UNITS' THEN 
                                (SELECT SUM(ind.in_stock) 
                                 FROM inventory_def ind 
                                 WHERE ind.product_id = pd.id)  
                            ELSE ind.in_stock 
                        END 
                     > 0 
                THEN TRUE 
                ELSE FALSE 
            END AS in_stock_status  
        
        FROM product_def pd  
        INNER JOIN product_batch_details pbd 
            ON pd.id = pbd.product_id  
        LEFT JOIN inventory_def ind  
            ON (CASE 
                    WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
                    ELSE ind.product_id = pd.id 
                END)
                where pbd.visibility = TRUE and pd.visibility = TRUE
        ORDER BY pd.product_name;
            `);
      res.render(`${UI_TEMPLATE}/product`, { products, title: "All Products", categoryId: "", brandId:"" });

    }

    // res.json(products)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/get_products/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;
    // if (!product_name) {
    //   return res.status(400).json({ success: false, message: "Product name is required" });
    // }

    const data = await global.Database.executeQuery(
      `SELECT 
  pbd.*, 
  id.in_stock, 
  fd.flavour_name 
FROM 
  product_batch_details pbd 
LEFT JOIN flavour_def fd 
  ON fd.id = pbd.flavour_id 
INNER JOIN product_def pd 
  ON pd.id = pbd.product_id 
inner JOIN inventory_def id 
  ON (
    (pbd.type = 'PIECES' AND id.batch_id = pbd.id)
    OR 
    (pbd.type != 'PIECES' AND id.product_id = pd.id)
  )
WHERE 
  pbd.product_id = $1 and pbd.visibility = TRUE order by discount_price`,
      [product_id]
    );

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})
router.get('/categories', async (req, res, next) => {
  try {
    const category = await global.Database.executeQuery('SELECT * FROM category_def where visibility =true order by inserted_date');

    res.render(`${UI_TEMPLATE}/categories`, { category, title: "Product Categories" });
    // res.json(products)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get('/brands', async (req, res, next) => {
  try {
    const brand = await global.Database.executeQuery('SELECT * FROM brand_def where visibility =true order by inserted_date');
    res.render(`${UI_TEMPLATE}/brand`, { brand, title: "Brands" });
    // res.json(products)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

// router.get("/featured", async (req, res, next) => {
//   try {
//     const featured = await global.Database.executeQuery('SELECT * FROM product_def where featured=TRUE');
//     const featured_instock = await global.Database.executeQuery(`SELECT *, CASE WHEN in_stock = 0 THEN 'Out of stock' WHEN in_stock > 0 THEN 'In stock'
//     END AS stock_status FROM product_def where featured =true order by inserted_date`);

//     res.render("web/featured", { featured, featured_instock, title: "Featured Products" });
//     // res.json(featured_instock)
//   } catch (error) {
//     console.error('Database error:', error.message);
//     return res.status(500).json({ message: 'Error occurred', error: error.message });
//   }

// });


// router.get("/arrived", async (req, res, next) => {
//   try {
//     const arrived = await global.Database.executeQuery('SELECT * FROM product_def order by inserted_date');
//     const arrived_instock = await global.Database.executeQuery(`SELECT *, CASE WHEN in_stock = 0 THEN 'Out of stock' WHEN in_stock > 0 THEN 'In stock'
//       END AS stock_status FROM product_def order by inserted_date desc`);
//     res.render("web/arrived", { arrived, arrived_instock, title: "Recently Arrived" })
//   } catch (error) {
//     console.error('Database error:', error.message);
//     return res.status(500).json({ message: 'Error occurred', error: error.message });
//   }

// })
router.get("/category-count", async (req, res, next) => {
  try {
    const count = await global.Database.executeQuery('select count(category_name) from category_def');
    res.json(count)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/product-count", async (req, res, next) => {
  try {
    const count = await global.Database.executeQuery('select count(product_name) from product_def');
    res.json(count)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/order-count", async (req, res, next) => {
  try {
    const count = await global.Database.executeQuery('select count(id) from order_def');
    res.json(count)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/search-query", async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const result = await global.Database.executeQuery(
      'SELECT * FROM product_def WHERE LOWER(product_name) LIKE LOWER($1) and visibility = TRUE',
      [`%${search}%`]
    );

    res.json(result);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/search-cat", async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const result = await global.Database.executeQuery(
      'SELECT * FROM category_def WHERE LOWER(category_name) LIKE LOWER($1)',
      [`%${search}%`]
    );

    res.json(result);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/search-order", async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const result = await global.Database.executeQuery(
      `SELECT o.id, c.customer_name, c.customer_email, c.customer_contact, o.total_price, o.order_status, o.inserted_date
      FROM order_def o
      INNER JOIN customer_def c ON o.customer_id = c.id
      WHERE LOWER(c.customer_name) LIKE LOWER($1) OR LOWER(c.customer_email) LIKE LOWER($1)
      ORDER BY o.inserted_date DESC`,
      [`%${search}%`] // Using the search parameter with wildcards
    );

    res.json(result);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});
router.get("/cart", async (req, res, next) => {
  try {
    const product = await global.Database.executeQuery('SELECT * FROM product_def');
    res.render(`${UI_TEMPLATE}/cart`)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})


router.get("/total_price/:id", async (req, res, next) => {
  const id = req.params.id
  try {
    const product = await global.Database.executeQuery(`
    SELECT 
  *
    FROM 
      product_def 
    
    WHERE 
      id = $1
  `, [id]);
    // res.render("web/cart",{product})  
    res.json(product)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})

router.post("/total_units_price", async (req, res, next) => {
  const { id, batchId } = req.body;
  try {
    const product = await global.Database.executeQuery(`
     SELECT 
    pbd.* ,pb.product_name,ind.in_stock,pb.product_image FROM product_batch_details pbd
    INNER JOIN product_def pb
    ON pbd.product_id = pb.id
    INNER JOIN inventory_def ind ON pb.id = ind.product_id
    WHERE 
      pbd.id = $1 and pb.id=$2
    
  `, [batchId, id]);
    // res.render("web/cart",{product})  
    res.json(product)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})

router.post("/total_pieces_price", async (req, res, next) => {
  const { id, batchId } = req.body;
  try {
    const product = await global.Database.executeQuery(`
    SELECT 
    pbd.* ,pb.product_name,ind.in_stock,pb.product_image FROM product_batch_details pbd
    INNER JOIN product_def pb
    ON pbd.product_id = pb.id
    INNER JOIN inventory_def ind ON pb.id = ind.product_id
    WHERE 
      pbd.id = $1 and pb.id=$2
      AND  pbd.id=ind.batch_id
  `, [batchId, id]);
    res.json(product)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})
router.get("/categories_product/:category_id", async (req, res, next) => {
  const { category_id } = req.params;
  try {
    const cat_products = await global.Database.executeQuery(`select id from product_def where category_id = $1`, [category_id])
    res.json(cat_products)
  } catch (error) {

    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
});

router.get("/ind-category/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await global.Database.executeQuery('select * from category_def where id=$1', [id]);
    res.json(result)
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ message: 'Error occurred', error: error.message });
  }
})


router.post("/place_order", async (req, res, next) => {
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
    } = req.body;

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

    await global.Database.getConnection().tx(async t => {
      let customerResult;
      let customerId;
      let new_customer_id;
      customerResult = await t.query(
        "SELECT id FROM customer_def WHERE customer_contact = $1",
        [customer_contact]
      );

      if (customerResult.length > 0) {
        const updatedCustomerDetails=await t.query('UPDATE customer_def set customer_name=$1,customer_email=$2,customer_address=$3,customer_pincode=$4,customer_city=$5,customer_state=$6 returning id',[customer_name,customer_email,customer_address,customer_pincode,customer_city,customer_state])
        // customerId = customerResult[0].id;
        customerId=updatedCustomerDetails[0].id
      } else {
        const insertResult = await t.query(
          `INSERT INTO customer_def (
             customer_name, customer_email, customer_contact, customer_address, 
             customer_pincode, customer_city, customer_state
           ) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
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
      // let order_batch_id;
      for (const { id, quantity, unitData, batchId, product_type } of parsedProducts) {

        let productResult;
        let unit_stock = 0;

        if (product_type === "PIECES") {
          unit_stock = unitData.batch_quantity;
          productResult = await t.query(
            `SELECT ind.in_stock, pb.discount_price as product_price, p.product_name, p.type FROM product_batch_details pb
             INNER JOIN product_def p ON p.id = pb.product_id INNER JOIN inventory_def ind  on ind.product_id = p.id  WHERE pb.id = $1 and pb.id = ind.batch_id`,
            [batchId]
          );
        } else {
          unit_stock = unitData.batch_quantity;
          productResult = await t.query(
            `SELECT ind.in_stock, pb.discount_price as product_price, p.product_name, p.type FROM product_batch_details pb 
            INNER JOIN product_def p ON p.id = pb.product_id inner join inventory_def ind on ind.product_id = p.id
            WHERE pb.id = $1`,
            [batchId]
          );
        }

        if (!productResult || productResult.length === 0) {
          throw new Error(`Product not found for ID ${id}`);
        }

        const { in_stock, product_price, product_name, type } = productResult[0];

        // if (type === "PIECES" && quantity > in_stock) {
        //   throw new Error(`Not enough stock for product ${product_name}`);
        // } else if (type === "UNITS" && quantity * unit_stock > in_stock) {
        //   throw new Error(`Not enough stock for product ${product_name}`);
        // }

        let totalItemPrice = type === "PIECES"
          ? quantity * product_price
          : quantity * product_price;

        totalPrice += totalItemPrice;

        productsInfo.push({ id, quantity, price: product_price, totalItemPrice, type, unit_stock, batchId });
      }

      const orderResult = await t.query(
        `INSERT INTO order_def (customer_id, total_price, order_status,order_address,order_pincode, inserted_date,new_customer_id)
         VALUES ($1, $2, $3,$4,$5, now(),$6) RETURNING id;`,
        [customerId, totalPrice, "PENDING", customer_address, customer_pincode,new_customer_id]
      );
      const orderId = orderResult[0].id;


      const orderItemPromises = productsInfo.map(async ({ id, quantity, price, totalItemPrice, type, unit_stock, batchId }) => {
        await t.query(
          `INSERT INTO order_items_def (order_id, product_id, quantity, price, total_price, order_time,batch_id)
           VALUES ($1, $2, $3, $4, $5, now(),$6);`,
          [orderId, id, quantity, price, totalItemPrice, batchId]
        );
        const deductionAmount = quantity * unit_stock;
        if (type === "PIECES") {
          await t.query(
            `UPDATE inventory_def SET in_stock = in_stock - $1 WHERE batch_id = $2;`,
            [deductionAmount, batchId]
          );
        }
        else {
          await t.query(
            `UPDATE inventory_def SET in_stock = in_stock - $1 WHERE product_id = $2;`,
            [deductionAmount, id]
          );
        }
      });

      await Promise.all(orderItemPromises);
      const paymentResult = await t.query(
        `INSERT INTO public.payment_gateway (name, phone,email, amount, zip_code, customer_id, booking_id,new_customer_id)
         VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING id;`,
        [customer_name, customer_contact, customer_email, totalPrice, customer_pincode, customerId, orderId,new_customer_id]
      );
      const paymentId = paymentResult[0].id;

      const paymentBody = {
        "address_line_1": "NA",
        "address_line_2": "NA",
        "amount": totalPrice,
        "api_key": API_KEY,
        "city": "MUMBAI",
        "country": "IN",
        "currency": "INR",
        "description": "NA",
        "email": customer_email,
        "mode": Pay_Mode,
        "name": customer_name,
        "order_id": 'PH' + '10000' + orderId,
        "phone": customer_contact,
        "return_url": url_pathname + "paymentResponse",
        "state": "MAHARASHTRA",
        "udf1": customerId,
        "udf2":new_customer_id,
        "zip_code": "401101"
      };

      const hashColumns = [
        "address_line_1", "address_line_2", "amount", "api_key", "city", "country", "currency",
        "description", "email", "mode", "name", "order_id", "phone", "return_url", "state", "udf1","udf2","zip_code"
      ];

      let hashData = SALT_KEY;
      hashColumns.forEach(entry => {
        if (paymentBody[entry]) hashData += '|' + paymentBody[entry].toString().trim();
      });

      const shasum = crypto.createHash('sha512');
      const resultKey = shasum.update(hashData).digest('hex').toUpperCase();
      paymentBody.hash = resultKey;

      await t.query(
        `UPDATE public.payment_gateway SET order_id = $1, hash_data = $2 WHERE id = $3;`,
        ['PH' + '10000' + orderId, resultKey, paymentId]
      );
      
      res.render('aggrepay', { body: paymentBody });
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.render('errormodel', { redirectUrl: '/' });
  }
});




router.post("/paymentResponse", async (req, res, next) => {
  try {
    var shasum = crypto.createHash('sha512'),
      reqData = req.body;

    const {
      transaction_id,
      order_id,
      reference_id,
      payment_mode,
      payment_channel,
      payment_datetime,
      response_code,
      response_message,
      email,
      hash } = reqData;


    var hash_data = SALT_KEY;
    var keys = Object.keys(reqData),
      i, len = keys.length;

    keys.sort();

    for (i = 0; i < len; i++) {
      const k = keys[i];
      if (k != 'hash') {
        reqData[k] = reqData[k].toString();
        if (reqData[k].length > 0) {
          hash_data += '|' + reqData[k].toString().trim();
        }
      }
    }

    const calculated_hash = shasum.update(hash_data).digest('hex').toUpperCase();
    var trimmed_order_id = order_id.replace(/^PH10000/, '')

    if (hash == calculated_hash) {
      if (response_code == 0) {

        const inserPaymentResult = await global.Database.executeQuery(
          `UPDATE public.payment_gateway
        SET payment_status = $1,transaction_id=$2,payment_mode=$3,payment_channel=$4,payment_datetime=$5,response_code=$6,response_message=$7,hash=$8
        WHERE order_id
         = $9 RETURNING booking_id;`,
          ['S', transaction_id, payment_mode, payment_channel, payment_datetime, response_code, response_message, hash, order_id]
        );

        const InsertOrderSuccess = await global.Database.executeQuery(
          `UPDATE public.order_def
        SET order_status=$1
        WHERE id = ${trimmed_order_id} `,
          ['SUCCESS']
        );
        const deleivery = await global.Database.executeQuery('INSERT INTO deleivery_def (order_id) values($1)', [trimmed_order_id]);

         sendEmail = await generateInvoiceAndSendEmail(trimmed_order_id,email);
        res.render('successmodel', { redirectUrl: '/' });
      } else {
        const inserPaymentResult = await global.Database.executeQuery(
          `UPDATE public.payment_gateway
        SET payment_status = $1,transaction_id=$2,payment_mode=$3,payment_channel=$4,payment_datetime=$5,response_code=$6,response_message=$7,hash=$8
        WHERE order_id = $9 RETURNING booking_id;`,
          ['F', transaction_id, payment_mode, payment_channel, payment_datetime, response_code, response_message, hash, order_id]
        );
        const trimmed_order_id = order_id.replace(/^PH10000/, '')


        const InsertOrderSuccess = await global.Database.executeQuery(
          `UPDATE public.order_def
        SET order_status=$1
        WHERE id = ${trimmed_order_id} `,
          ['FAILED']
        );

        res.render('errormodel', { message: reqData['response_message'], redirectUrl: '/' });
      }
    } else {

      const InsertOrderSuccess = await global.Database.executeQuery(
        `UPDATE public.order_def
      SET order_status=$1
      WHERE id = ${trimmed_order_id} `,
        ['FAILED']
      );

      const inserPaymentResult = await global.Database.executeQuery(
        `UPDATE public.payment_gateway
    SET payment_status = $1,transaction_id=$2,payment_mode=$3,payment_channel=$4,payment_datetime=$5,response_code=$6,response_message=$7,hash=$8
    WHERE order_id = $9 RETURNING booking_id;`,
        ['F', null, null, null, null, response_code, null, hash, order_id]
      );
      res.render('errormodel', { message: 'Hash Mismatch', redirectUrl: '/' });
    }
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  try {
    // const otp = Math.floor(1000 + Math.random() * 9000);
    const otp = 1234;
    // await sendSMS(phone, otp);

    const InsertOtp = await global.Database.executeQuery(
      `
      INSERT INTO otp_def (phone, otp, inserted_date)
      VALUES ($1, $2, now()) RETURNING ID
      `,
      [phone, otp]
    );




    res.status(200).json({
      message: 'OTP sent successfully.',
      otpId: InsertOtp[0].id,
      success: true
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error });
  }
});


router.post('/verify-otp', async (req, res) => {
  const { id, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'OTP is required.' });
  }
  try {
    const result = await global.Database.executeQuery(
      `
        SELECT * FROM otp_def WHERE id = $1 and otp= $2 `,
      [id, otp]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Please Enter Correct OTP' });
    }

    const name = await global.Database.executeQuery('SELECT customer_name FROM customer_def where customer_contact=$1', [result[0].phone])
    res.status(200).json({ success: true, message: 'OTP Verify Successfully.', data: result, name });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP.' });
  }
});

router.get("/batch_products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await global.Database.executeQuery(`SELECT pd.* FROM product_def p inner join product_batch_details pd on p.id=pd.product_id where p.id = $1`, [id]);
    res.status(200).json({ data: result[0] })
  } catch (error) {
    console.error('Error ', error);
    res.status(500).json({ message: error.message });
  }
})

router.post("/user_contact_form", async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await global.Database.executeQuery(`SELECT * FROM customer_def where customer_contact=$1`, [phone]);
    const oder_details = await global.Database.executeQuery(`select concat(od.order_address,'',od.order_pincode) as address,cd.customer_name,pg.payment_mode,
      od2.quantity,od2.price,pd.product_image
      ,od2.id,od2.total_price ,od.order_status, CONCAT(pd.product_name, ' - ', COALESCE(pbd.label_name, 'Pc'),' ',COALESCE(fd.flavour_name, '')) AS product_name,od2.order_time,od.id
       from order_def od 
      inner join order_items_def od2 on
      od2.order_id = od.id
      inner join product_def pd on 
      pd.id = od2.product_id
      left join product_batch_details pbd on
      pbd.id = od2.batch_id 
      left join flavour_def fd 
      on fd.id =pbd.flavour_id 
      inner join customer_def_log cd on
      cd.id = od.new_customer_id 
      left join payment_gateway pg on
      pg.booking_id = od.id
      where cd.customer_contact =$1 order by od2.order_time desc`, [phone]);
    res.status(200).json({ success: true, data: result[0], oder_details: oder_details });
  } catch (error) {
    console.error('Error ', error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/add-profile", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_contact,
      customer_address,
      customer_pincode,
      customer_city,
      customer_state,
    } = req.body;


    let insertResult;

    const customerResult = await global.Database.executeQuery(
      "SELECT id FROM customer_def WHERE customer_contact = $1",
      [customer_contact]
    );


    if (customerResult.length > 0) {
      insertResult = await global.Database.executeQuery(
        `UPDATE customer_def 
         SET customer_name=$1, customer_email=$2, customer_contact=$3,
             customer_address=$4, customer_pincode=$5, customer_city=$6, customer_state=$7
         WHERE id=$8 RETURNING *`,
        [
          customer_name,
          customer_email,
          customer_contact,
          customer_address,
          customer_pincode,
          customer_city,
          customer_state,
          customerResult[0].id,
        ]
      );
      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        customer: insertResult[0],
      });
    } else {
      insertResult = await global.Database.executeQuery(
        `INSERT INTO customer_def (
           customer_name, customer_email, customer_contact, customer_address, 
           customer_pincode, customer_city, customer_state
         ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          customer_name,
          customer_email,
          customer_contact,
          customer_address,
          customer_pincode,
          customer_city,
          customer_state,
        ]
      );
      return res.status(201).json({
        success: true,
        message: "Customer added successfully",
        customerId: insertResult[0].id,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/customer_service", async (req, res) => {
  try {

    const { customer_contact, customer_email, customer_name, customer_query } = req.body;
    if (!customer_contact || !customer_email || !customer_name || !customer_query) {
      return res.status(400).json({ success: false, message: "Missing fields" })
    }

    const result = await global.Database.executeQuery('INSERT INTO customer_service_def(customer_contact,customer_email,customer_name,customer_query,inserted_date) VALUES ($1,$2,$3,$4,now()) Returning id', [customer_contact, customer_email, customer_name, customer_query]);

    const id = result[0].id
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or any email provider you use
      auth: {
        user: 'anhsupplement@gmail.com',
        pass: 'bwwk czen viwt sjfe'
      }
    });

    const mailOptions = {
      to: `anhsupplement@gmail.com`,
      subject: `Customer Service Review By ${customer_name}`,
      html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Customer Service Review</title>
          </head>
          <body style="background-color: #f5f5f5; font-family: Arial, sans-serif; margin: 0; padding: 0;">
              <div style="max-width: 700px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <header style="text-align: center; border-bottom: 2px solid #0070f3; padding-bottom: 15px;">
                      <h1 style="color: #0070f3;">Customer Service Review</h1>
                  </header>
      
                  <div style="margin-top: 20px; padding: 10px; border: 1px solid #eaeaea; border-radius: 6px;">
                      <h3 style="color: #111111;">Customer Details</h3>
                      <p><strong>Name:</strong> ${customer_name}</p>
                      <p><strong>Email:</strong> ${customer_email}</p>
                      <p><strong>ID:</strong> #PH0${id}</p>
                      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
      
                  <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 6px;">
                      <h3 style="color: #111111;">Customer Query:</h3>
                      <p>${customer_query}</p>
                  </div>
      
                  <footer style="margin-top: 20px; text-align: center; border-top: 2px solid #0070f3; padding-top: 15px;">
                      <p style="color: #777;">Â© 2024 Company Name. All rights reserved.</p>
                  </footer>
              </div>
          </body>
          </html>`
    };
    transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message has been sent" })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})


router.get("/get_reviews", async (req, res) => {
  try {
    const result = await global.Database.executeQuery('SELECT * FROM customer_review order by inserted_date desc');
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

router.get("/get_product_reviews/:product_id", async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const result = await global.Database.executeQuery('SELECT * FROM product_review where product_id = $1 order  by inserted_date desc', [product_id]);
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})
router.post("/create_review", async (req, res) => {
  try {
    const { review, rating, customer_review_name, contact } = req.body;

    if (!review) {
      return res.status(400).json({ success: false, message: "Missing review" });
    }

    if (!customer_review_name && !contact) {
      return res.status(401).json({ success: false, message: "Login first" });
    }
    if (!customer_review_name && contact) {
      return res.status(401).json({ success: false, message: "Please complete your personal details in profile page." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // const formattedDate = new Date().toLocaleString("en-IN", {
    //   timeZone: "Asia/Kolkata",
    //   hour12: true,
    // });


    const query = `INSERT INTO customer_review (review, rating, inserted_date,customer_review_name) 
                   VALUES ($1, $2, now(),$3)`;
    const result = await global.Database.executeQuery(query, [review, rating, customer_review_name]);


    res.status(201).json({ success: true, message: "Review has been added" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/create_product_review", async (req, res) => {
  try {
    const { product_id, review, rating, customer_review_name, contact } = req.body;


    if (!review) {
      return res.status(400).json({ success: false, message: "Missing review" });
    }
    if (!customer_review_name && !contact) {
      return res.status(401).json({ success: false, message: "Login first" });
    }
    if (!customer_review_name && contact) {
      return res.status(401).json({ success: false, message: "Please complete your personal details in profile page." });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const formattedDate = new Date().toISOString().replace("T", " ").slice(0, 19);
    const query = `INSERT INTO product_review (review, rating, inserted_date,customer_review_name,product_id) VALUES ($1, $2, now(),$3,$4)`;
    const result = await global.Database.executeQuery(query, [review, rating, customer_review_name, product_id]);
    res.status(201).json({ success: true, message: "Review has been added" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});




router.put("/update_review/:id", async (req, res) => {
  try {
    const { visibility } = req.body;
    const { id } = req.params;

    const result = await global.Database.executeQuery('UPDATE  customer_review set visiblity = $1,updated_date = now() where id = $2', [visibility, id]);
    res.status(200).json({ success: true, message: "Review had been updated" })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/customer_service", async (req, res) => {
  try {

    const { customer_contact, customer_email, customer_name, customer_query } = req.body;
    if (!customer_contact || !customer_email || !customer_name || !customer_query) {
      return res.status(400).json({ success: false, message: "Missing fields" })
    }

    const result = await global.Database.executeQuery('INSERT INTO customer_service_def(customer_contact,customer_email,customer_name,customer_query,inserted_date) VALUES ($1,$2,$3,$4,now()) Returning id', [customer_contact, customer_email, customer_name, customer_query]);

    const id = result[0].id
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'bishtpushpa1286@gmail.com',
    //     pass: 'wkeu aobd yzkx vggf'
    //   }
    // });

    // const mailOptions = {
    //   to: 'pahadi.rasyan@gmail.com',
    //   subject: `Customer Service Review By ${customer_name}`,
    //   html: `
    //       <!DOCTYPE html>
    //       <html lang="en">
    //       <head>
    //           <meta charset="UTF-8">
    //           <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //           <title>Customer Service Review</title>
    //       </head>
    //       <body style="background-color: #f5f5f5; font-family: Arial, sans-serif; margin: 0; padding: 0;">
    //           <div style="max-width: 700px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    //               <header style="text-align: center; border-bottom: 2px solid #0070f3; padding-bottom: 15px;">
    //                   <h1 style="color: #0070f3;">Customer Service Review</h1>
    //               </header>

    //               <div style="margin-top: 20px; padding: 10px; border: 1px solid #eaeaea; border-radius: 6px;">
    //                   <h3 style="color: #111111;">Customer Details</h3>
    //                   <p><strong>Name:</strong> ${customer_name}</p>
    //                   <p><strong>Email:</strong> ${customer_email}</p>
    //                   <p><strong>ID:</strong> #PH0${id}</p>
    //                   <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    //               </div>

    //               <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 6px;">
    //                   <h3 style="color: #111111;">Customer Query:</h3>
    //                   <p>${customer_query}</p>
    //               </div>

    //               <footer style="margin-top: 20px; text-align: center; border-top: 2px solid #0070f3; padding-top: 15px;">
    //                   <p style="color: #777;">Â© 2024 Company Name. All rights reserved.</p>
    //               </footer>
    //           </div>
    //       </body>
    //       </html>`
    // };
    // transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message has been sent" })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
})

router.get("/cart_products", async (req, res) => {
  try {
    const data = await global.Database.executeQuery('select pbd.id,pbd.product_id as productId,pbd.mrp,pbd.discount_price,pd.product_name,pbd.batch_quantity,pbd.label_name, pbd.discount_price from product_def pd inner join product_batch_details pbd on pd.id=pbd.product_id order by productId')
    res.json({ data })
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
})

router.post("/cart_prods", async (req, res) => {
  try {
    const { cartData } = req.body;
    if (!cartData || cartData.length === 0) {
      return res.json({ data: [] });
    }

    const batches = [];
    const quantities = {};

    for (const { batchId, quantity } of cartData) {
      batches.push(batchId);
      quantities[batchId] = quantity;
    }

    const dummyData = await global.Database.executeQuery(
      `SELECT pbd.id AS batchId, pbd.product_id AS productId, pbd.mrp, pbd.discount_price, pd.product_name, 
    pbd.batch_quantity, pbd.label_name, pbd.type, pbd.visibility, pd.product_image,pd.visibility,
    coalesce (fd.flavour_name,'') as flavour,
    CASE 
        WHEN pd.type = 'UNITS' THEN 
            (SELECT MAX(id2.in_stock) 
             FROM inventory_def id2 
             WHERE id2.product_id = pd.id) 
        ELSE id.in_stock 
    END AS in_stock
FROM product_def pd INNER JOIN product_batch_details pbd 
left join flavour_def fd on fd.id = pbd.flavour_id 
ON pd.id = pbd.product_id LEFT JOIN inventory_def id ON id.batch_id = pbd.id  
WHERE pbd.id in (${batches.join(",")}) and pbd.visibility = true and pd.visibility=true ORDER BY productId`);

    const updatedData = dummyData.map((item) => {

      return ({
        productName: item.product_name,
        productId: String(item.productid),
        quantity: quantities[item.batchid] || 0,
        imageUrl: item.product_image || "",
        unitData: {
          id: item.batchid,
          product_id: item.productid,
          label_name: item.label_name,
          batch_quantity: item.batch_quantity,
          discount_price: item.discount_price,
          mrp: item.mrp,
          type: item.type,
          visibility: item.visibility ?? true,
        },
        batchId: item.batchid,
        type: item.type || "UNITS",
        productPrice: item.discount_price,
        flavour:item.flavour,
        in_stock: item.in_stock || "0",
        productMrp: item.mrp,
      })
    });

    res.json({ data: updatedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

router.get("/products_by_category/:id", async (req, res) => {
  const id = req.params.id;;

  try {
    const data = await global.Database.executeQuery(`SELECT pd.*, pbd.discount_price, 
pbd.mrp, 
    pbd.label_name, 
    pbd.batch_quantity, 

    CASE 
        WHEN 
                CASE 
                    WHEN pd.type = 'UNITS' THEN 
                        (SELECT SUM(ind.in_stock) 
                         FROM inventory_def ind 
                         WHERE ind.product_id = pd.id)  
                    ELSE ind.in_stock 
                END 
             > 0 
        THEN TRUE 
        ELSE FALSE 
    END AS in_stock_status  

FROM product_def pd  
INNER JOIN category_def c on c.id = pd.category_id
INNER JOIN product_batch_details pbd 
    ON pd.id = pbd.product_id  
LEFT JOIN inventory_def ind  
    ON (CASE 
            WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
            ELSE ind.product_id = pd.id 
        END)
        where c.id = $1 and  pbd.visibility = TRUE and pd.visibility = TRUE
ORDER BY pd.product_name;`, [id]);
    res.status(200).json({ success: true, data })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error occurred" })

  }
})


router.get("/all_products", async (req, res) => {
  try {
    const products_instock = await global.Database.executeQuery(`
      SELECT 
          pd.*, 
          pbd.discount_price, 
          pbd.mrp, 
          pbd.label_name, 
          pbd.batch_quantity, 
      
          CASE 
              WHEN 
                      CASE 
                          WHEN pd.type = 'UNITS' THEN 
                              (SELECT SUM(ind.in_stock) 
                               FROM inventory_def ind 
                               WHERE ind.product_id = pd.id)  
                          ELSE ind.in_stock 
                      END 
                   > 0 
              THEN TRUE 
              ELSE FALSE 
          END AS in_stock_status  
      
      FROM product_def pd  
      INNER JOIN product_batch_details pbd 
          ON pd.id = pbd.product_id  
      LEFT JOIN inventory_def ind  
          ON (CASE 
                  WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
                  ELSE ind.product_id = pd.id 
              END)
              where pbd.visibility = TRUE and pd.visibility = true
      ORDER BY pd.product_name;
             `);
    res.status(200).json({ success: true, data: products_instock })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error occurred" })

  }
})

router.get('/all_brands', (req, res) => {
  global.Database.executeQuery('SELECT * FROM brand_def where visibility=true order by inserted_date ')
    .then(result => {
      const datas = result;
      res.json({ data: datas });
    })
    .catch(error => {
      console.error('Database error:', error.message);
      return res.status(500).json({ message: 'Error occurred', error: error });
    });
});

router.get("/products_by_brand/:id", async (req, res) => {
  const id = req.params.id;;

  try {
    const data = await global.Database.executeQuery(`SELECT pd.*, pbd.discount_price, 
pbd.mrp, 
    pbd.label_name, 
    pbd.batch_quantity, 

    CASE 
        WHEN 
                CASE 
                    WHEN pd.type = 'UNITS' THEN 
                        (SELECT SUM(ind.in_stock) 
                         FROM inventory_def ind 
                         WHERE ind.product_id = pd.id)  
                    ELSE ind.in_stock 
                END 
             > 0 
        THEN TRUE 
        ELSE FALSE 
    END AS in_stock_status  

FROM product_def pd  
INNER JOIN brand_def bd on bd.id = pd.brand_id
INNER JOIN product_batch_details pbd 
    ON pd.id = pbd.product_id  
LEFT JOIN inventory_def ind  
    ON (CASE 
            WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
            ELSE ind.product_id = pd.id 
        END)
        where bd.id = $1 and  pbd.visibility = TRUE and pd.visibility = TRUE
ORDER BY pd.product_name;`, [id]);
    res.status(200).json({ success: true, data })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error occurred" })

  }
})

router.post("/filterby_brands_and_category",async(req,res)=>{
 const {brand_id,category_id}=req.body;

  try {
    const data = await global.Database.executeQuery(`SELECT pd.*, pbd.discount_price, 
pbd.mrp, 
    pbd.label_name, 
    pbd.batch_quantity, 

    CASE 
        WHEN 
                CASE 
                    WHEN pd.type = 'UNITS' THEN 
                        (SELECT SUM(ind.in_stock) 
                         FROM inventory_def ind 
                         WHERE ind.product_id = pd.id)  
                    ELSE ind.in_stock 
                END 
             > 0 
        THEN TRUE 
        ELSE FALSE 
    END AS in_stock_status  

FROM product_def pd  
INNER JOIN brand_def bd on bd.id = pd.brand_id
INNER JOIN category_def c on c.id = pd.category_id

INNER JOIN product_batch_details pbd 
    ON pd.id = pbd.product_id  
LEFT JOIN inventory_def ind  
    ON (CASE 
            WHEN pd.type = 'PIECES' THEN ind.batch_id = pbd.id 
            ELSE ind.product_id = pd.id 
        END)
        where bd.id = $1 and c.id=$2 and  pbd.visibility = TRUE and pd.visibility = TRUE
ORDER BY pd.product_name;`, [brand_id,category_id]);
    res.status(200).json({ success: true, data })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "server error occurred" })

  }
})
module.exports = router;
