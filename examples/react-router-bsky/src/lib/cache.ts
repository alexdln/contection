import { Readable } from "node:stream";

import cacheHandler from "@/cache-handlers/redis";

export const cache =
    <Params extends unknown[]>(key: string, callback: (...args: Params) => Promise<unknown>) =>
    async (...args: Params) => {
        const cacheKey = `["${process.env.BUILD_ID}",${key}]`;
        const cached = await cacheHandler.get(cacheKey);

        try {
            if (cached?.value && cached.value instanceof ReadableStream) {
                return (cached.value as ReadableStream<string>)
                    .getReader()
                    .read()
                    .then(({ value }) => value && JSON.parse(value));
            }
        } catch (error) {
            console.error(error);
        }

        const data = await callback(...args);
        await cacheHandler.set(
            cacheKey,
            Promise.resolve({
                value: Readable.toWeb(Readable.from(JSON.stringify(data))),
                tags: [],
                stale: false,
                timestamp: performance.timeOrigin + performance.now(),
                expire: 60,
                revalidate: 60,
            }),
        );

        return data;
    };
