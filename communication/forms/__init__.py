from google.appengine.api import users
from google.appengine.ext.webapp import template
from google.appengine.ext.db import djangoforms
from communication import models

class RoomForm(djangoforms.ModelForm):
  class Meta:
    model = models.Room
    exclude = ['owner']