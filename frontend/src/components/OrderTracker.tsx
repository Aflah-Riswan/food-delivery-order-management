import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  order: Order;
  onSimulateStep: (orderId: string) => Promise<void> | void;
  onAutoSimulate?: (orderId: string) => Promise<void> | void;
  onCancelOrder: (orderId: string) => Promise<void> | void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string; description: string }[] = [
  { key: 'PENDING', label: 'Pending', icon: '📝', description: 'Order received and awaiting confirmation' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅', description: 'Order confirmed by restaurant' },
  { key: 'PREPARING', label: 'Preparing', icon: '🍳', description: 'Kitchen is preparing your food' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚴', description: 'Courier is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉', description: 'Order delivered successfully!' },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  order,
  onSimulateStep,
  onAutoSimulate,
  onCancelOrder,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isTerminal = isCancelled || isDelivered;
  const isCancellable = ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status);

  const currentStepIndex = isCancelled
    ? -1
    : STATUS_STEPS.findIndex((s) => s.key === order.status);

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      await onSimulateStep(order.id);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAutoSimulate = async () => {
    if (!onAutoSimulate) return;
    try {
      setIsSimulating(true);
      await onAutoSimulate(order.id);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await onCancelOrder(order.id);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="order-tracker-container" data-testid={`order-tracker-${order.id}`}>
      <div className="order-tracker-header">
        <div>
          <h2>Order #{order.id}</h2>
          <span className="order-timestamp">
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={`status-pill status-${order.status.toLowerCase()}`}>
          {order.status.replace(/_/g, ' ')}
        </div>
      </div>

      {isCancelled ? (
        <div className="cancelled-banner">
          <span className="cancelled-icon">✕</span>
          <div>
            <h4>Order Cancelled</h4>
            <p>This order was cancelled and will not be prepared or delivered.</p>
          </div>
        </div>
      ) : (
        <div className="status-timeline">
          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.key}
                className={`timeline-step ${
                  isCurrent ? 'active' : isDone ? 'completed' : 'upcoming'
                }`}
              >
                <div className="timeline-node">
                  <span className="step-icon">{step.icon}</span>
                  {idx < STATUS_STEPS.length - 1 && <div className="step-connector" />}
                </div>
                <div className="timeline-label-group">
                  <span className="step-title">{step.label}</span>
                  {isCurrent && <span className="step-desc">{step.description}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulator Actions */}
      <div className="simulator-control-panel">
        <div className="simulator-header">
          <span className="sim-badge">Simulation Controls</span>
          <span className="sim-info">Simulate live kitchen & courier progression</span>
        </div>
        <div className="simulator-buttons">
          <button
            type="button"
            className="btn btn-secondary sim-btn"
            disabled={isTerminal || isSimulating}
            onClick={handleSimulate}
          >
            {isSimulating ? 'Updating...' : 'Simulate Next Status'}
          </button>
          {onAutoSimulate && (
            <button
              type="button"
              className="btn btn-accent sim-btn"
              disabled={isTerminal || isSimulating}
              onClick={handleAutoSimulate}
            >
              Auto-Progress to Delivered
            </button>
          )}
          {isCancellable && (
            <button
              type="button"
              className="btn btn-outline-danger sim-btn"
              disabled={isCancelling}
              onClick={handleCancel}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Order Details Breakdown */}
      <div className="order-details-grid">
        <div className="order-details-card">
          <h3>Customer & Delivery</h3>
          <p><strong>Name:</strong> {order.customer.customerName}</p>
          <p><strong>Delivery Address:</strong> {order.customer.deliveryAddress}</p>
          <p><strong>Phone:</strong> {order.customer.phoneNumber}</p>
        </div>

        <div className="order-details-card">
          <h3>Ordered Items</h3>
          <div className="ordered-items-list">
            {order.items.map((item) => (
              <div key={item.menuItemId} className="ordered-item-row">
                <div className="item-name-group">
                  <span className="ordered-item-qty">{item.quantity}x</span>
                  <span className="ordered-item-name">{item.name}</span>
                </div>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="ordered-total-row">
            <span>Total</span>
            <span className="order-total-amount">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
