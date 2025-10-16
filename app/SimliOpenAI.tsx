import IconSparkleLoader from "@/media/IconSparkleLoader";
import { RealtimeClient } from "@openai/realtime-api-beta";
import React, { useCallback, useRef, useState } from "react";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";

interface SimliOpenAIProps {
  simli_faceid: string;
  openai_voice: "alloy"|"ash"|"ballad"|"coral"|"echo"|"sage"|"shimmer"|"verse";
  openai_model: string;
  initialPrompt: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
}

const simliClient = new SimliClient();

const SimliOpenAI: React.FC<SimliOpenAIProps> = ({
  simli_faceid,
  openai_voice,
  openai_model,
  initialPrompt,
  onStart,
  onClose,
  showDottedFace,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [userMessage, setUserMessage] = useState("...");

  // Refs for various components and states
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const openAIClientRef = useRef<RealtimeClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isFirstRun = useRef(true);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const isIntentionalDisconnect = useRef(false);

  // New refs for managing audio chunk delay
  const audioChunkQueueRef = useRef<Int16Array[]>([]);
  const isProcessingChunkRef = useRef(false);
  
  // Retry counter for Simli connection
  const simliRetryCount = useRef(0);
  const MAX_SIMLI_RETRIES = 3;

  /**
   * Initializes the Simli client with the provided configuration.
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        maxSessionLength: 6000, // in seconds
        maxIdleTime: 6000, // in seconds
        videoRef: videoRef.current,
        audioRef: audioRef.current,
        enableConsoleLogs: true,
        onVideoStream: (stream: MediaStream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            // Switch to a 4px dot cursor while the Simli video is playing
            try {
              if (typeof document !== 'undefined') {
                document.body.classList.add('simli-cursor-dot');
              }
            } catch {}
          }
        }
      };

      simliClient.Initialize(SimliConfig as any);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  /**
   * Initializes the OpenAI client with WebRTC and tool calling capabilities.
   */
  const initializeOpenAIClient = useCallback(async () => {
    try {
      console.log("Initializing OpenAI client...");
      
      // Create WebRTC connection
      const peerConnection = new RTCPeerConnection();
      
      // Create data channel for tool calling
      const dataChannel = peerConnection.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      // Configure session
      const configureSession = () => {
        const event = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            // Enable semantic audio handling from OpenAI side
            turn_detection: {
              type: 'server_vad',
              threshold: 0.75,
              silence_duration_ms: 900,
            },
            input_audio_transcription: {
              model: 'gpt-4o-mini-transcribe'
            }
          },
        };
        dataChannel.send(JSON.stringify(event));
      };

      // Set up data channel event handlers
      dataChannel.onopen = () => {
        console.log('Data channel opened');
        configureSession();
        
        // Send initial greeting message after session is configured
        setTimeout(() => {
          // Trigger model response (greeting will be generated from instructions)
          dataChannel.send(JSON.stringify({
            type: 'response.create',
            response: {
              modalities: ['text', 'audio']
            }
          }));
        }, 500);
      };

      dataChannel.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        // Log messages for debugging
        console.log('Data channel message:', msg.type);
      };

      // Set up audio handling for OpenAI response
      peerConnection.ontrack = (event: RTCTrackEvent) => {
        if (audioRef.current) {
          const audioStream = event.streams[0];
          
          // Convert the audio stream to audio data for Simli
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const source = audioContext.createMediaStreamSource(audioStream);
          const processor = audioContext.createScriptProcessor(1024, 1, 1);

          // Accumulate samples and emit fixed 20ms frames at 16kHz (320 samples)
          const FRAME_SIZE_SAMPLES = 320; // 20ms at 16kHz
          let accumulator = new Int16Array(0);

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const converted = new Int16Array(inputData.length);

            // Convert Float32 [-1,1] to PCM16
            for (let i = 0; i < inputData.length; i++) {
              let s = inputData[i];
              if (s > 1) s = 1;
              else if (s < -1) s = -1;
              converted[i] = (s * 32767) | 0;
            }

            // Append to accumulator
            const merged = new Int16Array(accumulator.length + converted.length);
            merged.set(accumulator, 0);
            merged.set(converted, accumulator.length);
            accumulator = merged;

            // Emit fixed-size frames
            while (accumulator.length >= FRAME_SIZE_SAMPLES) {
              const frame = accumulator.subarray(0, FRAME_SIZE_SAMPLES);
              const remainder = accumulator.subarray(FRAME_SIZE_SAMPLES);
              accumulator = new Int16Array(remainder.length);
              accumulator.set(remainder, 0);

              // Serialize as little-endian PCM16
              const bytes = new Uint8Array(FRAME_SIZE_SAMPLES * 2);
              const view = new DataView(bytes.buffer);
              for (let i = 0; i < FRAME_SIZE_SAMPLES; i++) {
                view.setInt16(i * 2, frame[i], true);
              }
              simliClient.sendAudioData(bytes);
            }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);
        }
      };

      // Get microphone access and add to peer connection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => {
        peerConnection.addTransceiver(track, { direction: 'sendrecv' });
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Get session token
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openai_model,
          instructions: initialPrompt,
          voice: openai_voice,
        }),
      });
      const data = await response.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Connect to OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const answerResponse = await fetch(`${baseUrl}?model=${openai_model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });
      const answer = await answerResponse.text();
      await peerConnection.setRemoteDescription({
        sdp: answer,
        type: 'answer',
      });

      setIsAvatarVisible(true);
      setIsRecording(true);
    } catch (error: any) {
      console.error("Error initializing OpenAI client:", error);
      setError(`Failed to initialize OpenAI client: ${error.message}`);
    }
  }, [initialPrompt, openai_model, openai_voice]);

  /**
   * Handles conversation updates, including user and assistant messages.
   */
  const handleConversationUpdate = useCallback((event: any) => {
    console.log("Conversation updated:", event);
    const { item, delta } = event;

    if (item.type === "message" && item.role === "assistant") {
      console.log("Assistant message detected");
      if (delta && delta.audio) {
        const downsampledAudio = downsampleAudio(delta.audio, 24000, 16000);
        audioChunkQueueRef.current.push(downsampledAudio);
        if (!isProcessingChunkRef.current) {
          processNextAudioChunk();
        }
      }
    } else if (item.type === "message" && item.role === "user") {
      setUserMessage(item.content[0].transcript);
    }
  }, []);

  /**
   * Handles interruptions in the conversation flow.
   */
  const interruptConversation = () => {
    console.warn("User interrupted the conversation");
    simliClient?.ClearBuffer();
    openAIClientRef.current?.cancelResponse("");
  };

  /**
   * Processes the next audio chunk in the queue.
   */
  const processNextAudioChunk = useCallback(() => {
    if (
      audioChunkQueueRef.current.length > 0 &&
      !isProcessingChunkRef.current
    ) {
      isProcessingChunkRef.current = true;
      const audioChunk = audioChunkQueueRef.current.shift();
      if (audioChunk) {
        const chunkDurationMs = (audioChunk.length / 16000) * 1000; // Calculate chunk duration in milliseconds

        // Send audio chunks to Simli immediately
        simliClient?.sendAudioData(audioChunk as any);
        console.log(
          "Sent audio chunk to Simli:",
          chunkDurationMs,
          "Duration:",
          chunkDurationMs.toFixed(2),
          "ms"
        );
        isProcessingChunkRef.current = false;
        processNextAudioChunk();
      }
    }
  }, []);

  /**
   * Handles the end of user speech.
   */
  const handleSpeechStopped = useCallback((event: any) => {
    console.log("Speech stopped event received", event);
  }, []);

  /**
   * Applies a simple low-pass filter to prevent aliasing of audio
   */
  const applyLowPassFilter = (
    data: Int16Array,
    cutoffFreq: number,
    sampleRate: number
  ): Int16Array => {
    // Simple FIR filter coefficients
    const numberOfTaps = 31; // Should be odd
    const coefficients = new Float32Array(numberOfTaps);
    const fc = cutoffFreq / sampleRate;
    const middle = (numberOfTaps - 1) / 2;

    // Generate windowed sinc filter
    for (let i = 0; i < numberOfTaps; i++) {
      if (i === middle) {
        coefficients[i] = 2 * Math.PI * fc;
      } else {
        const x = 2 * Math.PI * fc * (i - middle);
        coefficients[i] = Math.sin(x) / (i - middle);
      }
      // Apply Hamming window
      coefficients[i] *=
        0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (numberOfTaps - 1));
    }

    // Normalize coefficients
    const sum = coefficients.reduce((acc, val) => acc + val, 0);
    coefficients.forEach((_, i) => (coefficients[i] /= sum));

    // Apply filter
    const result = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < numberOfTaps; j++) {
        const idx = i - j + middle;
        if (idx >= 0 && idx < data.length) {
          sum += coefficients[j] * data[idx];
        }
      }
      result[i] = Math.round(sum);
    }

    return result;
  };

  /**
   * Downsamples audio data from one sample rate to another using linear interpolation
   * and anti-aliasing filter.
   *
   * @param audioData - Input audio data as Int16Array
   * @param inputSampleRate - Original sampling rate in Hz
   * @param outputSampleRate - Target sampling rate in Hz
   * @returns Downsampled audio data as Int16Array
   */
  const downsampleAudio = (
    audioData: Int16Array,
    inputSampleRate: number,
    outputSampleRate: number
  ): Int16Array => {
    if (inputSampleRate === outputSampleRate) {
      return audioData;
    }

    if (inputSampleRate < outputSampleRate) {
      throw new Error("Upsampling is not supported");
    }

    // Apply low-pass filter to prevent aliasing
    // Cut off at slightly less than the Nyquist frequency of the target sample rate
    const filteredData = applyLowPassFilter(
      audioData,
      outputSampleRate * 0.60, // Slight margin below Nyquist frequency
      inputSampleRate
    );

    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.floor(audioData.length / ratio);
    const result = new Int16Array(newLength);

    // Linear interpolation
    for (let i = 0; i < newLength; i++) {
      const position = i * ratio;
      const index = Math.floor(position);
      const fraction = position - index;

      if (index + 1 < filteredData.length) {
        const a = filteredData[index];
        const b = filteredData[index + 1];
        result[i] = Math.round(a + fraction * (b - a));
      } else {
        result[i] = filteredData[index];
      }
    }

    return result;
  };

  /**
   * Stops audio recording from the user's microphone
   */
  const stopRecording = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    setIsRecording(false);
    console.log("Audio recording stopped");
  }, []);

  /**
   * Builds the redirect URL with all current URL parameters
   * This ensures that when redirecting to /audio page, all interview parameters
   * (candidateId, name, position, etc.) are preserved for continuity
   * 
   * Note: The /audio page should handle the same interview flow but without video,
   * using only audio communication with OpenAI's realtime API
   */
  const buildRedirectUrl = useCallback((path: string) => {
    // Get current URL parameters
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    
    // Build new URL with all parameters
    const redirectUrl = `${path}?${params.toString()}`;
    return redirectUrl;
  }, []);

  /**
   * Handles the start of the interaction, initializing clients and starting recording.
   */
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    isIntentionalDisconnect.current = false; // Reset the flag when starting
    onStart();
    // Apply 4px dot cursor immediately on Başla click
    try {
      if (typeof document !== 'undefined') {
        document.body.classList.add('simli-cursor-dot');
      }
    } catch {}

    try {
      console.log('========================================');
      console.log(`SIMLI CONNECTION ATTEMPT ${simliRetryCount.current + 1}/${MAX_SIMLI_RETRIES}`);
      console.log('========================================');
      
      initializeSimliClient();
      
      // Add timeout for Simli start
      const startTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Simli connection timeout')), 10000);
      });
      
      await Promise.race([
        simliClient?.start(),
        startTimeout
      ]);
      
      eventListenerSimli();
      
      // Reset retry counter on successful connection
      simliRetryCount.current = 0;
      console.log("✅ Simli connection successful");
      console.log('========================================');
    } catch (error: any) {
      console.error("❌ Connection Error:", error.message || error);
      console.error("Error Details:", error);
      simliRetryCount.current++;
      
      if (simliRetryCount.current >= MAX_SIMLI_RETRIES) {
        console.error('========================================');
        console.error(`❌ SIMLI CONNECTION FAILED AFTER ${MAX_SIMLI_RETRIES} ATTEMPTS`);
        console.error('========================================');
        console.log("🔄 REDIRECTING TO AUDIO-ONLY MODE...");
        
        // Build redirect URL with all current parameters
        const audioPageUrl = buildRedirectUrl('/audio');
        console.log("📍 Audio Page URL:", audioPageUrl);
        
        // Get all parameters for logging
        const currentUrl = new URL(window.location.href);
        const params = Object.fromEntries(currentUrl.searchParams.entries());
        console.log("📋 Preserved Parameters:", params);
        
        setError(`Video connection failed after ${MAX_SIMLI_RETRIES} attempts. Redirecting to audio-only mode in 2 seconds...`);
        
        // Redirect after a short delay to show the error message
        setTimeout(() => {
          console.log("➡️ Redirecting now to:", audioPageUrl);
          window.location.href = audioPageUrl;
        }, 2000);
      } else {
        console.log(`⚠️ Connection failed. Will retry in 2 seconds...`);
        setError(`Connection failed (Attempt ${simliRetryCount.current}/${MAX_SIMLI_RETRIES}). Retrying in 2 seconds...`);
        
        // Retry after a delay
        setTimeout(() => {
          console.log(`🔁 Initiating retry ${simliRetryCount.current + 1}/${MAX_SIMLI_RETRIES}...`);
          handleStart(); // Recursive retry
        }, 2000);
      }
    } finally {
      if (simliRetryCount.current === 0) {
        // Only set these if connection was successful
        setIsAvatarVisible(true);
        setIsLoading(false);
      }
    }
  }, [onStart, buildRedirectUrl]);

  /**
   * Handles stopping the interaction, cleaning up resources and resetting states.
   */
  const handleStop = useCallback(() => {
    console.log("Stopping interaction...");
    isIntentionalDisconnect.current = true; // Mark as intentional disconnect
    setIsLoading(false);
    setError("");
    
    // Reset retry counter
    simliRetryCount.current = 0;
    
    // Stop recording and clear audio buffers
    stopRecording();
    
    // Clear Simli client buffers and close connection
    simliClient?.ClearBuffer();
    simliClient?.close();
    
    // Close OpenAI client and WebSocket connection
    if (openAIClientRef.current) {
      openAIClientRef.current.disconnect();
      openAIClientRef.current = null;
    }
    
    // Close audio context and clean up audio resources
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Clear audio chunk queue
    audioChunkQueueRef.current = [];
    isProcessingChunkRef.current = false;
    
    // Reset states
    setIsAvatarVisible(false);
    setIsRecording(false);
    setUserMessage("...");
    
    // Reset video and audio elements
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    
    // Close data channel if it exists
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    // Restore default cursor when session stops
    try {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('simli-cursor-dot');
      }
    } catch {}
    
    // Call onClose callback
    onClose();
    console.log("Interaction stopped and all resources cleaned up");
    
    // Only reload if it was an intentional disconnect
    if (isIntentionalDisconnect.current) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [stopRecording, onClose]);

  /**
   * Simli Event listeners
   */
  const eventListenerSimli = useCallback(() => {
    if (simliClient) {
      simliClient?.on("connected", () => {
        console.log("SimliClient connected");
        // Initialize OpenAI client
        initializeOpenAIClient();
      });

      simliClient?.on("disconnected", () => {
        console.log("SimliClient disconnected");
        // Ensure custom cursor is removed on disconnect
        try {
          if (typeof document !== 'undefined') {
            document.body.classList.remove('simli-cursor-dot');
          }
        } catch {}
        openAIClientRef.current?.disconnect();
        if (audioContextRef.current) {
          audioContextRef.current?.close();
        }
        
        // If it was an unexpected disconnection, trigger restart
        if (!isIntentionalDisconnect.current) {
          console.log("Unexpected disconnection detected, triggering restart...");
          handleStop();
          setTimeout(() => {
            handleStart();
          }, 1000);
        }
      });
    }
  }, [handleStart, handleStop]);

  return (
    <>
      <div className="flex flex-col items-center">
        {!isAvatarVisible ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={cn(
              "w-full h-[52px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-[100px] bg-simliblue text-white py-3 px-6 rounded-[100px] transition-all duration-300 hover:text-black hover:bg-white hover:rounded-sm",
              "flex justify-center items-center"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="font-abc-repro-mono font-bold w-[164px]">
                Başla
              </span>
            )}
          </button>
        ) : (
          <>
            <div className="flex items-center gap-4 w-full">
              <button
                onClick={handleStop}
                className={cn(
                  "mt-4 group text-white flex-grow bg-red hover:rounded-sm hover:bg-white h-[52px] px-6 rounded-[100px] transition-all duration-300"
                )}
              >
                <span className="font-abc-repro-mono group-hover:text-black font-bold w-[164px] transition-all duration-300">
                  Stop
                </span>
              </button>
            </div>
          </>
        )}
      </div>
      <div
className={`transition-all duration-300 w-full ${
  showDottedFace
    ? "h-0 overflow-hidden"
    : "fixed bottom-44 left-0 right-0 h-[calc(100vh-150px)]"
}`}
      >
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
    </>
  );
};

export default SimliOpenAI;
