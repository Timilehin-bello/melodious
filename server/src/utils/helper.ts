export const convertDurationToSeconds = (duration: string): number => {
  const [minutes, seconds] = duration.split(":").map(Number);

  return minutes * 60 + seconds;
};
