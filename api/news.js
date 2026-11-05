const NEWS_QUERY = '(Africa OR "South Sudan" OR Uganda OR Kenya OR Tanzania OR Ethiopia) (agriculture OR fisheries OR livelihoods OR "community development" OR governance OR sustainability)';
const RESEARCH_QUERY = 'agriculture fisheries livelihoods Africa';
const REPORT_QUERY = 'agriculture fisheries livelihoods food security Africa';
const SOURCE_TIMEOUT_MS = 8000;

const isJsonResponse = response =>
  /^application\/(?:json|[\w.+-]+\+json)(?:\s*;|$)/i.test(response.headers.get('content-type') || '');

const parseGdeltDate = value => {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(value || '');
  if (!match) return null;

  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toIsoDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const toCrossrefDate = item => {
  const dateParts = item.published && item.published['date-parts'] && item.published['date-parts'][0];
  if (!Array.isArray(dateParts) || !dateParts.length) return null;

  const [year, month = 1, day = 1] = dateParts;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const safeUrl = value => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`);
  if (!isJsonResponse(response)) throw new Error('Provider returned a non-JSON response');
  return response.json();
};

const getNews = async () => {
  const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
  url.searchParams.set('query', NEWS_QUERY);
  url.searchParams.set('mode', 'ArtList');
  url.searchParams.set('format', 'json');
  url.searchParams.set('maxrecords', '20');
  url.searchParams.set('sort', 'DateDesc');
  url.searchParams.set('timespan', '7d');

  const result = await fetchJson(url);
  if (!Array.isArray(result.articles)) throw new Error('News provider returned an invalid response');

  return result.articles.map(article => ({
    title: typeof article.title === 'string' ? article.title.trim() : '',
    url: safeUrl(article.url),
    source: typeof article.domain === 'string' ? article.domain : 'Africa news',
    publishedAt: parseGdeltDate(article.seendate),
    category: 'news',
    type: 'News'
  }));
};

const getResearch = async () => {
  const url = new URL('https://api.crossref.org/works');
  url.searchParams.set('query.bibliographic', RESEARCH_QUERY);
  url.searchParams.set('filter', `from-pub-date:${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}`);
  url.searchParams.set('sort', 'published');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('rows', '15');
  url.searchParams.set('select', 'title,URL,publisher,published,published-print,published-online,type');

  const result = await fetchJson(url, {
    headers: { 'User-Agent': 'KonnectAfricaNews/1.0 (https://konnectafrica.info)' }
  });
  const items = result.message && result.message.items;
  if (!Array.isArray(items)) throw new Error('Research provider returned an invalid response');

  return items.map(item => ({
    title: Array.isArray(item.title) ? item.title[0] : '',
    url: safeUrl(item.URL),
    source: typeof item.publisher === 'string' ? item.publisher : 'Crossref',
    publishedAt: toIsoDate(
      item['published-online'] && item['published-online']['date-time'] ||
      item['published-print'] && item['published-print']['date-time'] ||
      null
    ) || toCrossrefDate(item),
    category: 'research',
    type: 'Research'
  }));
};

const getReports = async () => {
  const url = new URL('https://search.worldbank.org/api/v2/wds');
  url.searchParams.set('format', 'json');
  url.searchParams.set('rows', '15');
  url.searchParams.set('os', '0');
  url.searchParams.set('srt', 'docdt');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('qterm', REPORT_QUERY);

  const result = await fetchJson(url);
  if (!result.documents || typeof result.documents !== 'object') {
    throw new Error('Reports provider returned an invalid response');
  }

  return Object.values(result.documents)
    .filter(report => report && typeof report.display_title === 'string')
    .map(report => ({
      title: report.display_title,
      url: safeUrl(report.url),
      source: report.owner || 'World Bank',
      publishedAt: toIsoDate(report.docdt),
      category: 'reports',
      type: 'Report'
    }));
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ warning: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300');

  const providers = [
    { name: 'news', fetch: getNews },
    { name: 'reports', fetch: getReports },
    { name: 'research', fetch: getResearch }
  ];
  const results = await Promise.allSettled(providers.map(provider => provider.fetch()));
  const articles = [];
  const unavailableSources = [];

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      unavailableSources.push(providers[index].name);
      console.error(`News ${providers[index].name} source error:`, result.reason);
      return;
    }

    articles.push(...result.value);
  });

  const uniqueArticles = articles
    .filter(article => article.title && article.url)
    .filter((article, index, list) =>
      list.findIndex(candidate => candidate.url === article.url) === index
    )
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
    .slice(0, 45);

  if (!uniqueArticles.length) {
    return res.status(502).json({
      articles: [],
      updatedAt: null,
      unavailableSources: providers.map(provider => provider.name),
      warning: 'News, reports and research are temporarily unavailable. Please try again later.'
    });
  }

  return res.status(200).json({
    articles: uniqueArticles,
    updatedAt: new Date().toISOString(),
    unavailableSources,
    warning: unavailableSources.length
      ? `Some sources are temporarily unavailable: ${unavailableSources.join(', ')}.`
      : null
  });
};
