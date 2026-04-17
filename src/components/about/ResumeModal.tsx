'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, MapPin, ExternalLink } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal = ({ isOpen, onClose }: ResumeModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0D0D0D] border border-[#333] rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#666] hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="sticky top-0 bg-[#0D0D0D]/95 backdrop-blur border-b border-[#222] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-[#F2F2F0] uppercase tracking-tight">
                  Pratt Majmudar
                </h2>
                <p className="font-mono text-sm text-[#6366f1] mt-1 uppercase tracking-wider">
                  Creative Technologist + Executive Producer
                </p>
              </div>
              <a
                href="/resume/Pratt_Majmudar_Resume.pdf"
                download="Pratt_Majmudar_Resume.pdf"
                className="flex items-center gap-2 px-4 py-2 bg-[#6366f1]/20 border border-[#6366f1]/40 rounded text-[#6366f1] hover:bg-[#6366f1]/30 transition-colors font-mono text-xs uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>

          {/* Resume Content */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-[#8A8A85] font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                San Francisco, CA
              </span>
              <a 
                href="mailto:pratt@pratt.work" 
                className="flex items-center gap-1.5 hover:text-[#6366f1] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                pratt@pratt.work
              </a>
              <a 
                href="https://linkedin.com/in/prxatt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#6366f1] transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Summary */}
            <section>
              <h3 className="font-display text-lg text-[#F2F2F0]/70 uppercase tracking-wider mb-3 border-b border-[#222] pb-2">
                Summary
              </h3>
              <p className="text-[#A3A3A3] text-sm leading-relaxed">
                Creative Technologist and Executive Producer with 9+ years of experience building 
                immersive experiences at the intersection of technology and storytelling. Proven 
                track record leading cross-functional teams to deliver award-winning projects for 
                Fortune 500 clients including PwC, Levi's, Salesforce, and Stability AI. Expertise 
                spans VR/AR, volumetric capture, interactive installations, and emerging technologies.
              </p>
            </section>

            {/* Experience */}
            <section>
              <h3 className="font-display text-lg text-[#F2F2F0]/70 uppercase tracking-wider mb-4 border-b border-[#222] pb-2">
                Experience
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                    <h4 className="font-display text-base text-[#F2F2F0] uppercase">
                      Founder + Executive Producer
                    </h4>
                    <span className="font-mono text-xs text-[#6366f1]">2018 — Present</span>
                  </div>
                  <p className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider mb-2">
                    CI0 Studio
                  </p>
                  <ul className="text-[#A3A3A3] text-sm space-y-1 list-disc list-inside">
                    <li>Lead creative technology studio delivering immersive experiences for global brands</li>
                    <li>Directed VR/AR projects for PwC, Levi's Innovation Labs, and Stability AI</li>
                    <li>Managed teams of 15+ across production, engineering, and creative disciplines</li>
                    <li>Secured $2M+ in project revenue through strategic client relationships</li>
                  </ul>
                </div>

                <div>
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1">
                    <h4 className="font-display text-base text-[#F2F2F0] uppercase">
                      Senior Producer
                    </h4>
                    <span className="font-mono text-xs text-[#6366f1]">2015 — 2018</span>
                  </div>
                  <p className="font-mono text-xs text-[#8A8A85] uppercase tracking-wider mb-2">
                    Obscura Digital
                  </p>
                  <ul className="text-[#A3A3A3] text-sm space-y-1 list-disc list-inside">
                    <li>Produced large-scale interactive installations and projection mapping projects</li>
                    <li>Managed technical integration for permanent and temporary experiential spaces</li>
                    <li>Collaborated with engineering teams on custom software and hardware solutions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Key Projects */}
            <section>
              <h3 className="font-display text-lg text-[#F2F2F0]/70 uppercase tracking-wider mb-4 border-b border-[#222] pb-2">
                Key Projects
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-[#222] p-4 rounded">
                  <h4 className="font-display text-sm text-[#F2F2F0] uppercase mb-1">
                    PwC Liftoff VR360
                  </h4>
                  <p className="font-mono text-xs text-[#6366f1] mb-2">VR • 360° Capture • Live Streaming</p>
                  <p className="text-[#8A8A85] text-xs">
                    Executive Produced 360° VR live capture for PwC's flagship accelerator conference.
                  </p>
                </div>
                <div className="border border-[#222] p-4 rounded">
                  <h4 className="font-display text-sm text-[#F2F2F0] uppercase mb-1">
                    Levi's Innovation Labs
                  </h4>
                  <p className="font-mono text-xs text-[#6366f1] mb-2">Interactive • Installation • Retail</p>
                  <p className="text-[#8A8A85] text-xs">
                    Led interactive installation for Levi's flagship innovation space.
                  </p>
                </div>
                <div className="border border-[#222] p-4 rounded">
                  <h4 className="font-display text-sm text-[#F2F2F0] uppercase mb-1">
                    The Crypt Volumetric
                  </h4>
                  <p className="font-mono text-xs text-[#6366f1] mb-2">Volumetric • Unreal Engine • Installation</p>
                  <p className="text-[#8A8A85] text-xs">
                    Volumetric capture installation with real-time Unreal Engine pipeline.
                  </p>
                </div>
                <div className="border border-[#222] p-4 rounded">
                  <h4 className="font-display text-sm text-[#F2F2F0] uppercase mb-1">
                    Stability AI Brand Film
                  </h4>
                  <p className="font-mono text-xs text-[#6366f1] mb-2">AI • Film • Brand</p>
                  <p className="text-[#8A8A85] text-xs">
                    Executive produced brand film for Stability AI featuring generative visuals.
                  </p>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section>
              <h3 className="font-display text-lg text-[#F2F2F0]/70 uppercase tracking-wider mb-3 border-b border-[#222] pb-2">
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {['VR/AR/XR', 'Volumetric Capture', 'Interactive Installation', 'Real-time Engines', 'Creative Direction', 'Technical Production', 'Team Leadership', 'Client Relations', 'Unreal Engine', 'Unity', ' emerging Technologies'].map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 bg-[#1a1a1a] border border-[#333] rounded text-[#8A8A85] font-mono text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h3 className="font-display text-lg text-[#F2F2F0]/70 uppercase tracking-wider mb-3 border-b border-[#222] pb-2">
                Education
              </h3>
              <div>
                <h4 className="font-display text-sm text-[#F2F2F0] uppercase">
                  BFA Film & Digital Production
                </h4>
                <p className="font-mono text-xs text-[#8A8A85]">
                  School of Visual Arts, New York
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#0D0D0D]/95 backdrop-blur border-t border-[#222] p-6">
            <a
              href="/resume/Pratt_Majmudar_Resume.pdf"
              download="Pratt_Majmudar_Resume.pdf"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#6366f1] hover:bg-[#5558e0] text-white rounded font-mono text-sm uppercase tracking-wider transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Full Resume (PDF)
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeModal;
