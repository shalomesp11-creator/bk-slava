import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";
const service = services[2];
export const Route = createFileRoute("/poslugy/gipsokarton")({
  head: () => pageHead(service.name, "/poslugy/gipsokarton", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
