export const timeSlots = Array.from({ length: 19 }, (_, i) => {
  const hour = Math.floor(9 + i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  const time24 = `${hour.toString().padStart(2, "0")}:${minute}`
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const ampm = hour >= 12 ? "PM" : "AM"
  const time12 = `${hour12}:${minute} ${ampm}`
  return { value: time24, label: time12 }
})

export const calculateMeetingDuration = (fromTime: string, toTime: string): number => {
  const [fromHour, fromMinute] = fromTime.split(":").map(Number)
  const [toHour, toMinute] = toTime.split(":").map(Number)

  const fromTotalMinutes = fromHour * 60 + fromMinute
  const toTotalMinutes = toHour * 60 + toMinute

  return toTotalMinutes - fromTotalMinutes
}

export const renderMeetingUntilTime = (date: Date, fromTime: string, toTime: string) => {
  const now = new Date();

  function parseTimeToDate(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  const fromDateTime = parseTimeToDate(date, fromTime);
  const toDateTime = parseTimeToDate(date, toTime);

  let targetTime: Date;
  let isUpcoming: boolean;

  if (now < fromDateTime) {
    // Event hasn't started yet
    targetTime = fromDateTime;
    isUpcoming = true;
  } else if (now <= toDateTime) {
    // Event is currently happening
    return "Happening now";
  } else {
    // Event has ended
    targetTime = toDateTime;
    isUpcoming = false;
  }

  const diffMs = Math.abs(targetTime.getTime() - now.getTime());

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${isUpcoming ? 'remaining' : 'ago'}`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${isUpcoming ? 'remaining' : 'ago'}`;
  } else if (diffMinutes >= 1) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ${isUpcoming ? 'remaining' : 'ago'}`;
  } else {
    // Less than or equal to 1 minute
    return isUpcoming ? 'Starting soon' : 'Just ended';
  }
}