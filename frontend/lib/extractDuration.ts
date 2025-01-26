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
