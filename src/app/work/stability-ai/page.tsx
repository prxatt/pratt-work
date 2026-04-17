import { getFileBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import StabilityContent from './StabilityContent';

export async function generateMetadata(): Promise<Metadata> {
  const project = await getFileBySlug('work', 'stability-ai');

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.metadata.title} — Pratt Majmudar`,
    description: project.metadata.description || 'Creative Technology + Executive Production work by Pratt Majmudar.',
  };
}

export default async function StabilityAIPage() {
  const project = await getFileBySlug('work', 'stability-ai');

  if (!project) {
    notFound();
  }

  const { metadata, content } = project;

  const contentSections = content.split('---').filter(section => section.trim());
  const mainDescription = contentSections[0]?.trim() || '';

  const approachSections = contentSections.slice(1).filter(section => {
    const trimmed = section.trim();
    return trimmed.startsWith('##');
  }).map(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].replace('##', '').trim();
    const body = lines.slice(1).join('\n').trim();
    return { title, body };
  });

  const typedMetadata = {
    title: metadata.title || '',
    description: metadata.description,
    year: metadata.year || '',
    role: metadata.role || '',
    client: metadata.client || '',
    category: metadata.category,
  };

  return (
    <StabilityContent
      metadata={typedMetadata}
      mainDescription={mainDescription}
      approachSections={approachSections}
    />
  );
}
