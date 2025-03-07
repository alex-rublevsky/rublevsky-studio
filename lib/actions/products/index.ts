import getAllProducts from './getAllProducts';
import getProductBySlug from './getProductBySlug';
import getAdminProducts from './getAdminProducts';
import getProductById from './getProductById';
import createProduct from './createProduct';
import updateProduct from './updateProduct';
import deleteProduct from './deleteProduct';
import { PRODUCT_ATTRIBUTES } from '@/lib/utils/productAttributes';
import getProductsForSelection from './getProductsForSelection';

// Export getProductAttributes as a function that returns the same data as the server action did
const getProductAttributes = async () => Object.values(PRODUCT_ATTRIBUTES);

export {
  getAllProducts,
  getProductBySlug,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductAttributes,
  getProductsForSelection
}; 