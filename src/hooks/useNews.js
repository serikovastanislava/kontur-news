import { useCallback, useEffect, useState } from 'react';
import { API } from '../api';

export function useNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async () => {
    try {
      const response = await fetch(API.news, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setNews(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки новостей:', err);
      setError('Не удалось обновить новости');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    const timer = setInterval(loadNews, 30_000);
    return () => clearInterval(timer);
  }, [loadNews]);

  return { news, loading, error, reload: loadNews };
}
