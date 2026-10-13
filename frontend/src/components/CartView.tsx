import React from 'react';
import { CartItem } from '../types';

interface CartViewProps {
  items: CartItem[];
  total: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (items.length === 0) {
    return (
      <div className="cart-empty-state">
        <div className="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Explore our menu and add your favorite dishes to start your order!</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</h2>
        <button
          type="button"
          className="btn-text-danger"
          onClick={onClearCart}
        >
          Clear All
        </button>
      </div>

      <div className="cart-items-list">
        {items.map(({ item, quantity }) => {
          const itemSubtotal = (item.price * quantity).toFixed(2);
          return (
            <div key={item.id} className="cart-item-row" data-testid={`cart-row-${item.id}`}>
              <div className="cart-item-info">
                <h4 className="cart-item-name">{item.name}</h4>
                <span className="cart-item-unit-price">${item.price.toFixed(2)} each</span>
              </div>

              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    aria-label="−"
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    aria-label="+"
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <span className="cart-item-subtotal">${itemSubtotal}</span>

                <button
                  type="button"
                  className="cart-item-remove-btn"
                  title="Remove item"
                  onClick={() => onRemoveItem(item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary-box">
        <div className="summary-row total-row">
          <span>Total:</span>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary checkout-action-btn"
          onClick={onProceedToCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};
