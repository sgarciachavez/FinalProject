var CACHE_NAME = 'udacity-final-project';
var urlsToCache = [
  '/',
  'restaurant.html?id=1',
  'restaurant.html?id=2',
  'restaurant.html?id=3',
  'restaurant.html?id=4',
  'restaurant.html?id=5',
  'restaurant.html?id=6',
  'restaurant.html?id=7',
  'restaurant.html?id=8',
  'restaurant.html?id=9',
  'restaurant.html?id=10',
  '/styles/main.css',
  '/styles/review.css',
  '/styles/styles.css',
  '/scripts/main.js',
  '/scripts/restaurant_info.js',
  '/scripts/dbhelper.js',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg',
  '/images/5.jpg',
  '/images/6.jpg',
  '/images/7.jpg',
  '/images/8.jpg',
  '/images/9.jpg',
  '/images/10.jpg',
  '/data/restaurants.json'
  // 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  // 'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js'
  //'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1206/1539.jpg70?access_token=pk.eyJ1Ijoic2dhcmNpYWNoYXZleiIsImEiOiJjanMyZHg3ZHIwMGdtM3lwbTFxN2hxM3UxIn0.6atwQGpBNgAG4o8O2zNlDA',
  //'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  //'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // console.log(event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response){
        return response;
      }
      return fetch(event.request).then(function(response){
        if(response.status === 404){
          let mess = '<b>Sorry.... Page not found!</b>';
          response =  new Response(mess, {
            headers: {'Content-Type':'text/html'}
          });
        }
        return response;
      });

    })
  );
});
