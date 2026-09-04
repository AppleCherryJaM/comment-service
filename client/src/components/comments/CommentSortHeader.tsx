import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';

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

  const renderSortIcon = (field: 'name' | 'email' | 'created_at') => {
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
          className={`sort-pill ${sortBy === 'created_at' ? 'active' : ''}`}
          onClick={() => handleSortClick('created_at')}
        >
          <span>Дата добавления</span>
          {renderSortIcon('created_at')}
        </button>

        <button
          type="button"
          className={`sort-pill ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => handleSortClick('name')}
        >
          <span>Имя пользователя</span>
          {renderSortIcon('name')}
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
