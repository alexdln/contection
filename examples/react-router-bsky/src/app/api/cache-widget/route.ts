import { getCacheData } from "../../../../cache-handler";

export const loader = async ({ params }: { params: { "*"?: string } }) => {
    const segments = params["*"]?.split("/").filter(Boolean) ?? [];
    const data = await getCacheData(segments);

    if (!data) return new Response("", { status: 404 });

    return new Response(JSON.stringify(data));
};
