import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { workProjects } from "@/data/workProjects";
import { getAllFilesMetadata } from "@/lib/mdx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticPaths = [
    "/",
    "/work",
    "/about",
    "/ventures",
    "/playground",
    "/blog",
    "/contact",
    "/resume",
  ];

  const blogPosts = await getAllFilesMetadata("blog");
  const playgroundPosts = await getAllFilesMetadata("playground");

  const modified = (iso?: string) => { const d = iso ? new Date(iso) : new Date(); return isNaN(d.getTime()) ? new Date() : d; };

  return [
    ...staticPaths.map((path) => ({
      url: path === "/" ? `${base}/` : `${base}${path}`,
      lastModified: new Date(),
    })),
    ...workProjects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: new Date(),
    })),
    ...blogPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: modified((post as { date?: string }).date),
    })),
    ...playgroundPosts.map((post) => ({
      url: `${base}/playground/${post.slug}`,
      lastModified: modified((post as { date?: string }).date),
    })),
  ];
}
