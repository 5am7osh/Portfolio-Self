import Image from 'next/image';
import ShaderBackground from '@/components/ui/shader-background';
import { InteractiveProductCard } from '@/components/ui/interactive-product-card';
import InfiniteScrollGallery from '@/components/ui/infinite-scroll-gallery';

export default function LocalThreadCaseStudy() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-green-600 selection:text-white pb-32">
      
      {/* --- HERO SECTION (Stark Black + Kinetic Mask) --- */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
        
        {/* The Shader Canvas */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <ShaderBackground />
        </div>

        {/* The Mask Layer: Black background, White text -> mix-blend-multiply -> Canvas inside text, Black outside text */}
        <div className="absolute inset-0 bg-black mix-blend-multiply flex items-center justify-center z-10 pointer-events-none">
          <div className="w-full text-center mt-20 px-4">
            <h1 className="text-[11vw] leading-none font-black tracking-tighter uppercase text-white whitespace-nowrap">
              LOCALTHREAD
            </h1>
          </div>
        </div>

      </section>

      {/* --- THE ENGINEERING BRIEF --- */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/10">
        <div className="md:col-span-4">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-zinc-500 mb-4">The Objective</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Engineering hyper-local trust.
          </h2>
        </div>
        <div className="md:col-span-1" />
        <div className="md:col-span-7 flex flex-col gap-8 text-lg text-zinc-400">
          <p>
            Community platforms fail when the barrier to trust is higher than the utility of the network. LocalThread was engineered to solve the friction of the hyper-local gig economy—creating a secure, instantly accessible network for neighborhood skill-sharing and mutual help.
          </p>
          <p>
            The architecture relies on strict geolocation boundaries and a transparent reputation engine, transforming passive neighbors into an active, verified workforce.
          </p>
        </div>
      </section>

      {/* --- CHAPTER 01: THE TRUST ARCHITECTURE --- */}
      <section className="w-full max-w-7xl mx-auto px-6 py-32 flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2 flex flex-col items-start">
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-green-500 mb-4">Chapter 01</p>
          <h3 className="text-4xl font-black uppercase text-white mb-6 tracking-tighter">Community Trust Score</h3>
          <p className="text-zinc-400 text-lg">
            A neighborhood network is only as strong as its authentication. By implementing a response-rate tracking system and localized verification, users feel mathematically confident opening their doors to someone from the platform.
          </p>
        </div>
        
        {/* High-Contrast Interactive Card */}
        <div className="w-full md:w-1/2 relative flex justify-center">
          <InteractiveProductCard 
            imageUrl="/WhatsApp Image 2026-06-23 at 1.32.12 PM.jpeg"
            logoUrl=""
            title="LocalThread App"
            description="Neighborhood Requests"
            price="Verified"
          />
        </div>
      </section>

      {/* --- CHAPTER 02: THE REQUEST ENGINE --- */}
      <section className="w-full bg-black py-32 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="w-full md:w-1/2 flex flex-col items-start">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-green-500 mb-4">Chapter 02</p>
            <h3 className="text-4xl font-black uppercase text-white mb-6 tracking-tighter">Hyper-Local Needs</h3>
            <p className="text-zinc-400 text-lg">
              The core loop of the platform. We built a frictionless posting interface that instantly routes home repair, quick errands, and hands-on jobs strictly to users within the verified neighborhood radius. 
            </p>
          </div>
          
          {/* High-Contrast Interactive Card */}
          <div className="w-full md:w-1/2 relative flex justify-center">
            <InteractiveProductCard 
              imageUrl="/WhatsApp Image 2026-06-23 at 1.32.12 PM (4).jpeg"
              logoUrl=""
              title=""
              description=""
              price=""
            />
          </div>
        </div>
      </section>

      {/* --- CHAPTER 03: THE COMPLETE ECOSYSTEM --- */}
      <section className="w-full py-32 overflow-hidden bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-16">
          <div className="w-full max-w-3xl flex flex-col items-center text-center">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-green-500 mb-4">Chapter 03</p>
            <h3 className="text-4xl font-black uppercase text-white mb-6 tracking-tighter">The Complete Ecosystem</h3>
            <p className="text-zinc-400 text-lg">
              Because a hyper-local network spans a massive surface area—from public landing pages designed to convert neighborhood leaders to intricate event creation logic—stopping at just a few components leaves too much of the engineering hidden. Here is a look at the comprehensive ecosystem we built to bring the platform to life.
            </p>
          </div>
        </div>
          
        {/* Infinite Scroll Void Gallery */}
        <div className="w-full">
          <InfiniteScrollGallery images={[
            "/WhatsApp Image 2026-06-23 at 1.32.11 PM.jpeg",
            "/WhatsApp Image 2026-06-23 at 1.32.12 PM (4).jpeg",
            "/WhatsApp Image 2026-06-23 at 1.32.12 PM (3).jpeg",
            "/WhatsApp Image 2026-06-23 at 1.32.12 PM (6).jpeg"
          ]} />
        </div>
      </section>

    </main>
  );
}
