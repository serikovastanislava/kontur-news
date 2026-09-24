import { useEffect, useState } from 'react';
import { fallbackNewsImage } from '../../utils/covers';

export default function NewsImage({ item, alt = '', className = '', ...props }) {
  const fallback = fallbackNewsImage(item);
  // All editorial/news photos are intentionally replaced by the site's eye placeholder.
  const remote = '';
  const [src, setSrc] = useState(remote || fallback);

  useEffect(() => {
    setSrc(remote || fallback);
  }, [remote, fallback]);

  const handleError = () => {
    if (src !== fallback) setSrc(fallback);
  };

  return (
    <img
      {...props}
      className={className}
      src={src}
      alt={alt}
      onError={handleError}
      decoding="async"
    />
  );
}
