import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";
const service = services[4];
export const Route = createFileRoute("/poslugy/ozdoblennya")({
  head: () => pageHead(service.name, "/poslugy/ozdoblennya", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
