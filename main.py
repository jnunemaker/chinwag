#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import wsgiref.handlers
from chinwag import handlers
from chinwag.handlers import messages, rooms, authorizations, ping
from google.appengine.ext import webapp

def main():
  application = webapp.WSGIApplication([
      ('/', handlers.HomeHandler),
      ('/ping/(\d+)/?', ping.PingHandler),
      ('/rooms/?', rooms.RoomCollectionHandler),
      ('/rooms/(\d+)/?', rooms.RoomHandler),
      ('/rooms/(\d+)/edit/?', rooms.EditRoomHandler),
      ('/rooms/(\d+)/messages/?', messages.MessageCollectionHandler),
      ('/rooms/(\d+)/authorizations/?', authorizations.AuthorizationCollectionHandler),
    ], debug=True)
  wsgiref.handlers.CGIHandler().run(handlers.MockHTTPMethodMiddleware(application))

if __name__ == '__main__':
  main()
