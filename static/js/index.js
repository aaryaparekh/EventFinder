// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    app.data = {
        all_events: [],
        pages_of_events: [],
        filtered_events: [],
        curr_save_state: [],
        is_live_filtered: false,
        current_page: 0,
        last_page: 0,
        input_field: '',
        event_type_filter_input: '',
        event_type_filter_list:
        [
        'Concert', 'Festival', 'Live Music', 'Sports', 'Charity', 'Fundraiser',
        'Exhibition', 'Theatre', 'Art', 'Family and Kids',
        'Fashion', 'Food and Drink', 'Comedy', 'Film', 'Outdoors',
        'Gaming', 'Literary', 'Conference', 'Workshop'
        ],
        markers: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.set_content = (a) => {
        a.map((e) => {
            e.show_content = false;
            const startDateObj = new Date(e.event_start);
            const endDateObj = new Date(e.event_end);

            const startDate = startDateObj.toDateString();
            const endDate = endDateObj.toDateString();
            if (startDate === endDate) {
                e.formatted_date = startDate
            }  else {
                e.formatted_date = startDate + " - " + endDate;
            }
            startTime = startDateObj.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });
            endTime = endDateObj.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            });
            e.formatted_time = startTime + " - " + endTime;
        });
        return a;
    }

    app.set_pages_of_events = function () {
        const events_per_page = 2;
        app.vue.pages_of_events = [];
        if (!app.vue.event_type_filter_input && !app.vue.is_live_filtered) {
            app.vue.curr_save_state = [...app.vue.all_events];
        }

        if (app.vue.curr_save_state.length > 0) {
            for (var i = 0; i < app.vue.curr_save_state.length; i += events_per_page) {
                var page = app.vue.curr_save_state.slice(i, i + events_per_page);
                app.vue.pages_of_events.push(page);
            }
            app.vue.last_page = app.vue.pages_of_events.length - 1;
            app.set_page(0);
        }
        else {
            app.vue.filtered_events = [];
            app.vue.last_page = app.vue.current_page;
        }
    }

    app.toggle_live_events = function () {
        app.vue.is_live_filtered = !app.vue.is_live_filtered;
        if (app.vue.event_type_filter_input && !app.vue.is_live_filtered) {
            app.filter_event_type(app.vue.all_events);
        }
        else {
            app.filter_live_events(app.vue.curr_save_state);
        }
    }

    app.toggle_event_type = function () {
        if (!app.vue.event_type_filter_input && app.vue.is_live_filtered)  {
            app.filter_live_events(app.vue.all_events);
        }
        else if (app.vue.event_type_filter_input && !app.vue.is_live_filtered) {
            app.filter_event_type(app.vue.all_events);
        }
        else {
            app.filter_live_events(app.vue.all_events);
            app.filter_event_type(app.vue.curr_save_state);
        }
    }

    app.filter_live_events = function (list) {
        if (app.vue.is_live_filtered) {
            var currentDateStr = new Date().toLocaleDateString();

            app.vue.curr_save_state = list.filter((e) => {
                var date = new Date(e.event_start);
                var dateStr = date.toLocaleDateString();
                return dateStr === currentDateStr;
            });
        }
        app.set_pages_of_events();
        app.initMap();
    }

    app.filter_event_type = function (list) {
        if (app.vue.event_type_filter_input) {
            app.vue.curr_save_state = list.filter((e) =>
                e.event_type === app.vue.event_type_filter_input
            );
        }
        app.set_pages_of_events();
        app.initMap();
    }

    app.clear_filters = function () {
        app.vue.event_type_filter_input = "";
        app.vue.is_live_filtered = false;
        app.set_pages_of_events();
        app.initMap();
    }

    app.set_page = function (page) {
        app.vue.current_page = page;
        app.vue.filtered_events = [...app.vue.pages_of_events[app.vue.current_page]];
        app.sort_events(app.vue.filtered_events);
        app.initMap();
    }

    app.search_events = function () {
        if (app.vue.input_field) {
            app.vue.filtered_events = app.vue.all_events.filter((e) =>
                e.event_name.toLowerCase().includes(app.vue.input_field.toString().toLowerCase())
            );
            app.sort_events(app.vue.filtered_events);
        }
        else {
            app.set_page(app.vue.current_page);
        }
    };

    app.sort_events = function (list) {
        list.sort(function(a, b) {
            const dateA = new Date(a.event_start);
            const dateB = new Date(b.event_start);

            if (dateA < dateB) {
              return -1;
            } else if (dateA > dateB) {
              return 1;
            } else {
              return 0;
            }
        });
        app.enumerate(list);
    };

    app.clear_search = function () {
        app.vue.input_field = ''
        app.set_page(app.vue.current_page)
    };

    app.toggle_card_content = (r_idx) => {
        let r = app.vue.filtered_events[r_idx];
        let new_r = r;
        new_r.show_content = !r.show_content;
        new_r._idx = r._idx;
        Vue.set(app.vue.filtered_events, r_idx, new_r);
    }

    app.initMap = async function () {
        const position = { lat: 36.994, lng: -122.0674 };

        const { Map } = await google.maps.importLibrary("maps");
        const { Marker } = await google.maps.importLibrary("marker");
        this.map = new Map(document.getElementById("map"), {
            center: { lat: 36.974, lng: -122.030 },
            zoom: 13,
        });
        for (let i = 0; i < app.vue.filtered_events.length; i++) {
            const event = app.vue.filtered_events[i];
            const position = { lat: event.lat, lng: event.lng };
            const marker = new google.maps.Marker({
                map: this.map,
                position: position,
                title: event.event_name,
                animation: google.maps.Animation.DROP,
            });
            const infowindow = new google.maps.InfoWindow({
                content: event.event_name + "\n" + event.location,
                ariaLabel: event.event_name,
              });
            marker.addListener("click", () => {
                infowindow.open({
                    anchor: marker,
                    map,
                });
                app.toggle_card_content(i);
            });
        }
    }

    window.initMap = app.initMap;

    app.methods = {
        toggle_live_events: app.toggle_live_events,
        toggle_event_type: app.toggle_event_type,
        clear_filters: app.clear_filters,
        set_page: app.set_page,
        search_events: app.search_events,
        clear_search: app.clear_search,
        toggle_card_content: app.toggle_card_content,
        initMap: app.initMap,
    };

    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });


    app.init = () => {
        axios.get(get_home_events_url).then(function (response) {
            app.vue.all_events = response.data.all_events;
            app.sort_events(app.vue.all_events);
            app.vue.all_events = app.set_content(response.data.all_events);
            app.set_pages_of_events();
            app.vue.event_type_filter_list.sort();
            app.initMap();
        }.bind(app));
    };

    app.init();
};


init(app);
