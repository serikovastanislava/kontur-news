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
  const [important, setImportant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async () => {
    try {
      const [feed, hero, importantFeed] = await Promise.all([
        getJson(`${API.news}?limit=100`),
        getJson(API.featured),
        getJson(`${API.important}?limit=12`),
      ]);
      setNews(Array.isArray(feed) ? feed : []);
      setFeatured(hero || null);
      setImportant(Array.isArray(importantFeed) ? importantFeed : []);
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

  return { news, featured, important, loading, error, reload: loadNews };
}
