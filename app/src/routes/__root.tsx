import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { SiteShell } from "../slava/site";
import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import appMeta from "../app-meta.json";
import { origin } from "../slava/content";
declare const __HF_DESIGN_INSPECTOR__: boolean;
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: appMeta.og_title },
      { name: "description", content: appMeta.og_description },
      { name: "theme-color", content: "#0D3D06" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "uk_UA" },
      { property: "og:site_name", content: "ТОВ БК Слава" },
      { property: "og:image", content: origin + "/assets/og.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: origin + "/assets/og.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      {
        rel: "preload",
        href: "/fonts/manrope-cyrillic.woff2",
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
      <a href="/">На головну ↗</a>
    </div>
  ),
  errorComponent: () => (
    <div className="error-page wrap">
      <h1>Сторінка не завантажилась.</h1>
      <p>Спробуйте оновити її або повернутися на головну.</p>
      <a href="/">На головну ↗</a>
    </div>
  ),
});
const business = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "ТОВ БК Слава",
  url: origin,
  logo: origin + "/assets/logo.jpg",
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
  useEffect(() => {
    if (__HF_DESIGN_INSPECTOR__)
      void import("../module/design-inspector/runtime")
        .then((m) => m.installHiggsfieldDesignInspector())
        .catch((error) => reportHiggsfieldError(error, { boundary: "design_inspector_import" }));
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <SiteShell>
        <Outlet />
      </SiteShell>
    </QueryClientProvider>
  );
}
