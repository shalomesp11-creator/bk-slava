import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";
const service = services[1];
export const Route = createFileRoute("/poslugy/demontazh")({
  head: () => pageHead(service.name, "/poslugy/demontazh", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
