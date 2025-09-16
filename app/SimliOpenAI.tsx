import IconSparkleLoader from "@/media/IconSparkleLoader";
import { RealtimeClient } from "@openai/realtime-api-beta";
import React, { useCallback, useRef, useState } from "react";
import { SimliClient } from "simli-client";
import VideoBox from "./Components/VideoBox";
import cn from "./utils/TailwindMergeAndClsx";
import { getJson } from "serpapi";

interface SimliOpenAIProps {
  simli_faceid: string;
  openai_voice: "alloy"|"ash"|"ballad"|"coral"|"echo"|"sage"|"shimmer"|"verse";
  openai_model: string;
  initialPrompt: string;
  onStart: () => void;
  onClose: () => void;
  showDottedFace: boolean;
  candidateId: string;
}

const simliClient = new SimliClient();

// Example tool functions
const toolFunctions = {
  getCurrentTime: () => {
    return { success: true, time: new Date().toLocaleTimeString() };
  },
  searchGoogle: async ({ query }: { query: string }) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching Google:", error);
      return { success: false, error: "Failed to search Google" };
    }
  },
  submitEvaluation: async (candidateId: string, interviewNotes: string, interviewScore: number) => {
    try {
      // Log the parameters being sent
      console.log('========================================');
      console.log('SUBMITTING EVALUATION - API CALL DETAILS');
      console.log('========================================');
      console.log('Request Parameters:');
      console.log('- Candidate ID:', candidateId);
      console.log('- Interview Score:', interviewScore);
      console.log('- Interview Notes:', interviewNotes);
      console.log('----------------------------------------');
      
      const requestBody = {
        candidateId: Number(candidateId),
        interviewNotes: interviewNotes,
        interviewScore: Number(interviewScore)
      };
      
      console.log('Full Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('API Endpoint:', 'https://havelsanapi.havelsanyetenekkapsulu.com/candidates/update-interview-results');
      console.log('----------------------------------------');
      
      // Update interview results via API
      console.log('Sending request to API...');
      
      const apiResponse = await fetch('https://havelsanapi.havelsanyetenekkapsulu.com/candidates/update-interview-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('----------------------------------------');
      console.log('API Response Status:', apiResponse.status);
      console.log('API Response Status Text:', apiResponse.statusText);
      console.log('API Response Headers:', Object.fromEntries(apiResponse.headers.entries()));
      
      if (!apiResponse.ok) {
        console.error(`❌ Failed to update interview results: ${apiResponse.status} ${apiResponse.statusText}`);
        // Try to get error details from response body
        const errorText = await apiResponse.text().catch(() => 'Could not read error response');
        console.error('Error Response Body:', errorText);
        console.log('========================================');
        return { 
          success: false, 
          message: `Değerlendirme kaydedilemedi. Lütfen tekrar deneyin.` 
        };
      } else {
        console.log('✅ Interview results updated successfully');
        const responseText = await apiResponse.text();
        console.log('Raw Response Body:', responseText);
        
        // Try to parse as JSON if possible
        try {
          const responseData = JSON.parse(responseText);
          console.log('Parsed Response Data:', JSON.stringify(responseData, null, 2));
        } catch (parseError) {
          console.log('Response is not JSON format');
        }
      }
      console.log('========================================');
      return { 
        success: true, 
        message: `Değerlendirmeniz başarıyla kaydedildi. Teşekkür ederiz.` 
      };
    } catch (error) {
      console.error('========================================');
      console.error('❌ ERROR DURING API CALL');
      console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : String(error));
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace available');
      console.error('========================================');
      // Return error message
      return { 
        success: false, 
        message: `Değerlendirme kaydedilemedi. Teknik bir hata oluştu.` 
      };
    }
  },
  endSession: async (candidateId: string) => {
    // Log the redirect action
    console.log('========================================');
    console.log('ENDING SESSION - REDIRECT');
    console.log('========================================');
    console.log('Candidate ID:', candidateId);
    
    // Proceed with redirect
    const baseRedirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "https://havelsan.unicevap.com";
    // Append candidateId as a query parameter to the redirect URL
    const redirectUrl = `${baseRedirectUrl}?candidateId=${encodeURIComponent(candidateId)}`;
    console.log('Base Redirect URL:', baseRedirectUrl);
    console.log('Full Redirect URL:', redirectUrl);
    console.log('Redirect Delay: 30 seconds');
    console.log('========================================');
    
    // Navigate to configured URL after 30 seconds delay
    setTimeout(() => {
      console.log('Redirecting now to:', redirectUrl);
      window.location.href = redirectUrl;
    }, 10000); // 5 seconds delay
    
    return { 
      success: true, 
      message: `Mülakat tamamlandı. 5 saniye içinde yönlendirileceksiniz. İyi günler dilerim!` 
    };
  }
};

const SimliOpenAI: React.FC<SimliOpenAIProps> = ({
  simli_faceid,
  openai_voice,
  openai_model,
  initialPrompt,
  onStart,
  onClose,
  showDottedFace,
  candidateId,
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

      // Configure tools
      const configureTools = () => {
        const event = {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            tools: [
              {
                type: 'function',
                name: 'getCurrentTime',
                description: 'Gets the current time',
              },
              {
                type: 'function',
                name: 'searchGoogle',
                description: 'Searches Google for information about flight times, weather and other information',
                parameters: {
                  type: 'object',
                  properties: {
                    query: { 
                      type: 'string', 
                      description: 'The search query to look up on Google' 
                    },
                  },
                  required: ['query'],
                },
              },
              {
                type: 'function',
                name: 'submitEvaluation',
                description: 'Submits the interview evaluation with notes and score. Call this after completing the evaluation phase but before ending the session.',
                parameters: {
                  type: 'object',
                  properties: {
                    interviewNotes: {
                      type: 'string',
                      description: 'Detailed notes about the candidate\'s performance during the interview in Turkish. Include strengths, weaknesses, technical competencies, and soft skills assessment. Example: "Teknik yeterliliği yüksek, takım çalışmasına uyum sağlayabilir. İletişim becerileri geliştirilebilir."'
                    },
                    interviewScore: {
                      type: 'number',
                      description: 'Overall interview score from 0 to 100 based on the candidate\'s performance. Consider technical knowledge, communication skills, problem-solving ability, and overall fit for the position.'
                    }
                  },
                  required: ['interviewNotes', 'interviewScore']
                }
              },
              {
                type: 'function',
                name: 'endSession',
                description: 'Ends the conversation session and redirects the user. Only call this when the user explicitly says goodbye, thanks you, or uses farewell expressions like "güle güle", "teşekkürler", "iyi günler". NEVER call this automatically after evaluation.',
                parameters: {
                  type: 'object',
                  properties: {}
                }
              },
            ],
          },
        };
        dataChannel.send(JSON.stringify(event));
      };

      // Set up data channel event handlers
      dataChannel.onopen = () => {
        console.log('Data channel opened');
        configureTools();
        
        // Send initial greeting message after tools are configured
        setTimeout(() => {
          dataChannel.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'assistant',
              content: [{
                type: 'input_text',
                text: 'Merhaba, Teknofest HAVELSAN İnsan Kaynakları Yapay Zekâ Mülakat Simülasyonu\'na hoş geldiniz. Sizinle kısa bir mülakat yaparak hem sizi tanımak hem de gerçek bir mülakat deneyimi yaşatmak istiyoruz. Hazırsanız başlayabiliriz.'
              }]
            }
          }));
          
          // Request the AI to speak the greeting
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
        if (msg.type === 'response.function_call_arguments.done') {
          console.log(`[Tool Call] Calling function ${msg.name} with arguments:`, msg.arguments);
          const args = JSON.parse(msg.arguments);
          
          let result;
          // Handle each function with its specific signature
          if (msg.name === 'submitEvaluation') {
            // Extract interviewNotes and interviewScore from args
            const { interviewNotes, interviewScore } = args;
            result = await toolFunctions.submitEvaluation(candidateId, interviewNotes, interviewScore);
          } else if (msg.name === 'endSession') {
            // endSession only needs candidateId
            result = await toolFunctions.endSession(candidateId);
          } else if (msg.name === 'searchGoogle') {
            result = await toolFunctions.searchGoogle(args);
          } else if (msg.name === 'getCurrentTime') {
            result = toolFunctions.getCurrentTime();
          } else {
            console.error(`Unknown function: ${msg.name}`);
            result = { success: false, error: `Unknown function: ${msg.name}` };
          }
          
          console.log(`[Tool Response] Function ${msg.name} returned:`, result);
          
          // Send function result back to OpenAI
          dataChannel.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: msg.call_id,
              output: JSON.stringify(result),
            },
          }));
          
          // Request next response
          dataChannel.send(JSON.stringify({ type: "response.create" }));
        }
      };

      // Set up audio handling for OpenAI response
      peerConnection.ontrack = (event: RTCTrackEvent) => {
        if (audioRef.current) {
          const audioStream = event.streams[0];
          
          // Convert the audio stream to audio data for Simli
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const source = audioContext.createMediaStreamSource(audioStream);
          const processor = audioContext.createScriptProcessor(1024, 1, 1);
          
          // Create a buffer to accumulate audio data
          const audioBuffer: Int16Array[] = [];
          let lastProcessTime = 0;
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const audioData = new Int16Array(inputData.length);
            
            // Convert float32 to int16
            for (let i = 0; i < inputData.length; i++) {
              const sample = Math.max(-1, Math.min(1, inputData[i]));
              audioData[i] = Math.floor(sample * 32767);
            }
            
            // Add to buffer
            audioBuffer.push(audioData);
            
            // Process buffer every 50ms to maintain sync
            const now = Date.now();
            if (now - lastProcessTime >= 50) {
              while (audioBuffer.length > 0) {
                const chunk = audioBuffer.shift();
                if (chunk) {
                  // Convert to Uint8Array for Simli
                  const uint8Array = new Uint8Array(chunk.buffer);
                  simliClient.sendAudioData(uint8Array);
                }
              }
              lastProcessTime = now;
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
  }, [initialPrompt, openai_model, openai_voice, candidateId]);

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
