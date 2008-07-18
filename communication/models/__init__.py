#!/usr/bin/env python

from google.appengine.ext import db
from google.appengine.api import users

class Room(db.Model):
  name    = db.StringProperty(required=True)
  user    = db.UserProperty()
  created = db.DateTimeProperty(auto_now_add=True)
  updated = db.DateTimeProperty(auto_now=True)
  
  def is_user_authorized(self, user):
    """Returns True if user is authorized else False."""
    count = Authorization.all().filter('user =', user).filter('room =', self).count(1)
    if count == 1:
      return True
    else:
      return False
      
  def to_dict(self):
    return {
      'id'      : self.key().id(),
      'name'    : self.name,
      'user'    : self.user.nickname(),
      'created' : self.created.strftime('%Y-%m-%d %H:%M:%S')
    }

class Message(db.Model):
  """Type of message. Should be one of enter, exit, message, timestamp."""
  breed   = db.StringProperty(choices=['enter', 'exit', 'text', 'timestamp'])
  body    = db.TextProperty(required=True)
  created = db.DateTimeProperty(auto_now_add=True)
  room    = db.ReferenceProperty(Room, collection_name='messages')
  user    = db.UserProperty()
  
  def to_dict(self):
    return {
      'id'      : self.key().id(),
      'breed'   : self.breed,
      'body'    : self.body,
      'created' : self.created.strftime('%Y-%m-%d %H:%M:%S'),
      'room'    : self.room.name,
      'user'    : self.user.nickname()
    }

class Authorization(db.Model):
  room    = db.ReferenceProperty(Room, collection_name='authorizations', required=True)
  user    = db.UserProperty()
  
  def to_dict(self):
    return {
      'id'    : self.key().id(),
      'user'  : self.user.nickname(),
      'room'  : self.room.name
    }