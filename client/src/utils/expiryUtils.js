// Helper to determine expiry badge status and label
export const getExpiryStatus = (expiryDateString) => {
  if (!expiryDateString) {
    return { status: "fresh", label: "Fresh" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateString);
  if (isNaN(expiry.getTime())) {
    return { status: "fresh", label: "Fresh" };
  }
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: "urgent", label: "Expired" };
  } else if (diffDays === 0) {
    return { status: "urgent", label: "Expires Today" };
  } else if (diffDays <= 3) {
    return { status: "expiring", label: `${diffDays}d left` };
  } else {
    return { status: "fresh", label: "Fresh" };
  }
};

// Check if a grocery item is expired or expiring within the next 3 days
export const isExpiringSoon = (expiryDateString) => {
  const { status } = getExpiryStatus(expiryDateString);
  return status === "urgent" || status === "expiring";
};
