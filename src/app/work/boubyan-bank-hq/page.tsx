import { getFileBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import BoubyanContent from './BoubyanContent';

export async function generateMetadata(): Promise<Metadata> {
  const project = await getFileBySlug('work', 'boubyan-bank-hq');

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

export default async function BoubyanBankPage() {
  const project = await getFileBySlug('work', 'boubyan-bank-hq');

  if (!project) {
    notFound();
  }

  const { metadata, content } = project;

  // Parse content sections from MDX
  const sections = content.split('---').filter(s => s.trim());
  const mainContent = sections[0] || '';
  
  const approachSections: Array<{title: string, content: string}> = [];
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    const lines = section.split('\n');
    const titleLine = lines.find(l => l.startsWith('##'));
    if (titleLine) {
      const title = titleLine.replace('##', '').trim();
      const body = lines.slice(lines.indexOf(titleLine) + 1).join('\n').trim();
      approachSections.push({ title, content: body });
    }
  }

  const typedMetadata = {
    title: metadata.title || '',
    description: metadata.description,
    year: metadata.year || '',
    role: metadata.role || '',
    client: metadata.client || '',
  };

  // Render MDX content on server and pass as React nodes
  const mainContentNode = <MDXRemote source={mainContent} components={mdxComponents} />;
  
  // Render approach sections on server
  const renderedApproachSections = await Promise.all(
    approachSections.map(async (section) => ({
      title: section.title,
      content: <MDXRemote source={section.content} components={mdxComponents} />
    }))
  );

  return (
    <BoubyanContent 
      metadata={typedMetadata}
      mainContent={mainContentNode}
      approachSections={renderedApproachSections}
    />
  );
}
