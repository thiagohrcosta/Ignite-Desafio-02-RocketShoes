import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const stock = await api.get(`stock/${productId}`)
      const stockAmount = stock.data.amount;

      const existingItem = cart.find((cartItem) => cartItem.id === productId)
      
      if ( stockAmount <= 0 || (existingItem && existingItem!.amount >= stockAmount)){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (existingItem) {
        const updatedCart = cart.map((cartItem) => {
          return cartItem.id === productId ? {...cartItem, amount: cartItem.amount + 1} : cartItem;
        });
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
        return;
      }

      const productToAdd = await api.get(`/products/${productId}`);

      setCart([...cart, {...productToAdd.data, amount: 1}]);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart, {...productToAdd.data, amount: 1}])
      );
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = async (productId: number) => {
    try{
      const productExists = cart.find((cartItem) => cartItem.id === productId);

      if (productExists) {
        const updatedCart = cart.filter((cartItem) => cartItem.id !== productId);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try{
      if (amount <= 0) return;

      const stock = await api.get(`/stock/${productId}`);
      const stockAmount = stock.data.amount;

      if (amount <stockAmount) {
        const updatedCart = cart.map((cartItem) => cartItem.id === productId ? {...cartItem, amount} : cartItem);
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        toast.error("Quantidade solicitada fora de estoque")
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
