import React, { createContext, useState, useEffect, useContext } from 'react';
import ApiService from '../services/apiService';
import { AuthContext } from './AuthContext';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
    loadAllOrders();
  }, []);

  // Cargar pedidos cuando haya un usuario autenticado
  useEffect(() => {
    if (user?.id) {
      loadUserOrders(user.id);
      if (user.role === 'admin') {
        loadAllOrders();
      }
    } else {
      setUserOrders([]);
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getProducts();
      if (res.success) {
        setProducts(res.products);
      }
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async (userId) => {
    try {
      const res = await ApiService.getOrders(userId);
      if (res.success) {
        setUserOrders(res.orders);
      }
    } catch (error) {
      console.error('Error cargando pedidos del usuario:', error);
    }
  };

  const loadAllOrders = async () => {
    try {
      const res = await ApiService.getAllOrders();
      if (res.success) {
        setAllOrders(res.orders);
      }
    } catch (error) {
      console.error('Error cargando todos los pedidos:', error);
    }
  };

  const createCombo = async (comboData) => {
    try {
      const res = await ApiService.createCombo(comboData);
      if (res.success && res.product) {
        setProducts((prev) => [res.product, ...prev]);
      }
      return res;
    } catch (error) {
      console.error('Error creando combo:', error);
      return { success: false, message: 'Fallo al conectar con el servicio' };
    }
  };

  const checkDateCapacity = async (dateStr) => {
    try {
      return await ApiService.checkDateCapacity(dateStr);
    } catch (error) {
      console.error('Error verificando capacidad de fecha:', error);
      return { success: false, isFull: false, count: 0 };
    }
  };

  // REGLA OBLIGATORIA: Un usuario solo puede valorar o comentar un producto si ya lo ha comprado
  const hasUserPurchasedProduct = (productId) => {
    if (!user || !userOrders.length) return false;
    return userOrders.some(
      (order) =>
        order.status !== 'Cancelado' &&
        order.items.some((item) => item.id === productId)
    );
  };

  const addReview = async (productId, reviewData) => {
    const res = await ApiService.addReview(productId, reviewData);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? res.product : p))
      );
    }
    return res;
  };

  const syncProducts = (updatedList) => {
    setProducts(updatedList);
  };

  const cancelOrder = async (orderId) => {
    const res = await ApiService.cancelOrder(orderId);
    if (res.success) {
      if (res.updatedProducts) {
        setProducts(res.updatedProducts);
      }
      setUserOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? res.order : ord))
      );
      setAllOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? res.order : ord))
      );
    }
    return res;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        userOrders,
        allOrders,
        loading,
        loadProducts,
        loadUserOrders: () => user?.id && loadUserOrders(user.id),
        loadAllOrders,
        createCombo,
        checkDateCapacity,
        hasUserPurchasedProduct,
        addReview,
        syncProducts,
        cancelOrder
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
