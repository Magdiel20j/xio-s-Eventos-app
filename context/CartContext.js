import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import ApiService from '../services/apiService';
import { AuthContext } from './AuthContext';
import { ProductContext } from './ProductContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);
  const { syncProducts, loadUserOrders } = useContext(ProductContext);

  // Agregar al carrito con validación estricta de inventario disponible
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      Alert.alert('Sin Inventario', `El producto "${product.name}" está actualmente agotado.`);
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        Alert.alert(
          'Límite de Stock',
          `No puedes agregar más de ${product.stock} unidades de "${product.name}". Ya tienes ${currentQty} en tu carrito.`
        );
        return false;
      }

      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
      return true;
    } else {
      if (quantity > product.stock) {
        Alert.alert(
          'Stock Insuficiente',
          `Solo hay ${product.stock} unidades disponibles de "${product.name}".`
        );
        return false;
      }

      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          category: product.category,
          quantity: quantity
        }
      ]);
      return true;
    }
  };

  // Modificar cantidad con validación estricta (no negativos, no superior a stock)
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    if (newQuantity > item.stock) {
      Alert.alert('Inventario Máximo', `Solo hay ${item.stock} unidades disponibles en inventario.`);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Totales calculados
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Finalizar compra y agendar evento
  const checkout = async (reservationDetails = {}) => {
    if (cart.length === 0) {
      Alert.alert('Carrito Vacío', 'Agrega paquetes a tu carrito antes de continuar.');
      return { success: false, message: 'Carrito vacío' };
    }

    if (!user) {
      Alert.alert('Sesión Requerida', 'Debes iniciar sesión para completar la reserva.');
      return { success: false, message: 'Usuario no autenticado' };
    }

    try {
      const orderData = {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone || '6040-9234',
        items: cart,
        total: totalAmount,
        eventDate: reservationDetails.eventDate || new Date().toISOString().split('T')[0],
        eventLocation: reservationDetails.eventLocation || 'San Salvador'
      };

      const res = await ApiService.createOrder(orderData);

      if (res.success) {
        // Actualizar stock de productos en ProductContext
        syncProducts(res.updatedProducts);
        // Recargar pedidos del usuario
        loadUserOrders();
        // Limpiar carrito
        clearCart();
        return { success: true, order: res.order };
      } else {
        if (!res.capacityReached) {
          Alert.alert('Error al reservar', res.message || 'No se pudo procesar la orden.');
        }
        return res;
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar tu pedido.');
      return { success: false, message: error.message };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkout,
        totalItems,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
