import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from './context/CartContext';
import { MenuItem, Order, CustomerInfo } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { MenuList } from './components/MenuList';
import { CartView } from './components/CartView';
import { CheckoutForm } from './components/CheckoutForm';
import { OrderTracker } from './components/OrderTracker';
import { OrderHistory } from './components/OrderHistory';

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined) || '';
const API_BASE = rawApiUrl.replace(/\/+$/, '');

export const App: React.FC = () => {
  const { items: cartItems, cartTotal, totalCount, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();

  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  }, []);

  // Fetch Menu Items from Backend
  const fetchMenu = useCallback(async () => {
    try {
      setIsLoadingMenu(true);
      setMenuError(null);
      const res = await fetch(`${API_BASE}/api/menu`);
      if (!res.ok) {
        throw new Error(`Failed to load menu (${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMenuItems(data.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching menu';
      setMenuError(msg);
    } finally {
      setIsLoadingMenu(false);
    }
  }, []);

  // Fetch Orders History
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      }
    } catch {
      // Ignore background refresh errors
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, [fetchMenu, fetchOrders]);

  // Server-Sent Events (SSE) connection for active order tracking
  useEffect(() => {
    if (!activeOrder) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const orderId = activeOrder.id;
    const url = `${API_BASE}/api/orders/${orderId}/tracking`;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'STATUS_UPDATE' && parsed.order) {
            const updated: Order = parsed.order;
            setActiveOrder(updated);
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      es.onerror = () => {
        // Fallback polling if SSE is disconnected
        es.close();
      };
    } catch {
      // Fallback
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [activeOrder?.id]);

  // Handle Checkout Submission
  const handlePlaceOrder = async (customer: CustomerInfo) => {
    try {
      setIsSubmittingOrder(true);
      const payload = {
        customer,
        items: cartItems.map((ci) => ({
          menuItemId: ci.item.id,
          quantity: ci.quantity,
        })),
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to place order');
      }

      const createdOrder: Order = resData.data;
      clearCart();
      setActiveOrder(createdOrder);
      setOrders((prev) => [createdOrder, ...prev]);
      setActiveTab('tracking');
      showNotification(`Order #${createdOrder.id} placed successfully!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error placing order';
      showNotification(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Simulate Next Step
  const handleSimulateStep = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepOnly: true }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Simulation error');
      }

      const updated: Order = data.data;
      setActiveOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showNotification(`Order status updated to ${updated.status}`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      showNotification(msg, 'error');
    }
  };

  // Auto Simulate
  const handleAutoSimulate = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto: true, intervalMs: 2500 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Auto simulation failed');
      }

      showNotification('Auto simulation started: Watching live progression...', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Auto-simulation error';
      showNotification(msg, 'error');
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      const cancelledOrder: Order = {
        ...(activeOrder as Order),
        status: 'CANCELLED',
      };
      setActiveOrder(cancelledOrder);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
      showNotification('Order has been cancelled', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cancellation error';
      showNotification(msg, 'error');
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        activeTab={activeTab}
        cartCount={totalCount}
        hasActiveOrder={activeOrder !== null}
        onTabChange={(tab) => setActiveTab(tab)}
      />


      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main className="main-content">
        {activeTab === 'menu' && (
          <MenuList
            items={menuItems}
            isLoading={isLoadingMenu}
            error={menuError}
            onAddToCart={(item) => {
              addToCart(item);
              showNotification(`Added "${item.name}" to cart`, 'success');
            }}
          />
        )}

        {activeTab === 'cart' && (
          <CartView
            items={cartItems}
            total={cartTotal}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onProceedToCheckout={() => setActiveTab('checkout')}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutForm
            cartTotal={cartTotal}
            itemCount={totalCount}
            isSubmitting={isSubmittingOrder}
            onSubmit={handlePlaceOrder}
            onBackToCart={() => setActiveTab('cart')}
          />
        )}

        {activeTab === 'tracking' && activeOrder && (
          <OrderTracker
            order={activeOrder}
            onSimulateStep={handleSimulateStep}
            onAutoSimulate={handleAutoSimulate}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeTab === 'history' && (
          <OrderHistory
            orders={orders}
            onSelectOrder={(ord) => {
              setActiveOrder(ord);
              setActiveTab('tracking');
            }}
            onRefresh={fetchOrders}
          />
        )}
      </main>

      <footer className="footer-bar">
        <p>Food Delivery Management System</p>
      </footer>
    </div>
  );
};

export default App;
