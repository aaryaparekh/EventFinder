"""
This file defines the database models
"""

from .common import db, Field, auth
from pydal.validators import *
from datetime import datetime

### Define your table below
#
# db.define_table('thing', Field('name'))
#
## always commit your models to avoid problems later
#
# db.commit()
#


# TODO: This gets local timezone. Update this so that all event creation takes America/Los_Angeles timezone
# TODO: Location needs to be verified as real

db.define_table(
    'event',
    Field('created_by', 'reference auth_user', default=lambda: auth.user_id, readable=False, writable=False),
    Field('creation_timestamp', type='datetime', default=datetime.now()),
    Field('event_start', type='datetime', default=datetime.now()),
    Field('event_end', type='datetime', defaul=datetime.now()),
    Field('event_name', type='string', requires=IS_NOT_EMPTY()),
    Field('location', type='string', requires=IS_NOT_EMPTY()),
    Field('lat', type="float", default=0, requires=IS_NOT_EMPTY()),
    Field('lng', type="float", default=0, requires=IS_NOT_EMPTY()),
    Field('description', type='text', requires=IS_NOT_EMPTY()),
    Field('event_type', default=''),
)

db.event.id.readable = False
db.event.id.writable = False

db.event.creation_timestamp.readable = False
db.event.creation_timestamp.writable = False

db.event.lat.readable = False
db.event.lat.writable = False

db.event.lng.readable = False
db.event.lng.writable = False

db.auth_user.id.readable = False
db.auth_user.id.writable = False

db.commit()
