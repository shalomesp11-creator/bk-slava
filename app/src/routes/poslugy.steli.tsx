import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";
const service = services[3];
export const Route = createFileRoute("/poslugy/steli")({
  head: () => pageHead(service.name, "/poslugy/steli", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
