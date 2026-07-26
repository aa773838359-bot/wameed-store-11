export function StoreStructuredData() {
  const storeName = 'وميض ستور'
  const storeNameEn = 'Wameed Store'
  const baseUrl = 'https://wameedstore.com'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: storeName,
    alternateName: storeNameEn,
    url: baseUrl,
    description: 'متجرك الإلكتروني الشامل - اكتشف أفضل المنتجات بأسعار مذهلة مع توصيل سريع وضمان الجودة',
    priceRange: '$$',
    currency: 'SAR',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'الرياض',
    },
    sameAs: [],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
