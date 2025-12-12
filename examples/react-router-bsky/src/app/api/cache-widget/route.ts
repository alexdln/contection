import { getCacheData } from "../../../../cache-handler";

export const loader = async ({ params }: { params: { id?: string } }) => {
    const data = await getCacheData(params.id ? [params.id] : undefined);

    return new Response(JSON.stringify(data));
};
