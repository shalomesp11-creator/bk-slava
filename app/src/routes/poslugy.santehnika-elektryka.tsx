import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";
const service = services[5];
export const Route = createFileRoute("/poslugy/santehnika-elektryka")({
  head: () => pageHead(service.name, "/poslugy/santehnika-elektryka", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
