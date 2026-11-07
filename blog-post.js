const pageUrl = window.location.href;
const title = document.getElementById('post-title')?.textContent || '';

const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
facebookUrl.searchParams.set('u', pageUrl);
document.querySelector('.share-facebook')?.setAttribute('href', facebookUrl.href);

const twitterUrl = new URL('https://twitter.com/intent/tweet');
twitterUrl.searchParams.set('text', title);
twitterUrl.searchParams.set('url', pageUrl);
document.querySelector('.share-twitter')?.setAttribute('href', twitterUrl.href);

const linkedinUrl = new URL('https://www.linkedin.com/shareArticle');
linkedinUrl.searchParams.set('mini', 'true');
linkedinUrl.searchParams.set('url', pageUrl);
linkedinUrl.searchParams.set('title', title);
document.querySelector('.share-linkedin')?.setAttribute('href', linkedinUrl.href);
