import React from 'react';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import styles from './CommentSortHeader.module.scss';

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
      <ArrowUp size={13} className={styles.dirIcon} />
    ) : (
      <ArrowDown size={13} className={styles.dirIcon} />
    );
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <MessageCircle size={18} className={styles.icon} />
        <span className={styles.text}>Обсуждение</span>
        <span className={styles.count}>{totalComments}</span>
      </div>

      <div className={styles.segmentedControl}>
        <button
          type="button"
          className={`${styles.tabBtn} ${sortBy === 'created_at' ? styles.active : ''}`}
          onClick={() => handleSortClick('created_at')}
        >
          <span>Новые</span>
          {renderSortIndicator('created_at')}
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${sortBy === 'name' ? styles.active : ''}`}
          onClick={() => handleSortClick('name')}
        >
          <span>По имени</span>
          {renderSortIndicator('name')}
        </button>

        <button
          type="button"
          className={`${styles.tabBtn} ${sortBy === 'email' ? styles.active : ''}`}
          onClick={() => handleSortClick('email')}
        >
          <span>По email</span>
          {renderSortIndicator('email')}
        </button>
      </div>
    </div>
  );
};
