#!/usr/bin/env python

from functools import update_wrapper
from google.appengine.api import users
from google.appengine.ext import webapp,db
from google.appengine.ext.webapp import template
from communication import handlers, models, forms

class MessageCollectionHandler(webapp.RequestHandler):
  def post(self):
    """Creates a new message"""
    
    