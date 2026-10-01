import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";
const service = services[0];
export const Route = createFileRoute("/poslugy/remont-pid-klyuch")({
  head: () => pageHead(service.name, "/poslugy/remont-pid-klyuch", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
