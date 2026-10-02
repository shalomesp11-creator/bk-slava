import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Arrow, SiteShell } from "../slava/site";
import appCss from "../styles.css?url";
import appMeta from "../app-meta.json";
import { origin } from "../slava/content";
import { withBase } from "../slava/base";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: appMeta.og_title },
      { name: "description", content: appMeta.og_description },
      { name: "theme-color", content: "#063b0c" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "uk_UA" },
      { property: "og:site_name", content: "ТОВ БК Слава" },
      { property: "og:image", content: origin + "/assets/og.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: origin + "/assets/og.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: withBase("/favicon.ico") },
      { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png") },
      { rel: "manifest", href: withBase("/site.webmanifest") },
      {
        rel: "preload",
        href: withBase("/fonts/manrope-cyrillic.woff2"),
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: Root,
  notFoundComponent: () => (
    <div className="error-page wrap">
      <span>404</span>
      <h1>Тут ще немає простору.</h1>
      <p>Сторінку не знайдено. Поверніться до головної, щоб продовжити.</p>
      <a href={withBase("/")}>На головну <Arrow diagonal />
      </a>
    </div>
  ),
  errorComponent: () => (
    <div className="error-page wrap">
      <h1>Сторінка не завантажилась.</h1>
      <p>Спробуйте оновити її або повернутися на головну.</p>
      <a href={withBase("/")}>На головну <Arrow diagonal />
      </a>
    </div>
  ),
});
const business = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "ТОВ БК Слава",
  url: origin,
  logo: origin + "/assets/logo-clean.png",
  telephone: "+380676090075",
  email: "m98720141@gmail.com",
  foundingDate: "2006",
  areaServed: [
    { "@type": "City", name: "Київ" },
    { "@type": "AdministrativeArea", name: "Київська область" },
  ],
};
function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
function Root() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteShell>
        <Outlet />
      </SiteShell>
    </QueryClientProvider>
  );
}
