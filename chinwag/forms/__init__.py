from google.appengine.api import users
from google.appengine.ext.webapp import template
from google.appengine.ext.db import djangoforms
from chinwag import models

class RoomForm(djangoforms.ModelForm):
  class Meta:
    model = models.Room
    exclude = ['user']

class MessageForm(djangoforms.ModelForm):
  class Meta:
    model = models.Message
    exclude = ['created', 'room', 'user']