import { notFound } from "next/navigation";
import { initializeRobindoc } from "robindoc";

export const { Page, Sidebar, getPageData, getMetadata, getStaticParams, getPageInstruction } = initializeRobindoc(
    {
        configuration: {
            sourceRoot: "../docs",
            basePath: "/docs",
        },
        items: [
            {
                title: "Introduction",
                type: "heading",
                href: "/",
                configuration: {
                    sourceRoot: "../README.md",
                },
            },
            {
                type: "separator",
            },
            "auto",
        ],
    },
    {
        processError: notFound,
        matcher: ["/(?!.*\\..+).*"],
        cache: true,
    },
);
