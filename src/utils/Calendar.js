export const getTaskTop = (date) => {
  const formattedDate = new Date(date);

  const hours = formattedDate.getHours();
  const minutes = formattedDate.getMinutes();
  return hours * 50 + (minutes * 50) / 60; // 70px per hour + top offset
};

export const getTaskHeight = (start, end) => {
  const diffMs = end - start;
  const diffMinutes = diffMs / (1000 * 60);
  return (diffMinutes * 50) / 60; // scale to 70px/hour
};
