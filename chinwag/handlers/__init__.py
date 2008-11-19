#!/usr/bin/env python

import os
import json
from functools import update_wrapper
from datetime import datetime, timedelta

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from chinwag import models

_DEBUG = True

def online_users(room):
  """returns a list of all the online users"""
  threshold = datetime.now() - timedelta(seconds=10)
  authorizations = models.Authorization.gql("WHERE room = :room AND last_checked_in >= :threshold", room=room, threshold=threshold).fetch(1000)
  return [x.user for x in authorizations]

def login_required(f):
  def _f(self, *a, **kw):
    user = users.get_current_user()
    if not user:
      self.redirect(users.create_login_url(self.request.url))
    else:
      f(self, *a, **kw)
  return update_wrapper(_f, f)
  
def find_room_and_authorize(f):
  """Used to find a room by id. Once found passes it as room rather than id."""
  def _f(self, id):
    room = models.Room.get_by_id(int(id))
    if room and room.is_user_authorized(users.get_current_user()):
      f(self, room)
    else:
      self.error(404)
  return update_wrapper(_f, f)

class ApplicationHandler(webapp.RequestHandler):
  """Supplies a common template generation function."""
  def render_template(self, template_path, template_values={}):
    values = {
      'request'           : self.request,
      'current_user'      : users.get_current_user(),
      'login_url'         : users.create_login_url(self.request.uri),
      'logout_url'        : users.create_logout_url(self.request.uri),
      'application_name'  : 'ChinWag',
    }
    values.update(template_values)
    path = os.path.join(os.path.dirname(__file__), '..', 'views', template_path)
    self.response.out.write(template.render(path, values, debug=_DEBUG))
  
  def render_json(self, obj):
    """Renders an object in json format with proper headers."""
    self.response.content_type = "application/json"
    self.response.out.write(json.encode(obj))
    
class HomeHandler(ApplicationHandler):
  """Handles the home page."""
  def get(self):
    self.render_template('home/index.html')
    
class MockHTTPMethodMiddleware(object):
  """Makes it possible to do PUT DELETE using _method."""
  def __init__(self, app):
    self.app = app

  def __call__(self, environ, start_response):
    method = webapp.Request(environ).get('_method')
    if method:
      environ['REQUEST_METHOD'] = method.upper()
    return self.app(environ, start_response)