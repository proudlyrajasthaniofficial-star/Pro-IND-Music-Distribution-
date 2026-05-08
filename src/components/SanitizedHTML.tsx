import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SanitizedHTMLProps {
  html: string;
  className?: string;
  tag?: React.ElementType;
}

const SanitizedHTML: React.FC<SanitizedHTMLProps> = ({ 
  html, 
  className = '', 
  tag: Tag = 'div' as React.ElementType
}) => {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 
        'blockquote', 'code', 'pre'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style', 'src', 'alt', 'width', 'height'],
    });
  }, [html]);

  const Comp = Tag as any;

  return (
    <Comp 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SanitizedHTML;
