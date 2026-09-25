/**
 * Renders one JSON-LD structured-data block. `<` is escaped so text inside
 * the data (e.g. a blog title) can never close the script tag early.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
