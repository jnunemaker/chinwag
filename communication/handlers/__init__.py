#!/usr/bin/env python

import os

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from django.utils import simplejson

_DEBUG = True

def login_required(f):
  def _f(self, *a, **kw):
    user = users.get_current_user()
    if not user:
      self.redirect(users.create_login_url(self.request.url))
    else:
      f(self, *a, **kw)
  return update_wrapper(_f, f)

class ApplicationHandler(webapp.RequestHandler):
  """Supplies a common template generation function."""
  def render_template(self, template_path, template_values={}):
    values = {
      'request'           : self.request,
      'current_user'      : users.GetCurrentUser(),
      'login_url'         : users.CreateLoginURL(self.request.uri),
      'logout_url'        : users.CreateLogoutURL(self.request.uri),
      'application_name'  : 'Communication',
    }
    values.update(template_values)
    path = os.path.join(os.path.dirname(__file__), '..', 'views', template_path)
    self.response.out.write(template.render(path, values, debug=_DEBUG))
    
  def render_json(self, obj):
    """Renders an object in json format with proper headers."""
    self.response.content_type = "application/json"
    simplejson.dump(obj, self.response.out)
    
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