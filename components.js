// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };

    const updateThemeIcon = (theme) => {
        const icon = document.querySelector('.theme-toggle svg');
        if (theme === 'dark') {
            icon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>`;
        } else {
            icon.innerHTML = `<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
            <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>`;
        }
    };

    updateThemeIcon(theme);
    themeToggle.addEventListener('click', toggleTheme);
}

// Newsletter Subscription
function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            
            try {
                // Replace with your actual API endpoint
                const response = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });
                
                if (response.ok) {
                    alert('Thank you for subscribing!');
                    form.reset();
                } else {
                    throw new Error('Subscription failed');
                }
            } catch (error) {
                alert('Sorry, there was an error. Please try again later.');
            }
        });
    }
}

// Chat Widget
function initChat() {
    const chatButton = document.querySelector('.chat-button');
    const chatWindow = document.querySelector('.chat-window');
    
    if (chatButton && chatWindow) {
        chatButton.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
        });
    }
}

// Search Functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput) {
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const query = e.target.value;
                if (query.length < 2) {
                    if (searchResults) searchResults.style.display = 'none';
                    return;
                }
                
                try {
                    // Replace with your actual search API endpoint
                    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    
                    if (searchResults) {
                        searchResults.replaceChildren();
                        const results = Array.isArray(data.results) ? data.results : [];
                        results.forEach(result => {
                            if (!result || typeof result.url !== 'string') return;

                            let url;
                            try {
                                url = new URL(result.url, window.location.origin);
                            } catch {
                                return;
                            }
                            if (!['http:', 'https:'].includes(url.protocol)) return;

                            const item = document.createElement('div');
                            item.className = 'search-result-item';
                            const link = document.createElement('a');
                            link.href = url.href;
                            link.textContent = typeof result.title === 'string' ? result.title : '';
                            const excerpt = document.createElement('p');
                            excerpt.textContent = typeof result.excerpt === 'string' ? result.excerpt : '';
                            item.append(link, excerpt);
                            searchResults.appendChild(item);
                        });
                        searchResults.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Search error:', error);
                }
            }, 300);
        });
    }
}

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNewsletter();
    initChat();
    initSearch();
}); 