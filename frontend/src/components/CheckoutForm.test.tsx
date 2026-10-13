import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from './CheckoutForm';

describe('CheckoutForm Component', () => {
  it('renders input fields for customer name, address, and phone number', () => {
    render(
      <CheckoutForm
        cartTotal={25.0}
        itemCount={2}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onBackToCart={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delivery address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
  });

  it('validates fields and shows error messages when submitted empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CheckoutForm
        cartTotal={25.0}
        itemCount={2}
        isSubmitting={false}
        onSubmit={onSubmit}
        onBackToCart={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /place order/i });
    await user.click(submitBtn);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/address must be at least 5 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/valid phone number is required/i)).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CheckoutForm
        cartTotal={25.0}
        itemCount={2}
        isSubmitting={false}
        onSubmit={onSubmit}
        onBackToCart={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/delivery address/i), '456 Garden Way');
    await user.type(screen.getByLabelText(/phone number/i), '555-1234');

    const submitBtn = screen.getByRole('button', { name: /place order/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      customerName: 'Jane Doe',
      deliveryAddress: '456 Garden Way',
      phoneNumber: '555-1234',
    });
  });
});
