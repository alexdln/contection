import { getCacheData } from "@nimpl/cache-tools";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cacheHandler = require("../../../../../cache-handler.js");

export const GET = async (_request: Request, { params }: { params: Promise<{ segments?: string[] }> }) => {
    const { segments } = await params;

    const data = await getCacheData(cacheHandler, segments);

    if (!data) {
        return new Response("", { status: 404 });
    }

    return new Response(JSON.stringify(data));
};
