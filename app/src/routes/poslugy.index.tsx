import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "../slava/site";
import { pageHead } from "../slava/content";
export const Route = createFileRoute("/poslugy/")({
  head: () =>
    pageHead(
      "Послуги",
      "/poslugy",
      "Ремонт під ключ, демонтаж, гіпсокартон, стелі, оздоблення, сантехніка та електрика. Київ та область.",
      "house",
    ),
  component: ServicesPage,
});
