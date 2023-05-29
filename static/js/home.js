// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        all_events: [],
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

    app.toggle_card_content = (r_idx) => {
        let r = app.vue.all_events[r_idx];
        let new_r = r;
        new_r.show_content = !r.show_content;
        new_r._idx = r._idx;
        Vue.set(app.vue.all_events, r_idx, new_r);
    }

    // This contains all the methods.
    app.methods = {
        toggle_card_content: app.toggle_card_content,
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
        axios.get(get_home_events_url).then(function (response) {
            app.vue.all_events = app.enumerate(response.data.all_events);
            app.vue.all_events = app.set_content(response.data.all_events);
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
