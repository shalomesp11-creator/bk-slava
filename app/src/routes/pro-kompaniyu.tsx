import { createFileRoute } from "@tanstack/react-router";
import { About } from "../slava/site";
import { pageHead } from "../slava/content";
export const Route = createFileRoute("/pro-kompaniyu")({
  head: () =>
    pageHead(
      "Про компанію",
      "/pro-kompaniyu",
      "ТОВ БК Слава працює з 2006 року у Києві та Київській області.",
      "material",
    ),
  component: About,
});
