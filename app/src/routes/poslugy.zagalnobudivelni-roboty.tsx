import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "../slava/site";
import { pageHead, services } from "../slava/content";

const service = services.find((s) => s.slug === "zagalnobudivelni-roboty")!;
export const Route = createFileRoute("/poslugy/zagalnobudivelni-roboty")({
  head: () => pageHead(service.name, "/poslugy/zagalnobudivelni-roboty", service.intro, service.image),
  component: () => <ServicePage service={service} />,
});
