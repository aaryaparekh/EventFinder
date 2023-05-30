// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    app.data = {
        all_events: [],
        pages_of_events: [],
        current_page: 0,
        last_page: 0,
        filtered_events: [],
        input_field: '',
    };    
    
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.set_pages_of_events = () => {
        const events_per_page = 6    
        for (var i = 0; i < app.vue.all_events.length; i += events_per_page) {
            var page = app.vue.all_events.slice(i, i + events_per_page);
            app.vue.pages_of_events.push(page);
        }
        app.vue.last_page = app.vue.pages_of_events.length - 1;
    }

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

    app.set_page = function (page) {
        app.vue.current_page = page;
        app.vue.filtered_events = [...app.vue.pages_of_events[app.vue.current_page]];
        app.sort_events(app.vue.filtered_events);
    }

    app.search_events = function () {
        if (app.vue.input_field) {
            app.vue.filtered_events = app.vue.all_events.filter((event) =>
                    event.event_name.toLowerCase().includes(app.vue.input_field.toString().toLowerCase())
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

    app.methods = {
        set_page: app.set_page,
        set_filtered_events: app.set_filtered_events,
        search_events: app.search_events,
        sort_events: app.sort_events,
        clear_search: app.clear_search,
        toggle_card_content: app.toggle_card_content,
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
            app.vue.filtered_events = [...app.vue.pages_of_events[0]];
        });
    };

    app.init();
};


init(app);
