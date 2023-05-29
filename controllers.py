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

@action("Home")
@action.uses("home.html", db, auth, url_signer)
def home():
    return dict(
        get_home_events_url = URL('home_list_events', signer=url_signer),
    )

@action("home_list_events")
@action.uses(db, auth, url_signer.verify())
def home_list_events():
    all_events = db(db.event).select()
    return dict(all_events=all_events)

#TODO: Add auth to events
@action("my_events", method=["GET"])
@action.uses("my_events.html", db, session, url_signer)
def my_events():
    # rows = db(db.event.created_by == auth.user_id).select()
    # events = db(db.event).select()
    #
    # return dict(events=events)
    return dict(
        get_events_url = URL('get_events', signer=url_signer),
    )


@action("get_events")
@action.uses(url_signer.verify(), db)
def get_events():
    events = db(db.event).select()
    return dict(events=events, url_signer=url_signer)


@action("create_event", method=["GET", "POST"])
@action.uses("create_event.html", db, session)
def create_event():
    form = Form(db.event, csrf_session=session, formstyle=FormStyleBulma)

    if form.accepted:
        redirect(URL('create_event'))

    return dict(form=form)


@action("edit_event/<id:int>", method=["GET", "POST"])
@action.uses("edit_event.html", db, session)
def edit_event(id=None):
    if id is None:
        redirect(URL('my_events'))

    event = db.event[id]

    # assert event.created_by == auth.user_id

    if event is None:
        #Nothing found
        redirect(URL('my_events'))

    form = Form(db.event, record=id, csrf_session=session, formstyle=FormStyleBulma)

    if form.accepted:
        redirect(URL('my_events'))

    return dict(form=form)
