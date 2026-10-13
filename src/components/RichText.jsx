import { renderMarkdown } from '@/lib/markdown';
import styles from './RichText.module.css';

// Treść z CMS (Markdown) – renderowana na serwerze, więc widoczna dla Google
export default function RichText({ markdown, className = '' }) {
  if (!markdown) return null;
  return (
    <div
      className={`${styles.richText} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
