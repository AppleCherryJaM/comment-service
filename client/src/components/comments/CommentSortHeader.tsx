import React from 'react';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';

interface CommentSortHeaderProps {
  sortBy: 'name' | 'email' | 'created_at';
  sortOrder: 'ASC' | 'DESC';
  onSortChange: (sortBy: 'name' | 'email' | 'created_at', sortOrder: 'ASC' | 'DESC') => void;
  totalComments: number;
}

export const CommentSortHeader: React.FC<CommentSortHeaderProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  totalComments,
}) => {
  const handleSortClick = (field: 'name' | 'email' | 'created_at') => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSortChange(field, field === 'created_at' ? 'DESC' : 'ASC');
    }
  };

  const renderSortIndicator = (field: 'name' | 'email' | 'created_at') => {
    if (sortBy !== field) return null;
    return sortOrder === 'ASC' ? (
      <ArrowUp size={13} className="sort-dir-icon" />
    ) : (
      <ArrowDown size={13} className="sort-dir-icon" />
    );
  };

  return (
    <div className="modern-sort-header">
      <div className="sort-header-title">
        <MessageCircle size={18} className="title-icon" />
        <span className="title-text">Обсуждение</span>
        <span className="title-count">{totalComments}</span>
      </div>

      <div className="sort-segmented-control">
        <button
          type="button"
          className={`sort-tab-btn ${sortBy === 'created_at' ? 'active' : ''}`}
          onClick={() => handleSortClick('created_at')}
        >
          <span>Новые</span>
          {renderSortIndicator('created_at')}
        </button>

        <button
          type="button"
          className={`sort-tab-btn ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => handleSortClick('name')}
        >
          <span>По имени</span>
          {renderSortIndicator('name')}
        </button>

        <button
          type="button"
          className={`sort-tab-btn ${sortBy === 'email' ? 'active' : ''}`}
          onClick={() => handleSortClick('email')}
        >
          <span>По email</span>
          {renderSortIndicator('email')}
        </button>
      </div>
    </div>
  );
};
