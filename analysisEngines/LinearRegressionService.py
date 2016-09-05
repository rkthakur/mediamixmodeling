from LinearRegression import runLinearRegression
import http.server
import socketserver
from urllib.parse import urlparse

PORT = 8000

class MyHandler(http.server.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()

    def do_GET(self):
        print(self.path)
        if self.path in ['/lm']:
            self.send_response(200)
            model = runLinearRegression()
        else:
            self.send_response(404)
            model = {"code" : 99, "message" : "invalid request"}
        self.send_header("Content-type", "application/json")
        self.end_headers()
        #print(self.wfile)
        self.wfile.write(bytes(str(model),"utf-8"))
        #self.wfile.close()

try:
    server = http.server.HTTPServer(('localhost', PORT), MyHandler)
    print('Started http server')
    server.serve_forever()
except KeyboardInterrupt:
    print('^C received, shutting down server')
    server.socket.close()
