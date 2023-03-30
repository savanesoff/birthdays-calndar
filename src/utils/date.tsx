export function getLocalizedDate(date: string) {
  // in formate {DD}{MM}, use regex
  const data = date.match(/\{DD:(\d+)\}\{MM:(\d+)\}/);
  if (!data) {
    return date;
  }
  const dateObj = new Date();
  dateObj.setMonth(parseInt(data[2]) - 1);
  dateObj.setDate(parseInt(data[1]));

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}
