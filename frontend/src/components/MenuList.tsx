import React, { useState, useMemo } from 'react';
import { MenuItem } from '../types';
import { MenuCard } from './MenuCard';

interface MenuListProps {
  items: MenuItem[];
  isLoading: boolean;
  error: string | null;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  items,
  isLoading,
  error,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.category)));
    return ['All', ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="menu-status-container loading-state">
        <div className="spinner" />
        <p>Loading delicious menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-status-container error-state">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="menu-section">
      <div className="menu-toolbar">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search dishes, ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="no-items-placeholder">
          <p>No dishes found matching your selection.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};
