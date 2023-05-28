// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        events: [],
        event_name: "",
        event_description: "",
        modal_state: "modal",
        event_start: null,
        event_end: null,
        event_location: "",
    };
    
    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.get_events = function () {
        axios.get(get_events_url).then(function (response) {
            app.vue.events = app.enumerate(response.data.events);
        });
    }

    app.add_new_event = function () {
        app.vue.modal_state = "modal is-active";
    }

    app.cancel_add_new_event = function () {
        app.vue.modal_state = "modal";
    }

    app.create_event = function () {
        axios.get(create_event_url,
            {params: {event_name: app.vue.event_name,
                    event_description:app.vue.event_description,
                    event_start:Date.parse(app.vue.event_start),
                    event_end:Date.parse(app.vue.event_end),
                    event_location: app.vue.event_location}}
        ).then(function (response) {
            //TODO: Check if form value is correct, else keep modal active and send error message
            app.vue.modal_state = "modal"

            axios.get(get_events_url).then(function (response) {
                app.vue.events = app.enumerate(response.data.events)
            });

        });
    }


    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        get_events: app.get_events,
        create_event: app.create_event,
        add_new_event: app.add_new_event,
        cancel_add_new_event: app.cancel_add_new_event,
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
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code in it. 
init(app);
