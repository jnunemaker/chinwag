#!/usr/bin/env python

from google.appengine.api import users
from google.appengine.ext import webapp,db
from google.appengine.ext.webapp import template
from chinwag import handlers, models, forms

class PingHandler(handlers.ApplicationHandler):
  @handlers.login_required
  @handlers.find_room_and_authorize
  def get(self, room):
    """Returns the latest messages for a given room and the online users in json."""
    messages = models.Message.gql("WHERE room = :room AND evil > :evil", room=room, evil=int(self.request.get('evil')))
    online   = handlers.online_users(room)    
    self.render_json({'messages':messages, 'users':online})