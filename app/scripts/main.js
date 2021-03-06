let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
  keyDownEventListener('neighborhoods-select');
  keyDownEventListener('cuisines-select');

});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}



/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');

  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    option.setAttribute('tabindex','-1');
    select.append(option);
  });
}


const keyDownEventListener = (id) => {
  const group = {};
  group.id = id;
  group.el = document.getElementById(id);
  group.options = group.el.getElementsByTagName('option');
  group.focusedIdx = 0;
  group.focusedOption = group.options[group.focusedIdx];


  group.el.addEventListener('keydown', (e) => {

    if(e.code === 'ArrowDown' || e.code === 'ArrowLeft'){

      e.preventDefault();
      if (group.focusedIdx === group.options.length - 1) {
        group.focusedIdx = 0;
      } else {
        group.focusedIdx++;
      }
    }else if(e.code === 'ArrowUp' || e.code === 'ArrowRight'){
      e.preventDefault();
      if (group.focusedIdx === 0) {
        group.focusedIdx = group.options.length - 1;
      } else {
        group.focusedIdx--;
      }
    }
    changeFocus(group, group.focusedIdx);
  });
}

const changeFocus = (group, idx) => {

  // Set the old button to tabindex -1
  group.focusedOption.tabIndex = -1;
  group.focusedOption.removeAttribute('selected');

  // Set the new button to tabindex 0 and focus it
  group.focusedOption = group.options[idx];
  group.focusedOption.tabIndex = 0;
  group.focusedOption.focus();
  group.focusedOption.setAttribute('selected', 'selected');
}

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    option.setAttribute('tabindex','-1');
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1Ijoic2dhcmNpYWNoYXZleiIsImEiOiJjanMyZHg3ZHIwMGdtM3lwbTFxN2hxM3UxIn0.6atwQGpBNgAG4o8O2zNlDA',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}


// window.initMap = () => {
//   let loc = {
//     lat: 40.722216,
//     lng: -73.987501
//   };
//   self.map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 12,
//     center: loc,
//     scrollwheel: false
//   });
//   updateRestaurants();
// }

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}



/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}


/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  if(restaurants.length === 0){
    //No restaurants found!!!
    ul.append(createNORestaurantHTML());

  }else{
    restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
  }
  addMarkersToMap();
}
/**
 * Create NO restaurant FOUND HTML.
 */
 const createNORestaurantHTML = () => {
   const li = document.createElement('li');

   const name = document.createElement('h1');
   name.innerHTML = 'No restaurants found';
   li.append(name);

   const neighborhood = document.createElement('p');
   neighborhood.innerHTML = 'Try selecting a different neighborhood or cuisine.'
   li.append(neighborhood);

   return li
 }
/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  let src = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = src;
  //let srcset= "images/space-needle.jpg 200w, images/space-needle-2x.jpg 400w, images/space-needle-hd.jpg 600w"
  image.setAttribute('srcset', `${src} 200w, ${src} 400w, ${src} 600w`);
  image.setAttribute('alt','Image of restaurant named: ' + restaurant.name);
  image.setAttribute('tabindex', '0');
  li.append(image);

  const div = document.createElement('div');
  div.setAttribute('tabindex','0');
  li.append(div);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  div.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  div.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
