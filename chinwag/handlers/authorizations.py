#!/usr/bin/env python

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp,db
from google.appengine.ext.webapp import template
from chinwag import handlers, models

class AuthorizationCollectionHandler(handlers.ApplicationHandler):  
  @handlers.login_required
  @handlers.find_room_and_authorize
  def post(self, room):
    """Create new room."""
    email = self.request.get('email')
    if email:
      new_user = users.User(email)
      authorization = models.Authorization(room=room, user=new_user)
      authorization.put()
      self.render_json(authorization)
    else:
      self.render_json({'error':'You did not provide an email address.'})