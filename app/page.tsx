"use client";
import React, { use, useEffect, useState } from "react";
import SimliOpenAI from "./SimliOpenAI";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";

interface avatarSettings {
  name: string;
  openai_voice: "alloy"|"ash"|"ballad"|"coral"|"echo"|"sage"|"shimmer"|"verse";
  openai_model: string;
  simli_faceid: string;
  initialPrompt: string;
}

// Customize your avatar here
const avatar: avatarSettings = {
  name: "Ong",
  openai_voice: "shimmer",
  openai_model: "gpt-4o-realtime-preview-2024-12-17", // Use "gpt-4o-mini-realtime-preview-2024-12-17" for cheaper and faster responses
  simli_faceid: "d80690a1-e554-4e25-9415-de6505f61e67",
  initialPrompt:
    `You are a helpful AI assistant named Cere. chat with me like a friend. give very short answers. You work for the Cerebrum Tech. Make tool calls if necessary.

  use tool calls as knowledge base.
     
`,
};

const Demo: React.FC = () => {
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  const onClose = () => {
    console.log("Setting setshowDottedface to true...");
    setShowDottedFace(true);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center font-abc-repro font-normal text-sm text-black p-8">
      <Navbar />
      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
        <div>
          {showDottedFace && (
            <div className="flex justify-center p-32">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-[500px] h-auto"
              >
                <source src="/loop2.mp4" type="video/mp4" />
              </video>
            </div>
          )}
          <SimliOpenAI
            openai_voice={avatar.openai_voice}
            openai_model={avatar.openai_model}
            simli_faceid={avatar.simli_faceid}
            initialPrompt={avatar.initialPrompt}
            onStart={onStart}
            onClose={onClose}
            showDottedFace={showDottedFace}
          />
        </div>
      </div>
    </div>
  );
};

export default Demo;
