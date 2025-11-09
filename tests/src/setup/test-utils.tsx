if (global.TransformStream === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TransformStream } = require("node:stream/web");
    global.TransformStream = TransformStream;
}

export * from "@testing-library/react";
