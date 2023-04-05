export const getLocalizeDate = ({ MM, DD }: { MM: string; DD: string }) => {
  const dateObj = new Date();
  dateObj.setMonth(parseInt(MM) - 1);
  dateObj.setDate(parseInt(DD));

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
};
