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