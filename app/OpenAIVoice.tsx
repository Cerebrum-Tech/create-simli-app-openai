"use client";
import IconSparkleLoader from "@/media/IconSparkleLoader";
import React, { useCallback, useRef, useState } from "react";
import VoiceEqualizer from "./Components/VoiceEqualizer";
import cn from "./utils/TailwindMergeAndClsx";

interface OpenAIVoiceProps {
  openai_voice: "alloy"|"ash"|"ballad"|"coral"|"echo"|"sage"|"shimmer"|"verse";
  openai_model: string;
  initialPrompt: string;
  onStart: () => void;
  onClose: () => void;
  showAnimation: boolean;
  candidateId: string;
}

// Tool functions (same as in SimliOpenAI)
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
  endSession: async (candidateId: string, interviewNotes: string, interviewScore: number) => {
    try {
      console.log('========================================');
      console.log('ENDING SESSION - API CALL DETAILS');
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
      
      if (!apiResponse.ok) {
        console.error(`❌ Failed to update interview results: ${apiResponse.status} ${apiResponse.statusText}`);
        const errorText = await apiResponse.text().catch(() => 'Could not read error response');
        console.error('Error Response Body:', errorText);
      } else {
        console.log('✅ Interview results updated successfully');
        const responseText = await apiResponse.text();
        console.log('Raw Response Body:', responseText);
        
        try {
          const responseData = JSON.parse(responseText);
          console.log('Parsed Response Data:', JSON.stringify(responseData, null, 2));
        } catch (parseError) {
          console.log('Response is not JSON format');
        }
      }
      console.log('========================================');
    } catch (error) {
      console.error('========================================');
      console.error('❌ ERROR DURING API CALL');
      console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : String(error));
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace available');
      console.error('========================================');
    }

    // Proceed with redirect
    const baseRedirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || "https://havelsan.unicevap.com";
    const redirectUrl = `${baseRedirectUrl}?candidateId=${encodeURIComponent(candidateId)}`;
    console.log('----------------------------------------');
    console.log('REDIRECT CONFIGURATION');
    console.log('Base Redirect URL:', baseRedirectUrl);
    console.log('Full Redirect URL:', redirectUrl);
    console.log('Redirect Delay: 30 seconds');
    console.log('========================================');
    
    setTimeout(() => {
      console.log('Redirecting now to:', redirectUrl);
      window.location.href = redirectUrl;
    }, 30000); // 30 seconds delay
    
    return { 
      success: true, 
      message: `Session ended successfully. Interview results have been saved. You will be redirected in 30 seconds...` 
    };
  }
};

const OpenAIVoice: React.FC<OpenAIVoiceProps> = ({
  openai_voice,
  openai_model,
  initialPrompt,
  onStart,
  onClose,
  showAnimation,
  candidateId,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [userMessage, setUserMessage] = useState("...");
  const [assistantMessage, setAssistantMessage] = useState("");

  // Refs for WebRTC and audio
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isIntentionalDisconnect = useRef(false);

  /**
   * Initializes the OpenAI WebRTC connection for voice interaction
   */
  const initializeOpenAIVoice = useCallback(async () => {
    try {
      console.log("Initializing OpenAI Voice client...");
      
      // Create WebRTC connection
      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;
      
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
                name: 'endSession',
                description: 'Ends the conversation session when the interview or conversation is complete. Call this when the user says goodbye, the interview is finished, or when all questions have been answered and the conversation has naturally concluded. You MUST provide an evaluation of the interview.',
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
        
        // Handle text transcription
        if (msg.type === 'conversation.item.created' || msg.type === 'conversation.item.updated') {
          if (msg.item?.role === 'user' && msg.item?.formatted?.transcript) {
            setUserMessage(msg.item.formatted.transcript);
          } else if (msg.item?.role === 'assistant' && msg.item?.formatted?.transcript) {
            setAssistantMessage(msg.item.formatted.transcript);
          }
        }
        
        // Handle function calls
        if (msg.type === 'response.function_call_arguments.done') {
          console.log(`[Tool Call] Calling function ${msg.name} with arguments:`, msg.arguments);
          const args = JSON.parse(msg.arguments);
          
          let result;
          if (msg.name === 'endSession') {
            const { interviewNotes, interviewScore } = args;
            result = await toolFunctions.endSession(candidateId, interviewNotes, interviewScore);
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
        console.log("Received audio track from OpenAI");
        const audioStream = event.streams[0];
        
        // Create audio element to play the assistant's voice
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
          audioElementRef.current.autoplay = true;
        }
        audioElementRef.current.srcObject = audioStream;
        
        // Also setup audio context for visualization
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        }
        
        // Create audio source for visualization
        if (audioContextRef.current && audioStream) {
          audioSourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
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

      setIsSessionActive(true);
      setIsRecording(true);
      console.log("OpenAI Voice connection established");
    } catch (error: any) {
      console.error("Error initializing OpenAI Voice client:", error);
      setError(`Failed to initialize voice client: ${error.message}`);
      throw error;
    }
  }, [initialPrompt, openai_model, openai_voice, candidateId]);

  /**
   * Handles starting the voice interaction
   */
  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError("");
    isIntentionalDisconnect.current = false;
    onStart();

    try {
      console.log("Starting voice session...");
      await initializeOpenAIVoice();
    } catch (error: any) {
      console.error("Error starting voice session:", error);
      setError(`Error starting voice session: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [onStart, initializeOpenAIVoice]);

  /**
   * Handles stopping the voice interaction
   */
  const handleStop = useCallback(() => {
    console.log("Stopping voice session...");
    isIntentionalDisconnect.current = true;
    setIsLoading(false);
    setError("");
    
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop audio playback
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    
    // Reset states
    setIsSessionActive(false);
    setIsRecording(false);
    setUserMessage("...");
    setAssistantMessage("");
    
    onClose();
    console.log("Voice session stopped");
    
    // Reload page after intentional disconnect
    if (isIntentionalDisconnect.current) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [onClose]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Voice Equalizer Animation */}
      {showAnimation && (
        <div className="w-full h-[300px] bg-white rounded-xl p-4 flex items-center justify-center">
          <VoiceEqualizer 
            isActive={isSessionActive}
            audioContext={audioContextRef.current}
            audioSource={audioSourceRef.current}
            className="w-full h-full"
          />
        </div>
      )}
      
    
      
      {/* Control Button */}
      {!isSessionActive && (
        <div className="flex flex-col items-center">
          <button
            onClick={handleStart}
            disabled={isLoading}
            className={cn(
              "w-full h-[52px] mt-4 disabled:bg-[#343434] disabled:text-white disabled:hover:rounded-[100px] bg-simliblue text-white py-3 px-6 rounded-[100px] transition-all duration-300 hover:text-black hover:bg-white hover:rounded-sm",
              "flex justify-center items-center min-w-[200px]"
            )}
          >
            {isLoading ? (
              <IconSparkleLoader className="h-[20px] animate-loader" />
            ) : (
              <span className="font-abc-repro-mono font-bold">
                Başlat
              </span>
            )}
          </button>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span></span>
        </div>
      )}
    </div>
  );
};

export default OpenAIVoice;
