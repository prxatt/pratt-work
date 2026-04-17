import { getFileBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import WomenIsLosersContent from './WomenIsLosersContent';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const project = await getFileBySlug('work', 'women-is-losers');

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

export default async function WomenIsLosersPage() {
  const project = await getFileBySlug('work', 'women-is-losers');

  if (!project) {
    notFound();
  }

  const { metadata, content } = project;

  // Parse content sections from MDX
  const sections = content.split('---').filter(s => s.trim());
  const mainContent = sections[0] || '';

  const approachSections: Array<{title: string, content: React.ReactNode, index: number}> = [];
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    const lines = section.split('\n');
    const titleLine = lines.find(l => l.startsWith('##'));
    if (titleLine) {
      const title = titleLine.replace('##', '').trim();
      const body = lines.slice(lines.indexOf(titleLine) + 1).join('\n').trim();
      approachSections.push({
        title,
        content: <MDXRemote source={body} components={mdxComponents} />,
        index: approachSections.length
      });
    }
  }

  // Type assertion for metadata to satisfy TypeScript
  const typedMetadata = metadata as {
    title: string;
    description?: string;
    year: string;
    role: string;
    category?: string[];
  };

  return (
    <WomenIsLosersContent
      metadata={typedMetadata}
      mainContent={<MDXRemote source={mainContent} components={mdxComponents} />}
      approachSections={approachSections}
    />
  );
}
