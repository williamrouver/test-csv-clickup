interface InternBadgeProps {
  isIntern?: boolean;
}

export function InternBadge({ isIntern }: InternBadgeProps) {
  if (!isIntern) return null;

  return (
    <span className="ml-2 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded font-semibold uppercase animate-scale-in transition-all duration-200 hover:scale-110 hover:shadow-md">
      Estagiário
    </span>
  );
}
