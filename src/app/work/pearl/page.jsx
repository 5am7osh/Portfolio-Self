"use client"; // Required for state management and interactive galleries

import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { Warp } from "@paper-design/shaders-react";

// Import your 21st.dev components here once installed
import { CircularGallery } from "@/components/ui/circular-gallery";
import { BlurTextAnimation } from "@/components/ui/blur-text-animation";
import SphereImageGrid from "@/components/ui/sphere-image-grid";

// 1. Data Payload for B2C (Consumer Flow)
const b2cScreens = [
  {
    id: 1,
    image: "/Screenshot 2026-06-23 105651.png",
    description: "Zero-latency geolocation search. Users filter high-ticket services by specialty and location in milliseconds."
  },
  {
    id: 2,
    image: "/Screenshot 2026-06-23 104306.png",
    description: "Dynamic venue routing. Displaying top-rated spaces and filtering by real-time localized availability."
  },
  {
    id: 3,
    image: "/Screenshot 2026-06-23 104322.png",
    description: "Variable duration service mapping. Complex treatments are priced and timed accurately without page reloads."
  },
  {
    id: 4,
    image: "/Screenshot 2026-06-23 104347.png",
    description: "Contextual staff profiles. Specialized aesthetician data loads instantly via optimistic UI within a localized modal."
  },
  {
    id: 5,
    image: "/Screenshot 2026-06-23 104404.png",
    description: "Overlapping calendar state management. Available time slots adapt instantly to the selected professional and service duration."
  },
  {
    id: 6,
    image: "/Screenshot 2026-06-23 104552.png",
    description: "Frictionless authentication. OTP and social auth designed to make account creation feel completely invisible."
  },
  {
    id: 7,
    image: "/Screenshot 2026-06-23 104413.png",
    description: "Instant transaction confirmation. The architecture finalizes the booking and triggers automated WhatsApp confirmations."
  },
  {
    id: 8,
    image: "/Screenshot 2026-06-23 104425.png",
    description: "Client activity portal. A centralized dashboard for users to manage, reschedule, or cancel upcoming appointments."
  }
];

// 2. Data Payload for B2B (SaaS Dashboard)
const b2bScreens = [
  { src: "/Screenshot 2026-06-23 104443.png", title: "The elevated B2B landing page" },
  { src: "/Screenshot 2026-06-23 104451.png", title: "Venue & Space Management" },
  { src: "/Screenshot 2026-06-23 104504.png", title: "Service Menu Builder & Pricing Logic" },
  { src: "/Screenshot 2026-06-23 104512.png", title: "Master Calendar Engine & Staff Routing" },
  { src: "/Screenshot 2026-06-23 104522.png", title: "Financial Analytics & Revenue Tracking" },
  { src: "/Screenshot 2026-06-23 104532.png", title: "Secure Workspace Authentication" }
];

export default function PearlCaseStudy() {
  // State to track the currently hovered B2C image text
  const [activeB2CText, setActiveB2CText] = useState("Interact with the portal to explore the consumer architecture.");

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-black selection:text-white pb-32">

      {/* 1. Monolithic Hero */}
      <section className="relative w-full h-screen overflow-hidden bg-white">

        {/* Layer 2: The Shader masked to the text */}
        <div className="absolute inset-0 z-10 pointer-events-none mix-blend-multiply" style={{ isolation: 'isolate' }}>

          {/* The Shader Canvas */}
          <div className="absolute inset-0 z-0">
            <Warp
              style={{ height: "100%", width: "100%" }}
              proportion={0.45}
              softness={1}
              distortion={0.25}
              swirl={0.8}
              swirlIterations={10}
              shape="checks"
              shapeScale={0.1}
              scale={1}
              rotation={0}
              speed={1}
              colors={["#3ba93bff", "#164d16ff", "#0d690dff", "#042804ff"]}
            />
          </div>

          {/* The Mask Layer: White background, Black text -> mix-blend-screen -> Canvas inside text, White outside text */}
          <div className="absolute inset-0 bg-white mix-blend-screen flex items-center justify-center z-10">
            <div className="relative inline-block mt-20">
              <h1 className="text-[18vw] leading-none font-black tracking-tighter uppercase text-black">
                PEARL
              </h1>
            </div>
          </div>

        </div>

      </section>

      {/* 2. The Engineering Brief */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-500 mb-4">The Objective</p>
          <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight">
            Eliminate booking friction for high-ticket services.
          </h2>
        </div>
        <div className="md:col-span-1" />
        <div className="md:col-span-7 flex flex-col gap-8 text-lg text-zinc-600">
          <p>
            Standard scheduling software feels cheap. When a client is booking a premium service, the digital infrastructure handling that transaction must reflect the same level of care and precision as the service itself.
          </p>
          <p>
            Pearl was engineered from the ground up to handle complex calendar logic, staff routing, and variable duration services within a flawless, zero-latency light mode environment.
          </p>
        </div>
      </section>

      {/* --- SECTION 1: B2C CONSUMER FLOW (Circular Gallery) --- */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-12 md:py-32 flex flex-col items-center">

        {/* Section Header */}
        <div className="w-full mb-16 flex flex-col items-center text-center">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-400 mb-4">The Consumer Interface</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-black">
            Frictionless Booking.
          </h2>
        </div>

        {/* Circular Gallery Container */}
        <div className="w-full h-[280px] md:h-[600px] relative flex items-center justify-center">
          {/* 
            IMPLEMENTATION NOTE: 
            Pass a callback to the CircularGallery component so when an item is hovered, 
            it updates the setActiveB2CText state with the correct description.
          */}
          <CircularGallery
            items={b2cScreens}
            onItemHover={(item) => setActiveB2CText(item.description)}
          />
        </div>

        {/* Dynamic Explanatory Text Panel */}
        <div className="min-h-[80px] mb-12 md:mb-40 flex items-center justify-center max-w-2xl text-center overflow-visible mx-auto px-4">
          <BlurTextAnimation text={activeB2CText} />
        </div>
      </section>

      {/* --- SECTION 2: B2B SAAS INFRASTRUCTURE (3D Gallery) --- */}
      <section className="relative w-full py-32 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">

          {/* Section Header */}
          <div className="w-full mb-16 flex flex-col items-center text-center">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-400 mb-4">The Business Logic</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-black">
              Ruthless State Management.
            </h2>
            <p className="max-w-2xl mt-6 text-lg text-zinc-500">
              The backend architecture managing overlapping staff schedules, variable service durations, and localized pricing tiers.
            </p>
          </div>

          {/* Sphere Image Grid Container */}
          <div className="w-full relative flex items-center justify-center">
            <SphereImageGrid 
              images={Array.from({ length: 15 }).map((_, i) => {
                const screen = b2bScreens[i % b2bScreens.length];
                return {
                  id: `b2b-${i}`,
                  src: screen.src,
                  alt: screen.title,
                  title: screen.title,
                  description: "Deep dive into the architectural mechanics behind the business logic."
                };
              })}
              containerSize={900}
              sphereRadius={400}
              autoRotate={true}
              autoRotateSpeed={0.3}
              dragSensitivity={0.5}
            />
          </div>

        </div>
      </section>

    </main>
  );
}
