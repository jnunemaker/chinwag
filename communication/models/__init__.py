#!/usr/bin/env python

from google.appengine.ext import db
from google.appengine.api import users

class Room(db.Model):
  name    = db.StringProperty(required=True)
  owner   = db.UserProperty()
  created = db.DateTimeProperty(auto_now_add=True)
  updated = db.DateTimeProperty(auto_now=True)

class Message(db.Model):
  breed   = db.StringProperty(required=True)
  body    = db.TextProperty(required=True)
  created = db.DateTimeProperty(required=True, auto_now_add=True)
  room    = db.ReferenceProperty(Room, required=True)
  creator = db.UserProperty()

class Authorization(db.Model):
  room    = db.ReferenceProperty(Room, required=True)
  user    = db.UserProperty()
