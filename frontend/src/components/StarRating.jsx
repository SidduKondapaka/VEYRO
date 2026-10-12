import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, size = 16, interactive = false, onRatingChange = null }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars.map((star) => {
        const isFilled = rating >= star;
        const isHalf = !isFilled && rating >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: isFilled || isHalf ? '#f59e0b' : '#cbd5e1',
            }}
          >
            <Star
              size={size}
              fill={isFilled || isHalf ? '#f59e0b' : 'none'}
              stroke={isFilled || isHalf ? '#f59e0b' : '#94a3b8'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
