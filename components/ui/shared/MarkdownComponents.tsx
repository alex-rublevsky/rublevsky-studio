import Link from "next/link";
import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/")) {
      // Internal link
      return (
        <Link href={href} className="text-primary hover:underline" {...props}>
          {children}
        </Link>
      );
    }
    // External link
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        {...props}
      >
        {children}
      </a>
    );
  },
};
