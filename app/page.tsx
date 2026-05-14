// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import {
//   Youtube,
//   MonitorPlay,
//   CheckSquare,
//   StickyNote,
//   Play,
//   Keyboard,
//   Maximize2,
//   Plus,
//   BarChart,
//   BookOpen,
//   ArrowRight
// } from "lucide-react"

// const FEATURES = [
//   {
//     icon: MonitorPlay,
//     title: "Distraction-free",
//     description: "No recommendations, no comments, no shorts. Just the video you need to watch.",
//   },
//   {
//     icon: CheckSquare,
//     title: "Track progress",
//     description: "Mark videos complete, visualize playlist progress bars, and hit daily milestones.",
//   },
//   {
//     icon: StickyNote,
//     title: "Take notes",
//     description: "Write, edit, and organize markdown notes linked directly to video timestamps.",
//   },
//   {
//     icon: Play,
//     title: "Resume anywhere",
//     description: "Auto-resume the exact second of the last video you watched in any playlist.",
//   },
//   {
//     icon: Keyboard,
//     title: "Keyboard shortcuts",
//     description: "Press N for next, P for previous, and F for focus mode. Stay in the flow.",
//   },
//   {
//     icon: Maximize2,
//     title: "Focus mode",
//     description: "Hide the sidebar and notes. Full immersion for complex engineering topics.",
//   },
// ]

// const FAQS = [
//   { 
//     q: "What is the purpose of this website?", 
//     a: "Playlix turns chaotic YouTube playlists into structured, trackable learning courses completely free of algorithmic distractions." 
//   },
//   { 
//     q: "Do I need a YouTube Premium account?", 
//     a: "No, Playlix works perfectly with standard YouTube links. We embed the videos directly bypassing the usual interface." 
//   },
//   { 
//     q: "Can I export my Markdown notes?", 
//     a: "Yes! All your notes can be exported as standard .md files so you can keep them in Obsidian, Notion, or your local file system." 
//   },
//   { 
//     q: "How do I track my course completion?", 
//     a: "As you watch, simply click the 'Mark Complete' toggle. Your playlist's overall progress bar will automatically update." 
//   },
//   { 
//     q: "Is Playlix completely free to use?", 
//     a: "We offer a generous free tier that covers most learners' needs. A Pro plan is available for unlimited playlists and cloud sync." 
//   },
//   { 
//     q: "Do you offer a desktop app?", 
//     a: "Currently, Playlix is a web application, but it is fully optimized to be installed as a PWA (Progressive Web App) on your desktop." 
//   },
// ]

// // Animation Variants
// const staggerContainer = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// }

// const fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
// }

// export default function LandingPage() {
//   const [openFaq, setOpenFaq] = useState<number | null>(null)

//   return (
//     <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary relative">
      
//       {/* Playful Background Pattern */}
//       <div className="fixed inset-0 z-[-1] pointer-events-none">
//         <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.2)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
//       </div>

//       {/* Header */}
//       <motion.header 
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="w-full z-50 bg-background/80 backdrop-blur-md sticky top-0"
//       >
//         <div className="container mx-auto px-6 h-16 flex justify-between items-center max-w-6xl">
//           <Link href="/" className="flex items-center gap-2.5 group">
//             <Youtube className="h-6 w-6 text-primary" />
//             <span className="text-lg font-bold tracking-tight text-foreground">Playlix</span>
//           </Link>
          
//           <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
//             <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
//             <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
//             <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
//           </nav>

//           <div className="flex items-center gap-4">
//             <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-foreground hover:text-primary transition-colors">
//               Log in
//             </Link>
//             <Link href="/sign-up">
//               <Button className="h-9 px-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-semibold shadow-sm">
//                 Get started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </motion.header>

//       {/* Hero Section */}
//       <section className="container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-32 text-center max-w-5xl relative">
        
//         {/* Floating Decorative Elements using Framer Motion */}
//         <motion.div 
//           animate={{ y: [0, -15, 0], rotate: [-6, -4, -6] }}
//           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
//           className="hidden lg:block absolute top-20 left-0"
//         >
//           <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-4 flex items-center gap-3 w-48 hover:scale-105 transition-transform cursor-default">
//             <div className="bg-blue-500/10 p-2 rounded-lg"><BookOpen className="h-5 w-5 text-blue-500" /></div>
//             <div className="text-left">
//               <p className="text-xs font-bold">Physics 101</p>
//               <p className="text-[10px] text-muted-foreground">Playlist Imported</p>
//             </div>
//           </div>
//         </motion.div>
        
//         <motion.div 
//           animate={{ y: [0, 15, 0], rotate: [6, 8, 6] }}
//           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//           className="hidden lg:block absolute top-40 right-4"
//         >
//           <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-4 flex flex-col gap-2 w-56 hover:scale-105 transition-transform cursor-default">
//             <div className="flex items-center gap-2 mb-1">
//               <div className="bg-primary/10 p-1.5 rounded-md"><BarChart className="h-4 w-4 text-primary" /></div>
//               <p className="text-xs font-bold">Course Progress</p>
//             </div>
//             <div className="w-full bg-muted rounded-full h-1.5"><motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1.5, delay: 0.5 }} className="bg-primary h-1.5 rounded-full"></motion.div></div>
//             <p className="text-[10px] text-muted-foreground text-right">14 / 20 videos complete</p>
//           </div>
//         </motion.div>

//         <motion.div 
//           animate={{ y: [0, -10, 0], rotate: [3, 5, 3] }}
//           transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
//           className="hidden lg:block absolute -bottom-10 left-20"
//         >
//           <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-4 flex gap-3 w-64 hover:scale-105 transition-transform cursor-default">
//              <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0"><StickyNote className="h-3 w-3 text-orange-500"/></div>
//              <div className="space-y-1.5 w-full">
//                <div className="h-2 w-3/4 bg-muted rounded"></div>
//                <div className="h-2 w-full bg-muted rounded"></div>
//                <div className="h-2 w-1/2 bg-muted rounded"></div>
//              </div>
//           </div>
//         </motion.div>

//         {/* Hero Content */}
//         <motion.div 
//           variants={staggerContainer}
//           initial="hidden"
//           animate="show"
//           className="relative z-10 flex flex-col items-center"
//         >
//           <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8">
//             <span className="relative flex h-2 w-2">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
//             </span>
//             New! Turn any YouTube playlist into a course
//           </motion.div>
          
//           <motion.h1 variants={fadeInUp} className="text-5xl md:text-[4rem] font-bold tracking-tight mb-6 leading-[1.05] text-foreground max-w-3xl">
//             Convert playlists. <br />
//             Track progress <span className="text-primary">automatically.</span>
//           </motion.h1>
          
//           <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-medium">
//             Record and organize your learning automatically. Focus on what matters — actually understanding the material without algorithm distractions.
//           </motion.p>
          
//           <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <Link href="/sign-up">
//               <Button className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 text-base font-semibold group">
//                 Get started - it's free 
//                 <motion.span className="inline-block ml-2" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
//                   <ArrowRight className="h-4 w-4" />
//                 </motion.span>
//               </Button>
//             </Link>
//           </motion.div>
//         </motion.div>
//       </section>

//       {/* Features Tag */}
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.8 }}
//         whileInView={{ opacity: 1, scale: 1 }}
//         viewport={{ once: true, margin: "-100px" }}
//         className="flex justify-center mt-12 mb-8"
//       >
//         <span className="px-4 py-1.5 rounded-full border border-border/60 bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
//           Features
//         </span>
//       </motion.div>

//       {/* Features Headline */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         viewport={{ once: true, margin: "-100px" }}
//         className="text-center mb-16 px-4"
//       >
//         <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
//           Go from viewer to master
//         </h2>
//       </motion.div>

//       {/* Features Grid */}
//       <section id="features" className="container mx-auto px-6 max-w-5xl pb-32">
//         <motion.div 
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, margin: "-100px" }}
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//         >
//           {FEATURES.map((feature, idx) => (
//             <motion.div
//               variants={fadeInUp}
//               key={feature.title}
//               whileHover={{ y: -5 }}
//               className="group relative rounded-2xl border border-border/60 bg-card p-8 hover:shadow-xl transition-shadow duration-300"
//             >
//               <div className="mb-5 inline-flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center text-primary group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
//                 <feature.icon className="h-6 w-6" />
//               </div>
//               <h3 className="text-lg font-bold tracking-tight mb-2 text-foreground">{feature.title}</h3>
//               <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </section>

//       {/* FAQ Section */}
//       <section id="faq" className="container mx-auto px-4 py-20 max-w-3xl">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: "-100px" }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-4xl font-bold tracking-tight">Get Answer of some Common Questions</h2>
//         </motion.div>
        
//         <motion.div 
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//           className="space-y-0 border-t border-border/60"
//         >
//           {FAQS.map((faq, idx) => (
//             <motion.div variants={fadeInUp} key={idx} className="border-b border-border/60">
//               <div 
//                 onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
//                 className="py-5 flex items-center gap-4 cursor-pointer hover:bg-muted/10 transition-colors px-2 rounded-lg"
//               >
//                 <motion.div animate={{ rotate: openFaq === idx ? 45 : 0 }} transition={{ duration: 0.2 }}>
//                   <Plus className="text-primary h-5 w-5 shrink-0" strokeWidth={3} />
//                 </motion.div>
//                 <span className="font-semibold text-foreground text-base select-none">{faq.q}</span>
//               </div>
//               <AnimatePresence>
//                 {openFaq === idx && (
//                   <motion.div
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: "auto", opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.3, ease: "easeInOut" }}
//                     className="overflow-hidden"
//                   >
//                     <p className="px-2 pb-5 pl-11 text-sm text-muted-foreground leading-relaxed">
//                       {faq.a}
//                     </p>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           ))}
//         </motion.div>
//       </section>

//       {/* People Love Us (Avatar Cluster) */}
//       <section className="container mx-auto px-4 py-12 text-center pb-32">
//         <motion.div 
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//           variants={{
//             hidden: {},
//             show: { transition: { staggerChildren: 0.1 } }
//           }}
//           className="flex justify-center -space-x-3 mb-6"
//         >
//           {[{ bg: "bg-blue-100", text: "text-blue-800", initials: "AL" },
//             { bg: "bg-green-100", text: "text-green-800", initials: "MR" },
//             { bg: "bg-purple-100", text: "text-purple-800", initials: "SJ" },
//             { bg: "bg-orange-100", text: "text-orange-800", initials: "KC" },
//             { bg: "bg-red-100", text: "text-red-800", initials: "DB" }].map((avatar, i) => (
//             <motion.div 
//               key={i}
//               variants={{
//                 hidden: { opacity: 0, x: -10 },
//                 show: { opacity: 1, x: 0 }
//               }}
//               whileHover={{ y: -5, zIndex: 100 }}
//               className={`w-10 h-10 rounded-full border-2 border-background ${avatar.bg} flex items-center justify-center relative cursor-pointer`}
//               style={{ zIndex: 50 - i }}
//             >
//               <span className={`text-xs font-bold ${avatar.text}`}>{avatar.initials}</span>
//             </motion.div>
//           ))}
//         </motion.div>
        
//         <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//           <h3 className="font-bold text-foreground text-lg mb-2">People love us</h3>
//           <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium">
//             Playlix is loved by thousands of people across the world, be part of the community and join us.
//           </p>
//         </motion.div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t border-border/60 bg-background py-10">
//         <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
//           <div className="flex items-center gap-2">
//             <Youtube className="h-5 w-5 text-primary" />
//             <span className="text-sm font-bold text-foreground">Playlix</span>
//           </div>
          
//           <nav className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
//             <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
//             <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
//             <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
//             <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
//           </nav>
          
//           <p className="text-xs text-muted-foreground font-medium">
//             &copy; {new Date().getFullYear()} Playlix. All rights reserved.
//           </p>
//         </div>
//       </footer>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Youtube,
  MonitorPlay,
  CheckSquare,
  StickyNote,
  Play,
  Keyboard,
  Maximize2,
  Plus,
  BarChart,
  BookOpen,
  ArrowRight
} from "lucide-react"

const FEATURES = [
  {
    icon: MonitorPlay,
    title: "Distraction-free",
    description: "No recommendations, no comments, no shorts. Just the video you need to watch.",
  },
  {
    icon: CheckSquare,
    title: "Track progress",
    description: "Mark videos complete, visualize playlist progress bars, and hit daily milestones.",
  },
  {
    icon: StickyNote,
    title: "Take notes",
    description: "Write, edit, and organize markdown notes linked directly to video timestamps.",
  },
  {
    icon: Play,
    title: "Resume anywhere",
    description: "Auto-resume the exact second of the last video you watched in any playlist.",
  },
  {
    icon: Keyboard,
    title: "Keyboard shortcuts",
    description: "Press N for next, P for previous, and F for focus mode. Stay in the flow.",
  },
  {
    icon: Maximize2,
    title: "Focus mode",
    description: "Hide the sidebar and notes. Full immersion for complex engineering topics.",
  },
]

const FAQS = [
  { 
    q: "What is the purpose of this website?", 
    a: "Playlix turns chaotic YouTube playlists into structured, trackable learning courses completely free of algorithmic distractions." 
  },
  { 
    q: "Do I need a YouTube Premium account?", 
    a: "No, Playlix works perfectly with standard YouTube links. We embed the videos directly bypassing the usual interface." 
  },
  { 
    q: "Can I export my Markdown notes?", 
    a: "Yes! All your notes can be exported as standard .md files so you can keep them in Obsidian, Notion, or your local file system." 
  },
  { 
    q: "How do I track my course completion?", 
    a: "As you watch, simply click the 'Mark Complete' toggle. Your playlist's overall progress bar will automatically update." 
  },
  { 
    q: "Is Playlix completely free to use?", 
    a: "We offer a generous free tier that covers most learners' needs. A Pro plan is available for unlimited playlists and cloud sync." 
  },
  { 
    q: "Do you offer a desktop app?", 
    a: "Currently, Playlix is a web application, but it is fully optimized to be installed as a PWA (Progressive Web App) on your desktop." 
  },
]

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/20 selection:text-primary relative">
      
      {/* Playful Background Pattern */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.2)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full z-50 bg-background/80 backdrop-blur-md sticky top-0"
      >
        <div className="container mx-auto px-6 h-16 flex justify-between items-center max-w-6xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Youtube className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">Playlix</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/sign-up">
              {/* Premium 3D Header Button */}
              <Button className="h-9 px-5 rounded-full bg-gradient-to-b from-primary/80 to-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-2px_0_rgba(0,0,0,0.2)] border border-primary/30 hover:brightness-110 active:translate-y-[1px] active:shadow-[0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-all text-sm font-semibold">
                Get started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-20 md:pt-32 md:pb-32 text-center max-w-5xl relative">
        
        {/* Floating Decorative Elements using Framer Motion */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [-6, -4, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute top-20 left-0"
        >
          <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-4 flex items-center gap-3 w-48 hover:scale-105 transition-transform cursor-default">
            <div className="bg-blue-500/10 p-2 rounded-lg"><BookOpen className="h-5 w-5 text-blue-500" /></div>
            <div className="text-left">
              <p className="text-xs font-bold">Physics 101</p>
              <p className="text-[10px] text-muted-foreground">Playlist Imported</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [6, 8, 6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute top-40 right-4"
        >
          <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-4 flex flex-col gap-2 w-56 hover:scale-105 transition-transform cursor-default">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-primary/10 p-1.5 rounded-md"><BarChart className="h-4 w-4 text-primary" /></div>
              <p className="text-xs font-bold">Course Progress</p>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5"><motion.div initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1.5, delay: 0.5 }} className="bg-primary h-1.5 rounded-full"></motion.div></div>
            <p className="text-[10px] text-muted-foreground text-right">14 / 20 videos complete</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [3, 5, 3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute -bottom-10 left-20"
        >
          <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-4 flex gap-3 w-64 hover:scale-105 transition-transform cursor-default">
             <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0"><StickyNote className="h-3 w-3 text-orange-500"/></div>
             <div className="space-y-1.5 w-full">
               <div className="h-2 w-3/4 bg-muted rounded"></div>
               <div className="h-2 w-full bg-muted rounded"></div>
               <div className="h-2 w-1/2 bg-muted rounded"></div>
             </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New! Turn any YouTube playlist into a course
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-[4rem] font-bold tracking-tight mb-6 leading-[1.05] text-foreground max-w-3xl">
            Convert playlists. <br />
            Track progress <span className="text-primary">automatically.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-medium">
            Record and organize your learning automatically. Focus on what matters — actually understanding the material without algorithm distractions.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              {/* Premium 3D Hero Button */}
              <Button className="h-12 px-8 rounded-full bg-gradient-to-b from-primary/80 to-primary text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_2px_0_rgba(255,255,255,0.25),inset_0_-3px_0_rgba(0,0,0,0.2)] border border-primary/30 hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-all text-base font-semibold group">
                Get started - it's free 
                <motion.span className="inline-block ml-2" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Tag */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex justify-center mt-12 mb-8"
      >
        <span className="px-4 py-1.5 rounded-full border border-border/60 bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Features
        </span>
      </motion.div>

      {/* Features Headline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-16 px-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Go from viewer to master
        </h2>
      </motion.div>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 max-w-5xl pb-32">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature, idx) => (
            <motion.div
              variants={fadeInUp}
              key={feature.title}
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl border border-border/60 bg-card p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-5 inline-flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center text-primary group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold tracking-tight mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-20 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tight">Get Answer of some Common Questions</h2>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-0 border-t border-border/60"
        >
          {FAQS.map((faq, idx) => (
            <motion.div variants={fadeInUp} key={idx} className="border-b border-border/60">
              <div 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="py-5 flex items-center gap-4 cursor-pointer hover:bg-muted/10 transition-colors px-2 rounded-lg"
              >
                <motion.div animate={{ rotate: openFaq === idx ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <Plus className="text-primary h-5 w-5 shrink-0" strokeWidth={3} />
                </motion.div>
                <span className="font-semibold text-foreground text-base select-none">{faq.q}</span>
              </div>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-2 pb-5 pl-11 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* People Love Us (Avatar Cluster) */}
      <section className="container mx-auto px-4 py-12 text-center pb-32">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex justify-center -space-x-3 mb-6"
        >
          {[{ bg: "bg-blue-100", text: "text-blue-800", initials: "AL" },
            { bg: "bg-green-100", text: "text-green-800", initials: "MR" },
            { bg: "bg-purple-100", text: "text-purple-800", initials: "SJ" },
            { bg: "bg-orange-100", text: "text-orange-800", initials: "KC" },
            { bg: "bg-red-100", text: "text-red-800", initials: "DB" }].map((avatar, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0 }
              }}
              whileHover={{ y: -5, zIndex: 100 }}
              className={`w-10 h-10 rounded-full border-2 border-background ${avatar.bg} flex items-center justify-center relative cursor-pointer`}
              style={{ zIndex: 50 - i }}
            >
              <span className={`text-xs font-bold ${avatar.text}`}>{avatar.initials}</span>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h3 className="font-bold text-foreground text-lg mb-2">People love us</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium">
            Playlix is loved by thousands of people across the world, be part of the community and join us.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background py-10">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Playlix</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          </nav>
          
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Playlix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}