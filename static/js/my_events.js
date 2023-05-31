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
        modal_state: "modal",
        event_name: "",
        event_description: "",
        event_start: null,
        event_end: null,
        event_location: "",

        edit_edit_modal_state: "modal",
        edit_event_name: "",
        edit_event_description: "",
        edit_modal_state: "modal",
        edit_event_start: null,
        edit_event_end: null,
        edit_event_location: "",
        edit_event_id: null,

        event_type: "",
        edit_event_type: "",
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
                    event_location: app.vue.event_location,
                    event_type: app.vue.event_type,
                }}
        ).then(function (response) {
            //TODO: Check if form value is correct, else keep modal active and send error message
            app.vue.modal_state = "modal"

            axios.get(get_events_url).then(function (response) {
                app.vue.events = app.enumerate(response.data.events)
            });

        });
    }

    app.edit_event = function (event_id) {
        for (let i = 0; i < app.vue.events.length; i++) {
            if (app.vue.events[i].id === event_id) {
                app.vue.edit_event_name = app.vue.events[i].event_name;
                app.vue.edit_event_description = app.vue.events[i].description;
                app.vue.edit_event_start = app.vue.events[i].event_start;
                app.vue.edit_event_end = app.vue.events[i].event_end;
                app.vue.edit_event_location = app.vue.events[i].location;
                app.vue.edit_event_type = app.vue.events[i].event_type;
                app.vue.edit_event_id = event_id;
                break;
            }
        }
        app.vue.edit_modal_state = "modal is-active";
    }

    app.cancel_edit_event = function () {
        app.vue.edit_modal_state = "modal";
    }

    app.edit_event_publish = function () {
        axios.get(edit_event_url,
            {params: {edit_event_name: app.vue.edit_event_name,
                    edit_event_description:app.vue.edit_event_description,
                    edit_event_start:Date.parse(app.vue.edit_event_start),
                    edit_event_end:Date.parse(app.vue.edit_event_end),
                    edit_event_location: app.vue.edit_event_location,
                    edit_event_type: app.vue.edit_event_type,
                    edit_event_id: app.vue.edit_event_id,}}
        ).then(function (response) {
            //TODO: Check if form value is correct, else keep modal active and send error message
            app.vue.edit_modal_state = "modal"

            axios.get(get_events_url).then(function (response) {
                app.vue.events = app.enumerate(response.data.events)
            });

        });
    }

    app.delete_event = function () {
        axios.get(delete_event_url, {params: {delete_event_id: app.vue.edit_event_id}}).then(function (response) {
            app.vue.edit_modal_state = "modal"

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
        edit_event: app.edit_event,
        cancel_edit_event: app.cancel_edit_event,
        edit_event_publish: app.edit_event_publish,
        delete_event: app.delete_event,
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
