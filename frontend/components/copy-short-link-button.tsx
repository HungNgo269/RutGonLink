"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyShortLinkButtonProps = {
  value: string;
  label?: string;
  compact?: boolean;
};

export function CopyShortLinkButton({
  value,
  label = "Copy",
  compact = false,
}: CopyShortLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyShortLink() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Short link copied", {
        description: value,
      });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Unable to copy short link");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "icon-sm" : "sm"}
      aria-label="Copy short link"
      title="Copy short link"
      onClick={copyShortLink}
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {compact ? null : copied ? "Copied" : label}
    </Button>
  );
}
