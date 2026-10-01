import { createFileRoute } from "@tanstack/react-router";
import { Contacts } from "../slava/site";
import { pageHead } from "../slava/content";
export const Route = createFileRoute("/kontakty")({
  head: () =>
    pageHead(
      "Контакти",
      "/kontakty",
      "Телефон +380 67 609 00 75. WhatsApp, Viber, email. Запис на консультацію.",
      "material",
    ),
  component: Contacts,
});
