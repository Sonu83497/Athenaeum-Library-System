export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-forest/10 pb-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-xl font-semibold sm:text-2xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 break-words text-xs leading-5 text-ink-light sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex w-full flex-shrink-0 sm:w-auto">
          <div className="w-full sm:w-auto">{action}</div>
        </div>
      )}
    </div>
  );
}
