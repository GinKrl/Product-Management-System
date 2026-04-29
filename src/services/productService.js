import { supabase } from '../lib/supabaseClient';
import { makeStamp } from '../utils/stampHelper';

/**
 * Fetches products based on user type, merged with latest price from pricehist.
 */
export const getProducts = async (userType) => {
  try {
    let query = supabase.from('product').select('*');

    // USER only sees ACTIVE; ADMIN/SUPERADMIN see all
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }

    const { data: products, error: productError } = await query.order('prodcode');
    if (productError) throw productError;

    const { data: priceHistory, error: priceError } = await supabase
      .from('pricehist')
      .select('*');
    if (priceError) throw priceError;

    const mergedData = products.map(product => {
      const productPrices = priceHistory.filter(ph => ph.prodcode === product.prodcode);
      // FIX: columns are lowercase 'effdate' and 'unitprice' — matches actual DB
      productPrices.sort((a, b) => new Date(b.effdate) - new Date(a.effdate));
      const latestPrice = productPrices.length > 0 ? productPrices[0].unitprice : 0;
      return {
        ...product,
        price: latestPrice,
        current_price: latestPrice,
        record_status: product.record_status,
      };
    });

    return mergedData;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

/**
 * Fetches only INACTIVE products for the Deleted Items panel.
 */
export const getInactiveProducts = async () => {
  try {
    const { data: products, error: productError } = await supabase
      .from('product')
      .select('*')
      .eq('record_status', 'INACTIVE')
      .order('prodcode');

    if (productError) throw productError;
    return products;
  } catch (error) {
    console.error('Error fetching inactive products:', error.message);
    throw error;
  }
};

/**
 * Adds a new product and inserts its initial price into pricehist.
 */
export const addProduct = async (productData, userId) => {
  try {
    const code       = productData.prodcode || productData.code;
    const rawPrice   = productData.current_price || productData.price || 0;
    const cleanPrice = parseFloat(rawPrice.toString().replace(/,/g, ''));

    // FIX: use makeStamp for proper audit format
    const stamp = makeStamp('ADDED', userId);

    const { data: newProduct, error: productError } = await supabase
      .from('product')
      .insert([{
        prodcode:      code,
        description:   productData.description,
        unit:          productData.unit,
        record_status: 'ACTIVE',
        stamp,
      }])
      .select();

    if (productError) throw productError;

    const currentDate = new Date().toISOString().split('T')[0];

    // FIX: columns are lowercase — matches actual DB
    // pricehist DOES have record_status and stamp columns — confirmed from DB screenshot
    const { error: priceError } = await supabase
      .from('pricehist')
      .insert([{
        prodcode:      code,
        unitprice:     cleanPrice,
        effdate:       currentDate,
        record_status: 'ACTIVE',
        stamp,
      }]);

    if (priceError) throw priceError;
    return newProduct;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
};

/**
 * Updates a product and upserts a new price entry.
 */
export const updateProduct = async (prodcode, productData, userId) => {
  try {
    const rawPrice   = productData.current_price !== undefined
      ? productData.current_price
      : productData.price;
    const cleanPrice = parseFloat(rawPrice.toString().replace(/,/g, ''));

    // FIX: use makeStamp for proper audit format
    const stamp = makeStamp('EDITED', userId);

    const { data: updatedProduct, error: productError } = await supabase
      .from('product')
      .update({
        description: productData.description,
        unit:        productData.unit,
        stamp,
      })
      .eq('prodcode', prodcode)
      .select();

    if (productError) throw productError;

    const currentDate = new Date().toISOString().split('T')[0];

    // FIX: lowercase column names + correct onConflict key
    const { error: priceError } = await supabase
      .from('pricehist')
      .upsert([{
        prodcode:      prodcode,
        unitprice:     cleanPrice,
        effdate:       currentDate,
        record_status: 'ACTIVE',
        stamp,
      }], { onConflict: 'prodcode,effdate' });

    if (priceError) throw priceError;
    return updatedProduct;
  } catch (error) {
    console.error(`Error updating product ${prodcode}:`, error.message);
    throw error;
  }
};

/**
 * Soft deletes a product by setting record_status to INACTIVE.
 */
export const softDeleteProduct = async (prodcode, userId) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update({
        record_status: 'INACTIVE',
        // FIX: use makeStamp for proper audit format
        stamp: makeStamp('DEACTIVATED', userId),
      })
      .eq('prodcode', prodcode)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error soft deleting product ${prodcode}:`, error.message);
    throw error;
  }
};

/**
 * Recovers a soft-deleted product back to ACTIVE.
 */
export const recoverProduct = async (prodcode, userId) => {
  try {
    const { data, error } = await supabase
      .from('product')
      .update({
        record_status: 'ACTIVE',
        // FIX: use makeStamp for proper audit format
        stamp: makeStamp('REACTIVATED', userId),
      })
      .eq('prodcode', prodcode)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error recovering product ${prodcode}:`, error.message);
    throw error;
  }
};
