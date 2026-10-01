import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "../slava/site";
import { pageHead } from "../slava/content";
export const Route = createFileRoute("/pryvatnist")({
  head: () =>
    pageHead(
      "Приватність",
      "/pryvatnist",
      "Обробка контактних даних у формі консультації БК Слава.",
      "og",
    ),
  component: Privacy,
});
