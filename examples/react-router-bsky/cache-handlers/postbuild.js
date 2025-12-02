import redisCacheHandler from './redis.js';

redisCacheHandler.init()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
