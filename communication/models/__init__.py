#!/usr/bin/env python

from google.appengine.ext import db
from google.appengine.api import users
from datetime import datetime

class Room(db.Model):
  name    = db.StringProperty(required=True)
  user    = db.UserProperty()
  created = db.DateTimeProperty(auto_now_add=True)
  updated = db.DateTimeProperty(auto_now=True)
  
  def is_user_authorized(self, user):
    """Returns True if user is authorized else False."""    
    authorization = Authorization.all().filter('user =', user).filter('room =', self).get()
    
    if authorization:
      authorization.last_checked_in = datetime.now()
      authorization.put()
      return True
    else:
      return False

class Message(db.Model):
  """Type of message. Should be one of enter, exit, message, timestamp."""
  breed   = db.StringProperty(choices=['enter', 'exit', 'text', 'timestamp'])
  body    = db.TextProperty(required=True)
  created = db.DateTimeProperty(auto_now_add=True)
  room    = db.ReferenceProperty(Room, collection_name='messages')
  user    = db.UserProperty()
  evil    = db.IntegerProperty()
  
  def increment_evil(self):
    """docstring for fname"""
    last = Message.gql("WHERE room = :room ORDER BY evil DESC", room=self.room).fetch(1)
    if len(last) > 0:
      self.evil = last[0].evil + 1
    else:
      self.evil = 1

class Authorization(db.Model):
  room            = db.ReferenceProperty(Room, collection_name='authorizations', required=True)
  user            = db.UserProperty()
  last_checked_in = db.DateTimeProperty()
