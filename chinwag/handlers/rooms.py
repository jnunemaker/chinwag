#!/usr/bin/env python

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp,db
from google.appengine.ext.webapp import template
from chinwag import handlers, models, forms

class RoomCollectionHandler(handlers.ApplicationHandler):
  @handlers.login_required
  def get(self):
    """Lists all rooms the user has access to."""
    authorizations = models.Authorization.all().filter("user =", users.get_current_user())
    form = forms.RoomForm(auto_id='room_%s')
    self.render_template('rooms/index.html', {'authorizations':authorizations, 'form':form})
  
  @handlers.login_required
  def post(self):
    """Create new room."""
    form = forms.RoomForm(data=self.request.POST)
    if form.is_valid():
      room = form.save(commit=False)
      room.user = users.get_current_user()
      room.put()
      authorization = models.Authorization(room=room, user=users.get_current_user())
      authorization.put()
      self.redirect(RoomCollectionHandler.get_url())
    else:
      authorizations = models.Authorization.all().filter("user =", users.get_current_user())
      self.render_template('rooms/index.html', {'authorizations':authorizations, 'form':form})

class RoomHandler(handlers.ApplicationHandler):
  @handlers.login_required
  @handlers.find_room_and_authorize
  def get(self, room):
    """Shows an individual room."""
    onlines = handlers.online_users(room)
    self.render_template('rooms/show.html', {'room':room, 'messages':room.messages, 'authorizations':room.authorizations, 'onlines':onlines})
  
  @handlers.login_required
  @handlers.find_room_and_authorize
  def post(self, room):
    """Updates an individual room."""
    form = forms.RoomForm(data=self.request.params, instance=room)
    if form.is_valid():
      room = form.save()
      self.redirect(RoomCollectionHandler.get_url())
    else:
      self.render_template('rooms/edit.html', {'form':form, 'room':room})

class EditRoomHandler(handlers.ApplicationHandler):
  @handlers.login_required
  @handlers.find_room_and_authorize
  def get(self, room):
    """Edit form for an individual room."""
    form = forms.RoomForm(instance=room)
    self.render_template('rooms/edit.html', {'room':room, 'form':form})

