'use client';

import { useCursor } from '@/context/CursorContext';
import { motion } from 'framer-motion';
import { notFound, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(
  () => import('@/components/playground/ModelViewer')
    .then(mod => ({ default: mod.ModelViewer })),
  { ssr: false, loading: () => <div style={{height:'100vh',background:'#0D0D0D'}} /> }
);
const GenerativeCanvas = dynamic(
  () => import('@/components/playground/GenerativeCanvas')
    .then(mod => ({ default: mod.GenerativeCanvas })),
  { ssr: false, loading: () => <div style={{height:'100vh',background:'#0D0D0D'}} /> }
);
const ZineViewer = dynamic(
  () => import('@/components/playground/ZineViewer')
    .then(mod => ({ default: mod.ZineViewer })),
  { ssr: false, loading: () => <div style={{height:'100vh',background:'#0D0D0D'}} /> }
);

const experiments = {
  'neural-puppetry': {
    title: 'NEURAL PUPPETRY',
    type: 'AI + MOTION',
    component: () => <ModelViewer modelUrl="/models/puppet.glb" />,
    description: 'Real-time motion capture driven by LLM agents. This experiment explores the intersection of latent character representation and physical kinetic output.',
  },
  'spatial-canvas': {
    title: 'SPATIAL CANVAS',
    type: 'INTERFACE',
    component: () => <GenerativeCanvas />,
    description: 'An infinite zoomable interface for multi-modal AI models. Visualizing the connectivity of latent spaces through generative particle systems.',
  },
  'ambient-compute': {
    title: 'AMBIENT COMPUTE',
    type: 'HARDWARE',
    component: () => <ModelViewer modelUrl="/models/device.glb" />,
    description: 'Zero-UI interaction patterns for smart environments. Prototyping a world where computation is integrated into the physical fabric of our spaces.',
  },
  'generative-zine': {
    title: 'GENERATIVE ZINE',
    type: 'PUBLICATION',
    component: () => <ZineViewer />,
    description: 'A CSS 3D page-turn experience exploring AI-generated typography and layout logic.',
  },
};

export default function PlaygroundExperimentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const experiment = experiments[slug as keyof typeof experiments];
  const { setCursorState } = useCursor();

  if (!experiment) {
    notFound();
  }

  return (
    <div className="fixed inset-0 bg-background z-[50] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-border z-10 bg-background/80 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] tracking-[0.4em] text-tertiary uppercase">
            {experiment.type} — EXP. {slug.toUpperCase()}
          </span>
          <h1 className="font-display text-3xl text-primary tracking-tighter">
            {experiment.title}
          </h1>
        </div>
        
        <motion.a
          href="/playground"
          onMouseEnter={() => setCursorState('hover')}
          onMouseLeave={() => setCursorState('default')}
          className="group flex items-center gap-4 text-primary"
        >
          <span className="font-display text-xl tracking-widest">EXIT EXPERIENCE</span>
          <div className="h-[1px] w-8 bg-primary group-hover:w-12 transition-all duration-300" />
        </motion.a>
      </div>

      {/* Main Experience Area */}
      <div className="flex-grow relative">
        <experiment.component />
      </div>

      {/* Info Overlay (Optional Toggle) */}
      <div className="absolute bottom-12 left-12 max-w-md z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="p-8 border border-border bg-background/40 backdrop-blur-xl rounded-sm"
        >
          <p className="text-secondary text-lg leading-relaxed">
            {experiment.description}
          </p>
        </motion.div>
      </div>

      {/* Custom Cursor is already provided by Layout */}
    </div>
  );
}
