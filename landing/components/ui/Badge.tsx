interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "cta" | "muted";
  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  className = "",
}: BadgeProps) {
  const variants = {
    primary:
      "bg-primary-100 text-primary-700 border-primary-200",
    cta: "bg-orange-100 text-orange-700 border-orange-200",
    muted: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border font-body ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
