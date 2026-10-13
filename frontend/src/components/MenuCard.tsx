import React from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onAddToCart }) => {
  return (
    <div className="menu-card" data-testid={`menu-card-${item.id}`}>
      <div className="menu-card-image-wrapper">
        <img src={item.imageUrl} alt={item.name} className="menu-card-image" loading="lazy" />
        <span className="menu-card-badge">{item.category}</span>
      </div>
      <div className="menu-card-content">
        <h3 className="menu-card-title">{item.name}</h3>
        <p className="menu-card-description">{item.description}</p>
        <div className="menu-card-footer">
          <span className="menu-card-price">${item.price.toFixed(2)}</span>
          <button
            type="button"
            className="btn btn-primary add-to-cart-btn"
            onClick={() => onAddToCart(item)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
