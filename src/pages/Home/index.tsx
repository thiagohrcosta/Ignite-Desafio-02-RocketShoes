import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  // const { addProduct, cart } = useCart();

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      // TODO
      const products = await api.get('products');
      setProducts(products.data)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    // TODO
  }

  return (
    <ProductList>
      {products.map((item) => {
        return(
          <li key={item.id}>
            <img src={item.image} alt={item.title} />
            <strong>{item.title}</strong>
            <span>{formatPrice(item.price)}</span>
            <button
              type="button"
              data-testid="add-product-button"
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {item.id || 0}
                {/* {cartItemsAmount[product.id] || 0} 2 */}
              </div>

              <span>ADICIONAR AO CARRINHO</span>

            </button>
          </li>
        )
      })}

    </ProductList>
  );
};

export default Home;
