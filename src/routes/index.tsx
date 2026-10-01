import { createFileRoute } from "@tanstack/react-router";
import { SahayiApp } from "@/components/sahayi/SahayiApp";

const title = "SAHAYI — PM UJJWALA AI Service Guide";
const description =
  "A voice-and-text guide that helps you understand and access PM Ujjwala Yojana in your chosen language.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <SahayiApp />
    </main>
  );
}
