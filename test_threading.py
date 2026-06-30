import threading
import time
from concurrent.futures import ThreadPoolExecutor

counter = 0
lock = threading.Lock()

def increment(name):
    global counter
    for _ in range(5):
        with lock:
            counter += 1
            print(f"thread{name}: counter={counter}")
        time.sleep(0.05)

threads = []
for i in range(3):
    t = threading.Thread(target=increment, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"manual threads done, counter={counter}")

counter = 0
def worker(n):
    global counter
    with lock:
        counter += n
    time.sleep(0.05)
    return n * 2

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(worker, [1, 2, 3, 4]))
    print(f"pool results: {results}, counter={counter}")
print("Done: threading test")
