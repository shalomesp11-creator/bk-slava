import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "../slava/site";
import { pageHead } from "../slava/content";
export const Route = createFileRoute("/portfolio")({
  head: () =>
    pageHead(
      "Наші роботи",
      "/portfolio",
      "Архітектурні рішення та візуалізації житлових і комерційних просторів.",
      "hero",
    ),
  component: Portfolio,
});
