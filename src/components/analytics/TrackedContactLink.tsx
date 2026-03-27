"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { FUNNEL_EVENTS, trackEvent } from "@/lib/track-event";

/** Same as `Link`; fires funnel `click_contact`. */
export function TrackedContactLink(props: ComponentProps<typeof Link>) {
  const { onClick, ...rest } = props;
  return (
    <Link
      {...rest}
      onClick={(e) => {
        trackEvent(FUNNEL_EVENTS.clickContact);
        onClick?.(e);
      }}
    />
  );
}
