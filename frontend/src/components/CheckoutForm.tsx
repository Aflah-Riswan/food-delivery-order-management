import React, { useState } from 'react';
import { CustomerInfo } from '../types';

interface CheckoutFormProps {
  cartTotal: number;
  itemCount: number;
  isSubmitting: boolean;
  onSubmit: (customer: CustomerInfo) => void;
  onBackToCart: () => void;
}

interface FormErrors {
  customerName?: string;
  deliveryAddress?: string;
  phoneNumber?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cartTotal,
  itemCount,
  isSubmitting,
  onSubmit,
  onBackToCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errs.customerName = 'Name must be at least 2 characters';
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      errs.deliveryAddress = 'Address must be at least 5 characters';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!phoneNumber.trim() || !phoneRegex.test(phoneNumber.trim())) {
      errs.phoneNumber = 'Valid phone number is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    onSubmit({
      customerName: customerName.trim(),
      deliveryAddress: deliveryAddress.trim(),
      phoneNumber: phoneNumber.trim(),
    });
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button type="button" className="btn-back" onClick={onBackToCart}>
          ← Back to Cart
        </button>
        <h2>Checkout & Delivery Details</h2>
      </div>

      <div className="checkout-content-grid">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">
              Full Name
            </label>
            <input
              id="customerName"
              type="text"
              className={`form-input ${errors.customerName ? 'input-error' : ''}`}
              placeholder="e.g. Jane Doe"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: undefined }));
              }}
            />
            {errors.customerName && <span className="error-message">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="deliveryAddress" className="form-label">
              Delivery Address
            </label>
            <textarea
              id="deliveryAddress"
              rows={3}
              className={`form-input ${errors.deliveryAddress ? 'input-error' : ''}`}
              placeholder="e.g. 123 Main St, Apt 4B, Springfield"
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                if (errors.deliveryAddress) setErrors((prev) => ({ ...prev, deliveryAddress: undefined }));
              }}
            />
            {errors.deliveryAddress && <span className="error-message">{errors.deliveryAddress}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={`form-input ${errors.phoneNumber ? 'input-error' : ''}`}
              placeholder="e.g. +1 555-123-4567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="order-summary-card">
            <h4>Order Summary</h4>
            <div className="summary-item">
              <span>Items count:</span>
              <span>{itemCount}</span>
            </div>
            <div className="summary-item summary-total">
              <span>Total to pay:</span>
              <span className="total-highlight">${cartTotal.toFixed(2)}</span>
            </div>
            <p className="summary-note">Payment is Cash on Delivery. In-memory data resets upon restart.</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit-order"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};
