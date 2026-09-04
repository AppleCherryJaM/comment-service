import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';

interface CommentSortHeaderProps {
  sortBy: 'username' | 'email' | 'createdAt';
  sortOrder: 'ASC' | 'DESC';
  onSortChange: (sortBy: 'username' | 'email' | 'createdAt', sortOrder: 'ASC' | 'DESC') => void;
  totalComments: number;
}

export const CommentSortHeader: React.FC<CommentSortHeaderProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  totalComments,
}) => {
  const handleSortClick = (field: 'username' | 'email' | 'createdAt') => {
    if (sortBy === field) {
      // Toggle ASC/DESC
      onSortChange(field, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Switch field, default to DESC for date, ASC for text
      onSortChange(field, field === 'createdAt' ? 'DESC' : 'ASC');
    }
  };

  const renderSortIcon = (field: 'username' | 'email' | 'createdAt') => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} className="sort-icon-neutral" />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp size={14} className="sort-icon-active" />
    ) : (
      <ArrowDown size={14} className="sort-icon-active" />
    );
  };

  return (
    <div className="comment-sort-header">
      <div className="total-comments-badge">
        <Filter size={16} />
        <span>Всего главных комментариев: <strong>{totalComments}</strong></span>
      </div>

      <div className="sort-controls">
        <span className="sort-label">Сортировка:</span>
        <button
          type="button"
          className={`sort-pill ${sortBy === 'createdAt' ? 'active' : ''}`}
          onClick={() => handleSortClick('createdAt')}
        >
          <span>Дата добавления</span>
          {renderSortIcon('createdAt')}
        </button>

        <button
          type="button"
          className={`sort-pill ${sortBy === 'username' ? 'active' : ''}`}
          onClick={() => handleSortClick('username')}
        >
          <span>Имя пользователя</span>
          {renderSortIcon('username')}
        </button>

        <button
          type="button"
          className={`sort-pill ${sortBy === 'email' ? 'active' : ''}`}
          onClick={() => handleSortClick('email')}
        >
          <span>E-mail</span>
          {renderSortIcon('email')}
        </button>
      </div>
    </div>
  );
};
