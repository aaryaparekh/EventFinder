// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    let EVENT_NAME_MIN = 3;
    let EVENT_DESCRIPTION_MIN = 15;
    let EVENT_LOCATION_MIN = 3;

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        events: [],
        modal_state: "modal",
        event_name: "",
        event_description: "",
        event_start: null,
        event_end: null,
        event_location: "",
        event_lat: 0,
        event_lng: 0,

        edit_modal_state: "modal",
        edit_event_id: null,

        current_datetime: "",

        //error message variables
        event_name_error: "",
        event_location_error: "",
        event_start_error: "",
        event_end_error: "",
        event_type_error: "",
        event_description_error: "",

        event_type: "",
        // edit_event_type: "",
        event_types: ['Concert', 'Festival', 'Live Music', 'Sports', 'Charity', 'Fundraiser',
        'Exhibition', 'Theatre', 'Art', 'Family and Kids',
        'Fashion', 'Food and Drink', 'Comedy', 'Film', 'Outdoors',
        'Gaming', 'Literary', 'Conference', 'Workshop' 
        ],
    };
    
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.get_events = function () {
        axios.get(get_events_url).then(function (response) {
            app.vue.events = response.data.events;

            // Add formatted date and time to each event for display in html
            for (let i = 0; i < app.vue.events.length; i++) {
                let e = app.vue.events[i];
                let start = new Date(app.vue.events[i].event_start).toLocaleString();
                let end = new Date(app.vue.events[i].event_end).toLocaleString();
                app.vue.events[i].start_formatted = start;
                app.vue.events[i].end_formatted = end;

            }
        });
    }

    app.add_new_event = function () {
        app.vue.modal_state = "modal is-active";

        app.reset_event_inputs();
    }

    app.cancel_add_new_event = function () {
        app.vue.modal_state = "modal";
    }

    app.reset_event_errors = function () {
        app.vue.event_name_error = "";
        app.vue.event_location_error = "";
        app.vue.event_start_error = "";
        app.vue.event_end_error = "";
        app.vue.event_type_error = "";
        app.vue.event_description_error = "";
    }

    app.reset_event_inputs = function () {
        app.vue.event_name = "";
        app.vue.event_description = "";
        app.vue.event_start = null;
        app.vue.event_end = null;
        app.vue.event_location = "";
    }

    app.check_event_errors = function () {
        app.reset_event_errors();

        let error = false;
        // check if input is correct
        if (app.vue.event_name.length === 0) {
            app.vue.event_name_error = "Event name cannot be empty.";
            error = true;
        } else if (app.vue.event_name.length < EVENT_NAME_MIN) {
            app.vue.event_name_error = "Event name needs to be longer.";
            error = true;
        }

        if (app.vue.event_location.length === 0) {
            app.vue.event_location_error = "Event location cannot be empty.";
            error = true;
        } else if (app.vue.event_location.length < EVENT_LOCATION_MIN) {
            app.vue.event_location_error = "Event location needs to be longer.";
            error = true;
        }

        if (app.vue.event_description.length === 0) {
            app.vue.event_description_error = "Event description cannot be empty.";
            error = true;
        } else if (app.vue.event_description.length < EVENT_DESCRIPTION_MIN) {
            app.vue.event_description_error = "Event description needs to be longer.";
            error = true;
        }

        if (app.vue.event_start === null) {
            app.vue.event_start_error = "Event start date and time cannot be empty.";
            error = true;
        }

        if (app.vue.event_end === null) {
            app.vue.event_end_error = "Event end date and time cannot be empty.";
            error = true;
        }

        console.log("START = " + app.vue.event_start);
        console.log("END = " + app.vue.event_end);

        if (app.vue.event_start !== null && app.vue.event_end !== null && Date.parse(app.vue.event_start) >= Date.parse(app.vue.event_end)) {
            app.vue.event_end_error = "Event end must be after event starts.";
            error = true;
        }

        return error;
    }

    app.create_event = function () {
        let error = app.check_event_errors();

        console.log("In create event:");
        console.log("app.vue.event_start = " + String(app.vue.event_start));
        console.log("app.vue.event_end = " + String(app.vue.event_end));
        console.log("types = ", typeof app.vue.event_start);

        // console.log("Giving: " + Date.parse(app.vue.event_start) + " and " + Date.parse(app.vue.event_end))

        if (!error) {
            axios.get(create_event_url,
                {params: {event_name: app.vue.event_name,
                        event_description:app.vue.event_description,
                        event_start:Date.parse(app.vue.event_start),
                        event_end:Date.parse(app.vue.event_end),
                        event_location: app.vue.event_location,
                        event_type: app.vue.event_type,
                    }}
            ).then(function (response) {
                //TODO: Check if form value is correct, else keep modal active and send error message
                app.vue.modal_state = "modal"

                app.get_events();
            });
        }
    }

    app.edit_event = function (event_id) {
        app.reset_event_errors();

        for (let i = 0; i < app.vue.events.length; i++) {
            if (app.vue.events[i].id === event_id) {
                app.vue.event_name = app.vue.events[i].event_name;
                app.vue.event_description = app.vue.events[i].description;
                app.vue.event_start = app.vue.events[i].event_start;
                app.vue.event_end = app.vue.events[i].event_end;
                app.vue.event_location = app.vue.events[i].location;
                app.vue.event_type = app.vue.events[i].event_type;
                app.vue.event_id = event_id;

                console.log("In edit_event: ");
                console.log("app.vue.event_start = " + app.vue.event_start);
                console.log("app.vue.event_end = " + app.vue.event_end);

                console.log("Attempting conversion...");
                console.log("app.vue.event_start = " +  new Date(app.vue.event_start));

                break;
            }
        }
        app.vue.edit_modal_state = "modal is-active";
    }

    app.cancel_edit_event = function () {
        app.vue.edit_modal_state = "modal";
        app.reset_event_errors();
    }

    app.edit_event_publish = function () {
        let error = app.check_event_errors();

        if (!error) {

            console.log("In edit event publish:");
            console.log("app.vue.event_start = " + String(app.vue.event_start));
            console.log("app.vue.event_end = " + String(app.vue.event_end));
            axios.get(edit_event_url,
                {params: {edit_event_name: app.vue.event_name,
                        edit_event_description:app.vue.event_description,
                        edit_event_start:Date.parse(app.vue.event_start),
                        edit_event_end:Date.parse(app.vue.event_end),
                        edit_event_location: app.vue.event_location,
                        edit_event_type: app.vue.event_type,
                        edit_event_id: app.vue.event_id,}}
            ).then(function (response) {
                //TODO: Check if form value is correct, else keep modal active and send error message
                app.vue.edit_modal_state = "modal"

                app.get_events();

            });

        }
    }

    app.delete_event = function () {
        axios.get(delete_event_url, {params: {delete_event_id: app.vue.event_id}}).then(function (response) {
            app.vue.edit_modal_state = "modal"

            app.get_events();
        });
    }

    app.initMap = async function () {

        let lattitude = 0;
        let longitude = 0;

        const map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 36.974, lng: -122.030 },
            zoom: 13,
          });
          const input = document.getElementById("pac-input");
          // Specify just the place data fields that you need.
          const autocomplete = new google.maps.places.Autocomplete(input, {
            fields: ["place_id", "geometry", "name", "formatted_address"],
          });
        
          autocomplete.bindTo("bounds", map);
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
          const infowindow = new google.maps.InfoWindow();
          const infowindowContent = document.getElementById("infowindow-content");
        
          infowindow.setContent(infowindowContent);
        
          const geocoder = new google.maps.Geocoder();
          const marker = new google.maps.Marker({ map: map });
        
          marker.addListener("click", () => {
            infowindow.open(map, marker);
          });
          autocomplete.addListener("place_changed", () => {
            infowindow.close();
        
            const place = autocomplete.getPlace();
        
            if (!place.place_id) {
              return;
            }
        
            geocoder
              .geocode({ placeId: place.place_id })
              .then(({ results }) => {
                map.setZoom(15);
                map.setCenter(results[0].geometry.location);
                console.log(results[0].geometry.location.lat());
                console.log(results[0].geometry.location.lng());
                lattitude = results[0].geometry.location.lat();
                longitude = results[0].geometry.location.lng();
                // Set the position of the marker using the place ID and location.
                marker.setPlace({
                  placeId: place.place_id,
                  location: results[0].geometry.location,
                });
                marker.setVisible(true);
                infowindowContent.children["place-name"].textContent = place.name;
                infowindowContent.children["place-id"].textContent = place.place_id;
                infowindowContent.children["place-address"].textContent = results[0].formatted_address;
                infowindow.open(map, marker);
              })
              .catch((e) => window.alert("Geocoder failed due to: " + e));
          });
        
        app.vue.event_lat = lattitude;
        app.vue.event_lng = longitude;
    }
    window.initMap = app.initMap;


    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        get_events: app.get_events,
        create_event: app.create_event,
        add_new_event: app.add_new_event,
        cancel_add_new_event: app.cancel_add_new_event,
        edit_event: app.edit_event,
        cancel_edit_event: app.cancel_edit_event,
        edit_event_publish: app.edit_event_publish,
        delete_event: app.delete_event,
        initMap: app.initMap,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        app.get_events();
        app.initMap();

        axios.get(get_current_datetime_url).then(function (response) {
            // console.log(response.data.current_datetime)

            // var currentDate = new Date();
            // var datetime = "Last Sync: " + currentDate.getDay() + "/" + currentDate.getMonth()
            // + "/" + currentDate.getFullYear() + " @ "
            // + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
            // console.log(datetime)

            // let date = new Date();
            // let cur_date = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + 'T' + date.getHours() + ":"
            //     + date.getMinutes();
            // console.log(new Date().toString())
            // console.log(date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + 'T' + date.getHours() + ":"
            //     + date.getMinutes());

            // app.vue.current_datetime = response.data.current_datetime
            // app.vue.current_datetime = Date().getTime()
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
