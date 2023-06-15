"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.form import Form, FormStyleBulma
from py4web.utils.url_signer import URLSigner

import datetime

url_signer = URLSigner(session)


@action("index")
@action.uses("index.html", db, auth, url_signer)
def index():
    return dict(
        get_home_events_url = URL('home_list_events', signer=url_signer),
    )


@action("home_list_events")
@action.uses(db, auth, url_signer.verify())
def home_list_events():
    all_events = db(db.event).select()
    return dict(all_events=all_events)


@action("my_events")
@action.uses("my_events.html", db, session, url_signer, auth.user)
def my_events(events_created_by=None):
    return dict(
        get_events_url = URL('get_events', signer=url_signer),
        create_event_url = URL('create_event', signer=url_signer),
        edit_event_url = URL('edit_event', signer=url_signer),
        delete_event_url = URL('delete_event', signer=url_signer),
        get_current_datetime_url = URL('get_current_datetime')
    )


@action("get_events")
@action.uses(url_signer.verify(), db, auth.user)
def get_events():
    events = db(db.event.created_by == auth.user_id).select()
    return dict(events=events, url_signer=url_signer)


@action("create_event")
@action.uses(db, session, auth.user)
def create_event():
    event_name = str(request.params.get('event_name'))
    event_description = str(request.params.get('event_description'))
    event_location = str(request.params.get('event_location'))
    event_lat = request.params.get('event_lat')
    event_lng = request.params.get('event_lng')
    event_start = request.params.get('event_start')
    event_end = request.params.get('event_end')
    event_type = request.params.get('event_type')

    #convert from miliseconds to datetime
    event_start = datetime.datetime.fromtimestamp(int(event_start) / 1000.0)
    event_end = datetime.datetime.fromtimestamp(int(event_end) / 1000.0)

    #insert new event into db
    db.event.insert(event_name=event_name, description=event_description, location=event_location,
                    lat=event_lat, lng=event_lng, event_start=event_start,
                    event_end=event_end, event_type=event_type)


@action("edit_event")
@action.uses(db, session, auth.user)
def edit_event():
    edit_event_id = request.params.get('edit_event_id')

    edit_event_name = str(request.params.get('edit_event_name'))
    edit_event_description = str(request.params.get('edit_event_description'))
    edit_event_location = str(request.params.get('edit_event_location'))
    edit_event_lat = request.params.get('event_lat')
    edit_event_lng = request.params.get('event_lng')
    edit_event_start = request.params.get('edit_event_start')
    edit_event_end = request.params.get('edit_event_end')
    edit_event_type = request.params.get('edit_event_type')

    # convert from miliseconds to datetime
    edit_event_start = datetime.datetime.fromtimestamp(int(edit_event_start) / 1000.0)
    edit_event_end = datetime.datetime.fromtimestamp(int(edit_event_end) / 1000.0)

    ret = db(db.event.id == edit_event_id).validate_and_update(event_name=edit_event_name,
                                                               description=edit_event_description,
                                                               location=edit_event_location,
                                                               lat=edit_event_lat,
                                                               lng=edit_event_lng,
                                                               event_start=edit_event_start,
                                                               event_end=edit_event_end,
                                                               event_type=edit_event_type)


@action("delete_event")
@action.uses(db, session, auth.user)
def delete_event():
    delete_event_id = request.params.get('delete_event_id')
    del db.event[delete_event_id]


@action('get_current_datetime')
@action.uses(session)
def get_current_datetime():
    return dict(get_current_datetime=datetime.datetime.now().timestamp())

