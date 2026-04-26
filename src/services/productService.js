import { supabase } from '../lib/supabaseClient';


/**
 * Fetches products based on user type.
 * USER accounts only see ACTIVE records. ADMIN/SUPERADMIN see all records.
 */
export const getProducts = async (userType) => {
  try {
    // 1. Fetch all product details so descriptions and units show up properly
    let query = supabase.from('product').select('*');
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    const { data: products, error: productError } = await query;
    if (productError) throw productError;


    // 2. Fetch the price history table to get the actual prices
    const { data: priceHistory, error: priceError } = await supabase
      .from('pricehist')
      .select('*');
    if (priceError) throw priceError;


    // 3. Stitch the data together so the frontend gets BOTH descriptions AND prices
    const mergedData = products.map(product => {
      // Find all prices associated with this specific product code
      const productPrices = priceHistory.filter(ph => ph.prodcode === product.prodcode);
     
      // Sort them by date (newest first) to ensure we grab the current active price
      productPrices.sort((a, b) => new Date(b.effdate) - new Date(a.effdate));
     
      const latestPrice = productPrices.length > 0 ? productPrices[0].unitprice : 0;


      return {
        ...product,
        price: latestPrice,          // Maps to UI tables expecting .price
        current_price: latestPrice   // Maps to UI forms expecting .current_price
      };
    });


    return mergedData;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};


export const addProduct = async (productData) => {
  try {
    console.log("Raw payload received from form:", productData);


    // 1. Safely extract all variables, ensuring we catch the right keys
    const code = productData.prodcode || productData.code;
    const description = productData.description;
    const unit = productData.unit;
   
    // Safely extract price, and strip out any accidental commas or string characters
    const rawPrice = productData.current_price || productData.price || 0;
    const cleanPrice = parseFloat(rawPrice.toString().replace(/,/g, ''));


    // 2. Insert into the 'product' table
    const { data: newProduct, error: productError } = await supabase
      .from('product')
      .insert([{
        prodcode: code,
        description: description,
        unit: unit,
        record_status: 'ACTIVE'
      }])
      .select();


    if (productError) {
      console.error("Product Table Insert Error:", productError);
      throw productError;
    }


    // 3. Insert into the 'pricehist' table
    const currentDate = new Date().toISOString().split('T')[0]; // Formats safely to YYYY-MM-DD
   
    const { error: priceError } = await supabase
      .from('pricehist')
      .insert([{
        prodcode: code,
        unitprice: cleanPrice,
        effdate: currentDate,    
        record_status: 'ACTIVE'
      }]);


    if (priceError) {
      console.error("Price History Insert Error:", priceError);
      throw priceError;
    }


    return newProduct;
  } catch (error) {
    console.error('Final Error adding product:', error);
    throw error;
  }
};


export const updateProduct = async (prodcode, productData) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update(productData)
      .eq('prodcode', prodcode)
      .select();


    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating product ${prodcode}:`, error.message);
    throw error;
  }
};


export const softDeleteProduct = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update({ record_status: 'INACTIVE' })
      .eq('prodcode', prodcode)
      .select();


    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error soft deleting product ${prodcode}:`, error.message);
    throw error;
  }
};


export const recoverProduct = async (prodcode) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update({ record_status: 'ACTIVE' })
      .eq('prodcode', prodcode)
      .select();


    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error recovering product ${prodcode}:`, error.message);
    throw error;
  }
};

