/* Atlas · Icon
   Thin wrapper around Lucide. Requires the Lucide UMD script on the page
   (https://unpkg.com/lucide@latest). Renders an <i data-lucide> placeholder
   and asks Lucide to swap it for an SVG after mount. */
import React from 'react';

export function Icon({ name = 'circle', size = 20, strokeWidth = 2, color = 'currentColor', style = {}, className = '' }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (window.lucide && ref.current) {
      // Reset so re-renders re-create the svg
      ref.current.innerHTML = '';
      const i = document.createElement('i');
      i.setAttribute('data-lucide', name);
      ref.current.appendChild(i);
      window.lucide.createIcons({
        attrs: { width: size, height: size, 'stroke-width': strokeWidth },
        nameAttr: 'data-lucide',
      });
    }
  }, [name, size, strokeWidth]);

  return (
    <span
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        color,
        flex: '0 0 auto',
        ...style,
      }}
    />
  );
}
