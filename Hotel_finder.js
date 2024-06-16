let favoriteHotels = new Set();
const hotelDetails = {};

function closeMap() {
    document.getElementById('mapContainer').style.display = 'none';
}

async function searchHotels() {
    const city = document.getElementById('city-name').value.toLowerCase().trim();

    if (!city) {
        return alert('Please enter a city name!!');
    }

    const url = 'https://tripadvisor-scraper.p.rapidapi.com/search/?type=hotel&location=' + city;

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '4ac20ee1b7msh428f2fdffb003eep1a0519jsn612e398519dc',
            'X-RapidAPI-Host': 'tripadvisor-scraper.p.rapidapi.com'
          }
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error('Failed to fetch hotels.');
        }

        const data = await response.json();
        displayHotels(data);
    } catch (error) {
        console.error('Failed to fetch hotels:', error);
        alert('Failed to fetch hotels. Please try again.');
    }
}

function displayHotels(data) {
    const hotelList = document.getElementById('hotelList');
    hotelList.innerHTML = '';

    const hotels = data.results || [];

    if (hotels.length === 0) {
        hotelList.innerHTML = '<p>No hotels found.</p>';
    }

    hotels.forEach(hotel => {
        const hotelDiv = document.createElement('div');
        const hotelName = hotel.name.replace(/\s+/g, '-').toLowerCase(); // Generate dynamic ID for hotel
        hotelDiv.id = `hotel-${hotelName}`; // Assign dynamic ID to hotel element
        hotelDiv.className = 'hotel';

        const descriptionLines = hotel.description ? hotel.description.split('.') : [];
        const firstLine = descriptionLines.length > 0 ? descriptionLines[0] : 'No description available';

        hotelDetails[hotel.name] = {
            city: hotel.location_hierarchy[0].name,
            coordinates: hotel.latitude_longitude
        };

        const [latitude, longitude] = hotel.latitude_longitude.split(',').map(parseFloat);

        hotelDiv.innerHTML =
            `<div class="hotel-descp">
        <h3>${hotel.name}</h3>
        <p>City: ${hotelDetails[hotel.name].city}, Coordinates: ${hotelDetails[hotel.name].coordinates} </p>
        <p>${firstLine}.</p>
        </div>
        <button onclick="showMap('${hotel.name}',' ${latitude}', '${longitude}')" class="hotel-button">Show in Map</button>
        <button onclick="addToFavorite('${hotel.name}')" class="favorite-hotel">Add to Favorite</button>
        `;

        hotelList.appendChild(hotelDiv);
    });
}

// Function to add a hotel to favorites
function addToFavorite(name) {
    favoriteHotels.add(name);
    alert(`${name} added to favorites.`);
}

function removeFromFavorites(name) {
    favoriteHotels.delete(name);
    showFavoriteHotels();
}

// Function to display favorite hotels
function showFavoriteHotels() {
    document.getElementById('favhotel').style.display = 'block';
    const favoriteHotelsList = document.getElementById('favoriteHotels');
    favoriteHotelsList.innerHTML = '';

    if (favoriteHotels.size === 0) {
        favoriteHotelsList.innerHTML = '<p><strong>No favorite hotels yet.</strong></p>';
    }

    favoriteHotels.forEach(hotel => {
        const hotelDiv = document.createElement('div');
        hotelDiv.className = 'favorite-hotel-div';
        const hotelData = hotelDetails[hotel];

        if (hotelData) {
            hotelDiv.innerHTML = `
            <div class="hotel-descp">
                <h3>${hotel}</h3>
                <p>City: ${hotelData.city}, Coordinates: ${hotelData.coordinates}</p>
            </div>
            <button onclick="removeFromFavorites('${hotel}')" class="favorite-hotel">Remove From Favorites</button>
        `;
        } else {
            hotelDiv.textContent = hotel;
        }

        favoriteHotelsList.appendChild(hotelDiv);
    });
}

function showMap(hotelName, latitude, longitude) {
    const hotelDiv = document.getElementById(`hotel-${hotelName.replace(/\s+/g, '-').toLowerCase()}`);
    if (!hotelDiv) {
        console.error(`Hotel element not found for ${hotelName}`);
        return;
    }

    const mapContainerId = `map-${hotelName.replace(/\s+/g, '-').toLowerCase()}`;
    const closeIconId = `close-${hotelName.replace(/\s+/g, '-').toLowerCase()}`;

    if (document.getElementById(mapContainerId)) {
        console.error(`Map already initialized for ${hotelName}`);
        return;
    }

    const mapContainer = document.createElement('div');
    mapContainer.id = mapContainerId;
    mapContainer.className = 'map-container';
    mapContainer.style.height = '200px'; // Adjust height as needed

    const closeIcon = document.createElement('span');
    closeIcon.id = closeIconId;
    closeIcon.className = 'close-icon';
    closeIcon.innerHTML = '&times;';
    closeIcon.onclick = () => {
        mapContainer.remove();
    };

    hotelDiv.appendChild(mapContainer);
    mapContainer.appendChild(closeIcon);

    var map = L.map(mapContainer).setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add a marker for the hotel location
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup(`<b>${hotelName}</b><br/>Coordinates: ${latitude}, ${longitude}`)
        .openPopup();
}