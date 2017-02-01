$("#menu-toggle")
    .click(function(e) {
        //e.preventDefault();
        $("#wrapper")
            .toggleClass("toggle");
    });
var markers = [];
var locations = [
          {title: 'Eden Gardens', location: {lat: 22.564608, lng: 88.343265}},
          {title: 'Zoological Garden Alipore', location: {lat: 22.537472, lng: 88.331859}},
          {title: 'Victoria Memorial', location: {lat: 22.544808, lng: 88.342558}},
          {title: 'Jorasanko Thakurbari', location: {lat: 22.583199, lng: 88.356716}},
          {title: 'Dakshineswar Kali Temple', location: {lat: 22.654909, lng: 88.357531}},
          {title: 'St. Pauls Cathedral', location: {lat: 22.544243, lng: 88.346682}},
          {title: 'Nicco Park', location: {lat: 22.571264, lng: 88.422080}},
          {title: 'Iskcon', location: {lat: 22.543608, lng: 88.353639}},
          {title: 'Belur Math', location: {lat: 22.632185, lng: 88.355891}},
           {title: 'Science City', location: {lat: 22.540119, lng: 88.396072}},
          {title: 'Birla Mandir', location: {lat: 22.530456, lng: 88.364927}}
          
          
        ];

var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 22.572646,
            lng: 88.363895
        },
        zoom: 5,

        mapTypeControl :false
    });
    ko.applyBindings(new ViewModel());
}


//viewModel
var ViewModel = function() {
    this.locationList = ko.observableArray(locations);
    this.title = ko.observable('');
    this.CurrentMarker = function(place) {
        console.log(place.title);
        // trigger the click event of the marker
        new google.maps.event.trigger(place.marker, 'click');
    };
    this.clickedplace = ko.observable('');
    this.searchedplace = ko.computed(function() {
        var userInput = this.clickedplace()
            .toLowerCase(); // Make search case insensitive
        return searchResult = ko.utils.arrayFilter(self.locationList(), function(item) {
            var title = item.title.toLowerCase(); // Make search case insensitive
            var userInputTitle = title.indexOf(userInput) >= 0; // true or false
            if (item.marker) {
                item.marker.setVisible(userInputTitle); // toggle visibility of the marker
            }
            return userInputTitle;
        });
    })
    var largeInfowindow = new google.maps.InfoWindow(); //creating the Infowindow
    var bounds = new google.maps.LatLngBounds(); //bounds of the map        
    var defaultIcon= makeMarkerIcon('0091ff');
     var HighlightedIcon= makeMarkerIcon('ffff24');
    
    for (var i = 0, l = locations.length; i < l; i++) //creating marker and infowindow for each and every location in the locations list
    {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            icon: defaultIcn,
            map: map,
            id: i
        });
        locations[i].marker = marker; //linking with the click using the locations array
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener('click', function() { //adding click listener to the marker
            populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(HighlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
    }
    map.fitBounds(bounds);
     
}

function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });

        //street view on the marker
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
    
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
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
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        infowindow.open(map, marker);
    }
}

function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
