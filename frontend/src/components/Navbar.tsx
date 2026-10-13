import React from 'react';

export type ActiveTab = 'menu' | 'cart' | 'checkout' | 'tracking' | 'history';

interface NavbarProps {
  activeTab: ActiveTab;
  cartCount: number;
  hasActiveOrder: boolean;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  cartCount,
  hasActiveOrder,
  onTabChange,
}) => {
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onTabChange('menu')}>
          <span className="brand-logo">🍔</span>
          <div className="brand-text">
            <span className="brand-name">QuickBite</span>
            <span className="brand-tagline">Express Food Delivery</span>
          </div>
        </div>

        <nav className="navbar-nav">
          <button
            type="button"
            className={`nav-link ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => onTabChange('menu')}
          >
            Menu
          </button>

          <button
            type="button"
            className={`nav-link cart-nav-btn ${activeTab === 'cart' || activeTab === 'checkout' ? 'active' : ''}`}
            onClick={() => onTabChange('cart')}
          >
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {hasActiveOrder && (
            <button
              type="button"
              className={`nav-link ${activeTab === 'tracking' ? 'active' : ''}`}
              onClick={() => onTabChange('tracking')}
            >
              <span className="live-pulse" />
              Live Order
            </button>
          )}

          <button
            type="button"
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => onTabChange('history')}
          >
            Orders
          </button>
        </nav>
      </div>
    </header>
  );
};
