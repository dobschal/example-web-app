// Set a name for the current cache
var cacheName = '#CODE_VERSION#';

// Default files that always should be cached
var cacheFiles = [
	'./',
    './index.html',
	'./js/app.js',
	'./js/app.min.js',
	'./css/app.css',
	'./fonts/fontawesome-webfont.eot?v=4.7.0',
	'./fonts/fontawesome-webfont.svg?v=4.7.0',
	'./fonts/fontawesome-webfont.ttf?v=4.7.0',
	'./fonts/fontawesome-webfont.woff?v=4.7.0',
	'./fonts/fontawesome-webfont.woff2?v=4.7.0',
	'./fonts/FontAwesome.otf',
	'./images/brand.svg',
	'./images/close.png',
	'./images/loading.gif',
	'./images/next.png',
	'./images/prev.png'	
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Installed');
    e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching cacheFiles');
			return cache.addAll(cacheFiles);
		}).catch( function(err) {
			console.error("[ServiceWorker] Unable to open cache.", err );
		})
	);
});


self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activated');
    e.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {
				if (thisCacheName !== cacheName) {
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	);
});


self.addEventListener('fetch', function(e) {
	e.respondWith(
		caches.match(e.request)
			.then(function(response) {
				if ( response ) {
					console.log("[ServiceWorker] Found in Cache", e.request.url, response);
					// Return the cached version
					return response;
				}
				var requestClone = e.request.clone();
				return fetch(requestClone);				
			}).catch(function(err) {
				console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
			})
	);
});

self.addEventListener("push", e => {
	const data = e.data.json();
	console.log( "[ServiceWorker] Received push notification.", data ); 
	self.registration.showNotification( data.title, {
		body: data.body,
		icon: ""
	});
});