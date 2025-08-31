export function getTrend(change?: string) {
  if (!change) {
    return {
      trend: "neutral",
      className: "text-muted-foreground",
      label: "No change",
    };
  }

  const value = parseFloat(change.replace("%", "").trim());

  if (isNaN(value)) {
    return {
      trend: "neutral",
      className: "text-muted-foreground",
      label: "No change",
    };
  }

  if (value > 0) {
    return {
      trend: "uptrend",
      className: "text-green-500",
      label: `Up ${change}`,
    };
  }

  if (value < 0) {
    return {
      trend: "downtrend",
      className: "text-red-500",
      label: `Down ${change.replace("-", "")}`,
    };
  }

  // Covers +0% or 0%
  return {
    trend: "neutral",
    className: "text-muted-foreground",
    label: "No change",
  };
}
