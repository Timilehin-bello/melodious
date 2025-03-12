export const extractDuration = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      const duration = Math.floor(audio.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    });
    audio.addEventListener("error", () => reject("Error extracting duration"));
  });
};

export const extractDurationInSeconds = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.src = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      resolve(Math.floor(audio.duration));
    });
    audio.addEventListener("error", () => reject("Error extracting duration"));
  });
};

export const formatDuration = (seconds: string | number): string => {
  const totalSeconds = Math.floor(Number(seconds)); // Ensure it's a valid number
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export function timeStringToSeconds(time: string): number {
  const [minutes, seconds] = time.split(":").map(Number);
  return minutes * 60 + seconds;
}
