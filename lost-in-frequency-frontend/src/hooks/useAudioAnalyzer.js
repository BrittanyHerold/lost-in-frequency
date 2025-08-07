// hooks/useAudioAnalyzer.js
import { useEffect, useState } from "react";

const useAudioAnalyzer = (analyser) => {
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(32));

  useEffect(() => {
    if (!analyser) return;

    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let raf;
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      setFrequencyData([...dataArray]);
      raf = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return frequencyData;
};

export default useAudioAnalyzer;




