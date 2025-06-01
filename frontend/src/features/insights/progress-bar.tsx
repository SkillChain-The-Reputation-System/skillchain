interface ProgressBarProps {
  value: number; // 0-100
  fillColor?: string;
  className?: string;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  fillColor = 'var(--color-gray-400)',
  className = '',
  height = '8px'
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={`w-full bg-neutral-200 dark:bg-neutral-900 rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: `${clampedValue}%`,
          backgroundColor: fillColor
        }}
      />
    </div>
  );
};

ProgressBar.displayName = "ProgressBar"

export default ProgressBar;