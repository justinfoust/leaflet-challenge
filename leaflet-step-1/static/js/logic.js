// Define variables
//===================================================================================

var mapbox = {
    apiURL: "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    street: "mapbox.streets",
    light: "mapbox.light",
    dark: "mapbox.dark",
    outdoors: "mapbox.outdoors",
    satellite: "mapbox.satellite"
};

var usgsURL = {
    hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
    day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
    week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
    month: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
};


//
//===================================================================================

d3.json(usgsURL.week).then(data => {
    createFeatures(data.features);
});

function magColor(mag) {
    switch (Math.floor(mag)) {
        case 0: return "green"; break;
        case 1: return "lawnGreen"; break;
        case 2: return "yellow"; break;
        case 3: return "orange"; break;
        case 4: return "darkOrange"; break;
        case 5: return "red"; break;
    }
}

function createFeatures(earthquakeData) {

    function pointToLayer(geoJsonPoint, latlng) {

        return L.circle(latlng, {
            fillOpacity: 0.75,
            weight: 0,
            fillColor: magColor(geoJsonPoint.properties.mag),
            radius: geoJsonPoint.properties.mag * 10000
        });
    }

    function onEachFeature(feature, layer) {

        layer.bindPopup("<h4>" + feature.properties.place + "</h3>" +
                        "<hr>" +
                        "<p>" + new Date(feature.properties.time) + "</p>");
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    var outdoorMap = L.tileLayer(mapbox.apiURL, {
        attribution: mapbox.attribution,
        id: mapbox.outdoors,
        accessToken: API_KEY
    });

    var baseMaps = {
        "Outdoor Map": outdoorMap
    };

    var overlayMaps = {
        Earthquakes: earthquakes
    };

    var myMap = L.map("map", {
        center: [40, -110],
        zoom: 5,
        layers: [outdoorMap, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var info = L.control({
        position: "bottomright"
    });

    info.onAdd = function() {
        var div = L.DomUtil.create("div", "legend"),
            categories = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

        categories.map((d, i) => {
            div.innerHTML += '<i style="background:' + magColor(i) + '"></i>' + d + '<br>'
        })

        return div;
    };

    info.addTo(myMap);
}