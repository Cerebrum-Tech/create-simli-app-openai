const NOISE_GATE_THRESHOLD = -50; // dB — ambient noise cutoff
const ECHO_GATE_THRESHOLD = -20;  // dB — during speaker output, only loud speech passes
const SPEAKER_ACTIVE_THRESHOLD = -55; // dB — reference level indicating speaker is playing
const SMOOTHING = 0.8;

interface NoiseCancelledStream {
  stream: MediaStream;
  setReference: (remoteStream: MediaStream) => void;
  cleanup: () => void;
}

export async function getNoiseCancelledStream(): Promise<NoiseCancelledStream> {
  const raw = await navigator.mediaDevices.getUserMedia({
    audio: {
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
    },
  });

  const ctx = new AudioContext();

  // Mic chain: source → analyser → gain gate → destination
  const micSource = ctx.createMediaStreamSource(raw);
  const micAnalyser = ctx.createAnalyser();
  micAnalyser.fftSize = 2048;
  micAnalyser.smoothingTimeConstant = SMOOTHING;
  const gate = ctx.createGain();
  gate.gain.value = 1;

  micSource.connect(micAnalyser);
  micAnalyser.connect(gate);

  const dest = ctx.createMediaStreamDestination();
  gate.connect(dest);

  // Reference (speaker) chain — set up when remote track arrives
  let refAnalyser: AnalyserNode | null = null;
  let refSource: MediaStreamAudioSourceNode | null = null;
  const refBuffer = new Float32Array(2048);

  function setReference(remoteStream: MediaStream) {
    if (refAnalyser) return;
    refSource = ctx.createMediaStreamSource(remoteStream);
    refAnalyser = ctx.createAnalyser();
    refAnalyser.fftSize = 2048;
    refAnalyser.smoothingTimeConstant = SMOOTHING;
    refSource.connect(refAnalyser);
    // Analyse only — don't connect to speakers (the <audio> element handles playback)
  }

  // Measure RMS in dB
  const micBuffer = new Float32Array(2048);
  let rafId: number;

  function measureDb(analyser: AnalyserNode, buffer: Float32Array): number {
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    return 20 * Math.log10(Math.max(Math.sqrt(sum / buffer.length), 1e-10));
  }

  function tick() {
    const micDb = measureDb(micAnalyser, micBuffer);

    let speakerActive = false;
    if (refAnalyser) {
      speakerActive = measureDb(refAnalyser, refBuffer) > SPEAKER_ACTIVE_THRESHOLD;
    }

    const threshold = speakerActive ? ECHO_GATE_THRESHOLD : NOISE_GATE_THRESHOLD;
    const target = micDb > threshold ? 1 : 0;
    gate.gain.setTargetAtTime(target, ctx.currentTime, 0.008);

    rafId = requestAnimationFrame(tick);
  }

  tick();

  const cleanup = () => {
    cancelAnimationFrame(rafId);
    raw.getTracks().forEach((t) => t.stop());
    micSource.disconnect();
    micAnalyser.disconnect();
    gate.disconnect();
    refSource?.disconnect();
    refAnalyser?.disconnect();
    ctx.close();
  };

  return { stream: dest.stream, setReference, cleanup };
}
