import multiprocessing
import time
from concurrent.futures import ProcessPoolExecutor

def square(n):
    time.sleep(0.05)
    return n * n

def producer(queue):
    for i in range(3):
        queue.put(f"msg{i}")
        time.sleep(0.05)

def consumer(queue):
    time.sleep(0.1)
    while not queue.empty():
        msg = queue.get()
        print(f"received: {msg}")

if __name__ == "__main__":
    q = multiprocessing.Queue()
    p1 = multiprocessing.Process(target=producer, args=(q,))
    p2 = multiprocessing.Process(target=consumer, args=(q,))
    p1.start()
    p2.start()
    p1.join()
    p2.join()

    with ProcessPoolExecutor(max_workers=4) as pool:
        nums = [1, 2, 3, 4, 5]
        results = list(pool.map(square, nums))
        print(f"process pool squares: {results}")
    print("Done: multiprocessing test")
