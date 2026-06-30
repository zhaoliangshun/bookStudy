import socket
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request

def tcp_echo_server(host, port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(1)
    conn, addr = server.accept()
    data = conn.recv(1024)
    conn.sendall(b"echo: " + data)
    conn.close()
    server.close()

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Hello from http.server!")
    def log_message(self, *args):
        pass

threading.Thread(target=tcp_echo_server, args=("127.0.0.1", 9999), daemon=True).start()
time.sleep(0.1)

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(("127.0.0.1", 9999))
client.sendall(b"hello")
resp = client.recv(1024)
print(f"TCP echo response: {resp.decode()}")
client.close()

httpd = HTTPServer(("127.0.0.1", 9998), SimpleHandler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
time.sleep(0.1)

with urllib.request.urlopen("http://127.0.0.1:9998/") as r:
    print(f"HTTP response: {r.read().decode()}")
httpd.shutdown()
print("Done: socket/http test")
