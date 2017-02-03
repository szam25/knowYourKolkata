$("#menu-button")
    .click(function() {
        $("#wrapper")
            .toggleClass("toggled");
    });
//this will toggle the hamburge menu
var map;
var markers = [];
var locations = [
    { title: 'Eden Gardens', location: { lat: 22.564608, lng: 88.343265 } },
    { title: 'Zoological Garden Alipore', location: { lat: 22.537472, lng: 88.331859 } },
    { title: 'Victoria Memorial', location: { lat: 22.544808, lng: 88.342558 } },
    { title: 'Jorasanko Thakurbari', location: { lat: 22.583199, lng: 88.356716 } },
    { title: 'Dakshineswar Kali Temple', location: { lat: 22.654909, lng: 88.357531 } },
    { title: 'St. Pauls Cathedral', location: { lat: 22.544243, lng: 88.346682 } },
    { title: 'Nicco Park', location: { lat: 22.571264, lng: 88.422080 } },
    { title: 'Iskcon', location: { lat: 22.543608, lng: 88.353639 } },
    { title: 'Belur Math', location: { lat: 22.632185, lng: 88.355891 } },
    { title: 'Science City', location: { lat: 22.540119, lng: 88.396072 } },
    { title: 'Birla Mandir', location: { lat: 22.530456, lng: 88.364927 } }
];


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 22.572646,
            lng: 88.363895
        },
        zoom: 13,
        mapTypeControl: false
    });
    ko.applyBindings(new ViewModel());
}


//viewModel
var ViewModel = function() {
    var self = this;
    self.locationList = ko.observableArray(locations);
    self.title = ko.observable('');
    self.currentMarker = function(place) {
        // trigger the click event of the marker
        google.maps.event.trigger(place.marker, 'click');
    };
    self.ClickedPlace = ko.observable('');
    self.search = ko.computed(function() {
        var userInput = self.ClickedPlace()
            .toLowerCase(); // Make search case insensitive
         searchResult = ko.utils.arrayFilter(self.locationList(), function(item) {
            var title = item.title.toLowerCase(); // Make search case insensitive
            var userInputTitle = title.indexOf(userInput) >= 0; // true or false
            if (item.marker) {
                item.marker.setVisible(userInputTitle); // toggle visibility of the marker
            }
            return userInputTitle;
        });
        return searchResult;
    });
    var largeInfowindow = new google.maps.InfoWindow(); //creating the Infowindow
    var bounds = new google.maps.LatLngBounds(); //bounds of the map        
    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var HighlightedIcon = makeMarkerIcon('ffff24');

    function click() {
        populateInfoWindow(this, largeInfowindow);
    }

    function highlighted() {
        this.setIcon(HighlightedIcon);
    }

    function mouseout() {
        this.setIcon(defaultIcon);
    }
    for (var i = 0, l = locations.length; i < l; i++) //creating marker and infowindow for each and every location in the locations list
    {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcon,
            map: map,
            id: i
        });
        locations[i].marker = marker; //linking with the click using the locations array
        // Push the marker to our array of markers.
        markers.push(marker);
        bounds.extend(marker.position);
        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', click);
        marker.addListener('mouseover', highlighted);
        marker.addListener('mouseout', mouseout);
    }
    map.fitBounds(bounds);

};
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });

        //street view on the marker
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panaromaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panaroma = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panaromaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No streetview Found</div>');
            }
        }
       // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position 
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
        }).done(function(response) {
            var articleList = response[1];
            var url = 'http://en.wikipedia.org/wiki/' + marker.title;
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
            infowindow.setContent('<div>' + marker.title + '</div><br><a href="' + url + '">' + url + '</a><hr><div id="pano"></div>');
            infowindow.open(map, marker);
        });

    }
}
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}
