import { SectionPlaceholder } from "@/components/app-shell/section-placeholder";

export default function SettingsPage() {
  return (
    <SectionPlaceholder
      eyebrow="Settings"
      title="Configure workspace behavior and defaults."
      description="Keep account preferences, domains, and access rules here while preserving the same navigation and top bar across every route."
    />
  );
}
