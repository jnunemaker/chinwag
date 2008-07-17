#!/usr/bin/env python

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

def login_required(f):
  def _f(self, *a, **kw):
    user = users.get_current_user()
    if not user:
      self.redirect(users.create_login_url(self.request.url))
    else:
      f(self, *a, **kw)
  return update_wrapper(_f, f)

# Home page
class HomeHandler(webapp.RequestHandler):
  """Handles the home page."""
  def get(self):
    self.response.out.write(template.render('communication/views/home/index.html', {}))

# Makes it possible to do PUT DELETE using _method
class MockHTTPMethodMiddleware(object):
  def __init__(self, app):
    self.app = app

  def __call__(self, environ, start_response):
    method = webapp.Request(environ).get('_method')
    if method:
      environ['REQUEST_METHOD'] = method.upper()
    return self.app(environ, start_response)