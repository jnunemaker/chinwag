#!/usr/bin/env python

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp,db
from google.appengine.ext.webapp import template
from communication import handlers, models, forms

def find_room(f):
  """Used to find a room by id. Once found passes it as room rather than id."""
  def _f(self, id):
    room = models.Room.get_by_id(int(id))
    if room:
      f(self, room)
    else:
      self.error(404)
  return update_wrapper(_f, f)

class RoomCollectionHandler(webapp.RequestHandler):
  @handlers.login_required
  def get(self):
    """Lists all rooms the user has access to."""
    authorizations = models.Authorization.all().filter("user =", users.get_current_user())
    form = forms.RoomForm(auto_id='room_%s')
    self.response.out.write(
      template.render('communication/views/rooms/index.html', {'authorizations':authorizations, 'form':form}))
  
  @handlers.login_required
  def post(self):
    """Create new room."""
    authorizations = models.Authorization.all().filter("user =", users.get_current_user())
    form = forms.RoomForm(data=self.request.POST)
    if form.is_valid():
      room = form.save(commit=False)
      room.owner = users.get_current_user()
      room.put()
      authorization = models.Authorization(room=room, user=users.get_current_user())
      authorization.put()
      self.redirect(RoomCollectionHandler.get_url())
    else:
      self.response.out.write(
        template.render('communication/views/rooms/index.html', {'authorizations':authorizations, 'form':form}))

class RoomHandler(webapp.RequestHandler):
  @handlers.login_required
  @find_room
  def get(self, room):
    """Shows an individual room."""
    self.response.out.write(
      template.render('communication/views/rooms/show.html', {'room':room}))
  
  @handlers.login_required
  @find_room
  def post(self, room):
    """Updates an individual room."""
    form = forms.RoomForm(data=self.request.params, instance=room)
    if form.is_valid():
      room = form.save()
      self.redirect(RoomCollectionHandler.get_url())
    else:
      self.response.out.write(
        template.render('communication/views/room/edit.html', {'form':form, 'room':room}))

class EditRoomHandler(webapp.RequestHandler):
  @handlers.login_required
  @find_room
  def get(self, room):
    """Edit form for an individual room."""
    form = forms.RoomForm(instance=room)
    self.response.out.write(
      template.render('communication/views/rooms/edit.html', {'room':room, 'form':form}))

