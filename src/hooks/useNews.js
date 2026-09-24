import { useCallback, useEffect, useState } from 'react';
import { API } from '../api';

async function getJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export function useNews() {
  const [news, setNews] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async () => {
    try {
      const [feed, hero] = await Promise.all([
        getJson(`${API.news}?limit=100`),
        getJson(API.featured),
      ]);
      setNews(Array.isArray(feed) ? feed : []);
      setFeatured(hero || null);
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

  return { news, featured, loading, error, reload: loadNews };
}
