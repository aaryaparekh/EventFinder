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
@action.uses("index.html", auth, T)
def index():
    user = auth.get_user()
    message = T("Hello {first_name}".format(**user) if user else "Hello")
    actions = {"allowed_actions": auth.param.allowed_actions}
    return dict(message=message, actions=actions)

@action("Login")
@action.uses("profile.html", auth, T)
def login():
    actions = {"allowed_actions": auth.param.allowed_actions}

    return dict(actions=actions)


#TODO: Add auth to events
@action("my_events", method=["GET"])
@action.uses("my_events.html", db, session, url_signer)
def my_events():
    return dict(
        get_events_url = URL('get_events', signer=url_signer),
        create_event_url = URL('create_event', signer=url_signer),
        edit_event_url = URL('edit_event', signer=url_signer),
        delete_event_url = URL('delete_event', signer=url_signer),
        # url_signer=url_signer,
    )


@action("get_events")
@action.uses(url_signer.verify(), db)
def get_users():
    events = db(db.event).select()
    return dict(events=events, url_signer=url_signer)


@action("create_event")
@action.uses(db, session)
def create_event():
    event_name = str(request.params.get('event_name'))
    event_description = str(request.params.get('event_description'))
    event_location = str(request.params.get('event_location'))
    event_start = request.params.get('event_start')
    event_end = request.params.get('event_end')

    #convert from miliseconds to datetime
    event_start = datetime.datetime.fromtimestamp(int(event_start) / 1000.0)
    event_end = datetime.datetime.fromtimestamp(int(event_end) / 1000.0)

    #insert new event into db
    db.event.insert(event_name=event_name, description=event_description, location=event_location,
                    event_start=event_start, event_end=event_end)


@action("edit_event")
@action.uses(db, session)
def edit_event():
    edit_event_id = request.params.get('edit_event_id')

    edit_event_name = str(request.params.get('edit_event_name'))
    edit_event_description = str(request.params.get('edit_event_description'))
    edit_event_location = str(request.params.get('edit_event_location'))
    edit_event_start = request.params.get('edit_event_start')
    edit_event_end = request.params.get('edit_event_end')

    # convert from miliseconds to datetime
    edit_event_start = datetime.datetime.fromtimestamp(int(edit_event_start) / 1000.0)
    edit_event_end = datetime.datetime.fromtimestamp(int(edit_event_end) / 1000.0)

    ret = db(db.event.id == edit_event_id).validate_and_update(event_name=edit_event_name,
                                                          description=edit_event_description,
                                                          location=edit_event_location,
                                                          event_start=edit_event_start,
                                                          event_end=edit_event_end)



@action("delete_event")
@action.uses(db, session)
def delete_event():
    delete_event_id = request.params.get('delete_event_id')
    del db.event[delete_event_id]

