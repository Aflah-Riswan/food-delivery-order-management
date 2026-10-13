import React from 'react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onRefresh: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onSelectOrder,
  onRefresh,
}) => {
  return (
    <div className="order-history-container">
      <div className="history-header">
        <h2>Order History ({orders.length})</h2>
        <button type="button" className="btn btn-secondary" onClick={onRefresh}>
          ↻ Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="history-empty-state">
          <p>No orders placed yet. Browse our menu to make your first order!</p>
        </div>
      ) : (
        <div className="orders-cards-list">
          {orders.map((order) => (
            <div
              key={order.id}
              className="order-card-item"
              onClick={() => onSelectOrder(order)}
            >
              <div className="order-card-main">
                <div className="order-id-block">
                  <span className="order-card-id">#{order.id}</span>
                  <span className="order-card-date">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`status-pill status-${order.status.toLowerCase()}`}>
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="order-card-body">
                <p className="order-items-preview">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
                <div className="order-card-footer">
                  <span className="order-card-total">${order.totalAmount.toFixed(2)}</span>
                  <span className="view-tracking-link">Track Order →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
