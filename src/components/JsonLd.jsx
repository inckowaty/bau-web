// Dane strukturalne schema.org (renderowane na serwerze)
export default function JsonLd({ data }) {
  if (!data) return null;
  // "<" jako escape unicode – tekst z CMS nie może zamknąć tagu <script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
