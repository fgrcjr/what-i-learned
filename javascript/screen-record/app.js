const startBtn = document.getElementById("btn");
const downloadLink = document.getElementById("link");
let blob = null;
let videoStream = null;

startBtn.addEventListener("click", startScreenCapturing);

async function startScreenCapture() {
    if (!navigator.mediaDevices.getDisplayMedia) {
      return alert("Screen capturing not supported in your browser.");
   }
  
    try {
      if (!videoStream?.active) {
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          surfaceSwitching: "include",
   });
  
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
   },
   });
  
        const audioTrack = audioStream.getTracks()[0];
        videoStream.addTrack(audioTrack);
  
        recordStream(videoStream);
   } else {
        throw new Error(
          "There is an ongoing recording. Please, stop it before recording a new one"
   );
   }
   } catch (error) {
      console.error(error);
      alert(error);
   }
  }