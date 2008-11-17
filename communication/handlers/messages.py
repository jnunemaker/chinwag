#!/usr/bin/env python

from datetime import datetime, timedelta

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp,db
from google.appengine.ext.webapp import template
from communication import handlers, models, forms
import logging

def online_users(room):
  """returns a list of all the online users"""
  threshold = datetime.now() - timedelta(seconds=15)
  authorizations = models.Authorization.gql("WHERE room = :room AND last_checked_in >= :threshold", room=room, threshold=threshold).fetch(1000)
  return [x.user for x in authorizations]

class MessageCollectionHandler(handlers.ApplicationHandler):
  @handlers.login_required
  @handlers.find_room_and_authorize
  def get(self, room):
    """Returns the latest messages for a given room in json."""
    messages = models.Message.gql("WHERE room = :room AND evil > :evil", room=room, evil=int(self.request.get('evil')))
    online = online_users(room)    
    self.render_json({'messages':messages, 'users':online})
    
  @handlers.login_required
  @handlers.find_room_and_authorize
  def post(self, room):
    """Creates a new message."""
    form = forms.MessageForm(data=self.request.POST)
    if form.is_valid():
      message      = form.save(commit=False)
      message.room = room
      message.user = users.get_current_user()
      message.increment_evil()
      message.put()
      messages = models.Message.gql("WHERE room = :room AND evil > :evil", room=room, evil=int(self.request.get('evil')))
      online = online_users(room)
      self.render_json({'messages':messages, 'users':online})
    else:
      self.response.out.write('invalid')