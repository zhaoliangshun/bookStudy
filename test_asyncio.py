import asyncio

async def fetch_data(name, delay):
    print(f"start fetching {name}...")
    await asyncio.sleep(delay)
    print(f"done {name}")
    return f"{name}_result"

async def worker(name, queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"worker {name} processing: {item}")
        await asyncio.sleep(0.05)
        queue.task_done()

async def main():
    results = await asyncio.gather(
        fetch_data("A", 0.1),
        fetch_data("B", 0.05),
        fetch_data("C", 0.08),
    )
    print(f"gather results: {results}")

    queue = asyncio.Queue()
    tasks = [asyncio.create_task(worker(str(i), queue)) for i in range(2)]
    for item in ["x", "y", "z"]:
        await queue.put(item)
    await queue.join()
    for _ in tasks:
        await queue.put(None)
    await asyncio.gather(*tasks)
    print("Done: asyncio test")

asyncio.run(main())
