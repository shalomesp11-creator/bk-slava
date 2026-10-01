import { createFileRoute } from "@tanstack/react-router";
import { origin, services } from "../slava/content";
const paths = [
  "/",
  "/poslugy",
  "/portfolio",
  "/pro-kompaniyu",
  "/kontakty",
  "/pryvatnist",
  ...services.map((s) => "/poslugy/" + s.slug),
];
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
            paths.map((p) => "<url><loc>" + origin + p + "</loc></url>").join("") +
            "</urlset>",
          { headers: { "Content-Type": "application/xml; charset=utf-8" } },
        ),
    },
  },
});
