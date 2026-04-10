import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function createIcon(paths: ReactNode) {
  return function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const HomeIcon = createIcon(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M9 20v-6h6v6" />
  </>,
);

export const LinkIcon = createIcon(
  <>
    <path d="M10.5 13.5 8 16a3.5 3.5 0 1 1-5-5l2.5-2.5" />
    <path d="m13.5 10.5 2.5-2.5a3.5 3.5 0 1 1 5 5L18.5 15.5" />
    <path d="m8.5 15.5 7-7" />
  </>,
);

export const QrIcon = createIcon(
  <>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <path d="M15 15h3v3" />
    <path d="M21 15v6h-6" />
    <path d="M18 18h.01" />
  </>,
);

export const PagesIcon = createIcon(
  <>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
    <path d="M9 16h4" />
  </>,
);

export const AnalyticsIcon = createIcon(
  <>
    <path d="M5 19V9" />
    <path d="M12 19V5" />
    <path d="M19 19v-7" />
  </>,
);

export const SettingsIcon = createIcon(
  <>
    <path d="m12 3 1.4 2.8 3.1.4-2.2 2.1.5 3.1L12 10.8 9.2 11.4l.5-3.1L7.5 6.2l3.1-.4L12 3Z" />
    <circle cx="12" cy="15.5" r="3.5" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.5-3.5" />
  </>,
);

export const HelpIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.2a2.8 2.8 0 1 1 4.8 2c-.9.7-1.7 1.2-1.7 2.6" />
    <path d="M12 17h.01" />
  </>,
);

export const SparkleIcon = createIcon(
  <>
    <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
    <path d="m18.5 14  .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </>,
);

export const ChevronDownIcon = createIcon(
  <>
    <path d="m6 9 6 6 6-6" />
  </>,
);

export const PlusIcon = createIcon(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);

export const ArrowRightIcon = createIcon(
  <>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </>,
);

export const CheckCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.2 2.2 4.8-5.2" />
  </>,
);

export const CircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
  </>,
);

export const LockIcon = createIcon(
  <>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
  </>,
);

export const StarsIcon = createIcon(
  <>
    <path d="m8.5 4 .9 2.6L12 7.5l-2.6.9-.9 2.6-.9-2.6L5 7.5l2.6-.9L8.5 4Z" />
    <path d="m16.5 8 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
    <path d="m14.5 15 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
  </>,
);
