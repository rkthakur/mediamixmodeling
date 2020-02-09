############ To Do #################
# 1. Exception Handling
#
#
###################################


from LinearRegression import runLinearRegression
import http.server
# Support for SSL #
import ssl
import socketserver
#from urllib.parse import urlparse
from urllib.parse import parse_qs, urlparse

PORT = 8000

class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()

    def do_GET(self):
        print(self.path)
        urldata=urlparse(self.path)
        urlquery=parse_qs(urldata.query,keep_blank_values=True)
        if urldata.path in ['/lm']:
            self.send_response(200)
            if not urlquery['uid'][0]:
                print("Invalid Request")
            else:
                model = runLinearRegression(urlquery['uid'][0])
        else:
            self.send_response(404)
            model = {"code" : 99, "message" : "invalid request"}
        self.send_header("Content-type", "application/json")
        self.end_headers()
        if 'modelResult' in model:
            self.send_response(200)
        else:
            self.send_response(404)

try:
    server = http.server.HTTPServer(('', PORT), MyHandler)
    server.socket = ssl.wrap_socket (server.socket,keyfile="/etc/letsencrypt/live/romimate.com/privkey.pem",certfile='/etc/letsencrypt/live/romimate.com/cert.pem', server_side=True)
    print('Started http server')
    server.serve_forever()
except KeyboardInterrupt:
    print('^C received, shutting down server')
    server.socket.close()
