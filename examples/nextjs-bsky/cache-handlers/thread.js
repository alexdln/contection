module.exports = async (keys, client, testRegex, concurrency = 8) => {
    const iterator = keys[Symbol.iterator]();

    const worker = async () => {
        while (true) {
            const next = iterator.next();

            if (next.done) return;

            const key = next.value;

            try {
                if (!testRegex.test(key)) {
                    await client.del(key);
                }
            } catch (err) {
                console.error("Error deleting key:", key, err);
            }
        }
    };

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
};
