/** Production site origin (no trailing slash). Used for canonical URLs, OG tags, and sitemaps. */
export const siteUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://pratt.work").replace(/\/+$/, "");

export const siteConfig = {
  name: "Pratt Majmudar",
  role: "Creative Technologist + Producer",
  location: "San Francisco",
  email: "hello@pratt.work",
  /** Canonical public URL for this site — https://pratt.work */
  url: siteUrl,
  socials: {
    instagram: "https://instagram.com/prxatt",
    linkedin: "https://linkedin.com/in/prxatt",
    github: "https://github.com/prattmajmudar",
  },
  availability: "open" as "open" | "selective" | "committed",
  navigation: [
    { name: "WORK", href: "/work" },
    { name: "ABOUT", href: "/about" },
    { name: "VENTURES", href: "/ventures" },
    { name: "PLAYGROUND", href: "/playground" },
    { name: "BLOG", href: "/blog" },
    { name: "CONTACT", href: "/contact" },
  ],
};
