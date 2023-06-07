// This will be the object that will contain the Vue attributes
// and be used to initialize it.
import * as VueGoogleMaps from 'vue2-google-maps'
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    app.data = {
        all_events: [],
        filtered_events: [],
        input_field: '',
        api_key: '',
    };    
    
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    
    app.set_filtered_events = () => {
        app.vue.filtered_events = [...app.vue.all_events];
    };

    app.search_events = function () {
        app.vue.filtered_events = app.vue.all_events.filter((event) =>
                event.event_name.toLowerCase().includes(app.vue.input_field.toString().toLowerCase())
        );
        app.sort_events();
    };

    app.sort_events = function () {
        app.vue.filtered_events.sort(function(a, b) {
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
        app.enumerate(app.vue.filtered_events);
    };

    app.clear_search = function () {
        app.vue.input_field = ''
        app.search_events()
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

    app.toggle_card_content = (r_idx) => {
        let r = app.vue.filtered_events[r_idx];
        let new_r = r;
        new_r.show_content = !r.show_content;
        new_r._idx = r._idx;
        Vue.set(app.vue.filtered_events, r_idx, new_r);
    }


    app.methods = {
        set_filtered_events: app.set_filtered_events,
        search_events: app.search_events,
        sort_events: app.sort_events,
        clear_search: app.clear_search,
        toggle_card_content: app.toggle_card_content,
        async fetch_api_key() {
            const response = await fetch("../../api_key.env");
            const text = await response.text();
            const key = text.split("=")[1].trim();
            this.api_key = key;
          },
    };

    Vue.use(VueGoogleMaps, {
        load: {
          key: key,
          libraries: 'places',
        }
      });
    // can also include other libraries: see https://developers.google.com/maps/documentation/javascript/libraries
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods,
        mounted() {
            this.fetch_api_key();
        }
    });


    app.init = () => {
        axios.get(get_home_events_url).then(function (response) {
            app.vue.all_events = app.enumerate(response.data.all_events);
            app.vue.all_events = app.set_content(response.data.all_events);
            app.set_filtered_events();
            app.sort_events();            
        });
    };

    app.init();
};


init(app);
