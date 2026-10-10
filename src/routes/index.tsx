import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Security built into every system layer" },
      { name: "description", content: "AISS - Agentic AI Security System. Local-first security monitoring that stays resilient, controlled, and uncompromised under pressure." },
    ],
  }),
  component: Index,
});

function Index() {
  // Redirect to the standalone landing page
  window.location.href = "/landing.html";
  return null;
}
