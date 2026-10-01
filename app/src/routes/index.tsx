import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../slava/site";
import { pageHead } from "../slava/content";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Ремонт та будівництво у Києві",
      "/",
      "ТОВ БК Слава працює з 2006 року. Ремонт під ключ, демонтаж, гіпсокартон, стелі та оздоблення у Києві й області.",
    ),
  component: Home,
});
