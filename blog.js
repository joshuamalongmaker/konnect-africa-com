document.addEventListener('DOMContentLoaded', function() {
    const newsList = document.getElementById('live-news-list');
    const newsStatus = document.getElementById('news-status');
    if (!newsList || !newsStatus) return;

    const refreshInterval = 60 * 60 * 1000;
    const filterButtons = Array.from(document.querySelectorAll('[data-news-category]'));
    const searchInput = document.getElementById('news-search');
    let allArticles = [];
    let activeCategory = 'all';

    const renderArticles = () => {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const articles = allArticles.filter(article => {
            const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
            const searchText = `${article.title} ${article.source} ${article.type}`.toLowerCase();
            return matchesCategory && (!searchTerm || searchText.includes(searchTerm));
        });

        newsList.replaceChildren();

        if (!articles.length) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'news-empty';
            emptyMessage.textContent = allArticles.length
                ? 'No items match your filters. Try another topic or content type.'
                : 'No items are available right now.';
            newsList.append(emptyMessage);
            return;
        }

        articles.forEach(article => {
            const card = document.createElement('article');
            card.className = 'news-card';

            const meta = document.createElement('div');
            meta.className = 'blog-meta';
            const source = document.createElement('span');
            source.className = 'blog-category';
            source.textContent = `${article.type || 'News'} · ${article.source || 'Africa'}`;
            const date = document.createElement('time');
            date.className = 'blog-date';
            if (article.publishedAt) {
                date.dateTime = article.publishedAt;
                date.textContent = new Date(article.publishedAt).toLocaleString();
            } else {
                date.textContent = 'Recent';
            }
            meta.append(source, date);

            const title = document.createElement('h3');
            title.textContent = article.title;

            const link = document.createElement('a');
            link.className = 'text-link';
            link.href = article.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Read at source';

            card.append(meta, title, link);
            newsList.append(card);
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.newsCategory;
            filterButtons.forEach(filter => {
                const isActive = filter === button;
                filter.classList.toggle('active', isActive);
                filter.setAttribute('aria-pressed', String(isActive));
            });
            renderArticles();
        });
    });

    if (searchInput) searchInput.addEventListener('input', renderArticles);

    const loadNews = async () => {
        try {
            if (window.location.protocol === 'file:') {
                throw new Error('The news feed needs the website server. Run npm start and open http://localhost:3000/blog.html.');
            }

            const response = await fetch('/api/news', { cache: 'no-store' });
            const contentType = response.headers.get('content-type') || '';
            if (!/^application\/(?:json|[\w.+-]+\+json)(?:\s*;|$)/i.test(contentType)) {
                throw new Error('The live news service is not configured for this website.');
            }

            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error('The live news service returned an invalid response. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(data.warning || 'Live news is temporarily unavailable.');
            }

            if (!Array.isArray(data.articles)) {
                throw new Error(data.warning || 'The news feed returned an invalid response.');
            }

            allArticles = data.articles;
            renderArticles();
            const updatedAt = data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'just now';
            newsStatus.textContent = `${data.articles.length} items from news, reports and research. Updated ${updatedAt}; refreshes hourly.${data.warning ? ` ${data.warning}` : ''}`;
        } catch (error) {
            console.error('Error loading live news:', error);
            newsStatus.textContent = newsList.childElementCount
                ? 'Could not refresh the news feed. Showing previously loaded headlines.'
                : `${error.message} Please try again later.`;
        }
    };

    loadNews();
    window.setInterval(loadNews, refreshInterval);
});