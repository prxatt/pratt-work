import { getFileBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import { Metadata } from 'next';
import WeightsBiasesContent from './WeightsBiasesContent';

export async function generateMetadata(): Promise<Metadata> {
  const project = await getFileBySlug('work', 'weights-and-biases-fully-connected');

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

export default async function WeightsBiasesPage() {
  const project = await getFileBySlug('work', 'weights-and-biases-fully-connected');

  if (!project) {
    notFound();
  }

  const { metadata, content } = project;

  // Parse content sections from MDX
  const sections = content.split('---').filter(s => s.trim());
  const mainContent = sections[0] || '';

  const approachSections: Array<{ title: string; index: number }> = [];
  const approachContents: string[] = [];

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i].trim();
    const lines = section.split('\n');
    const titleLine = lines.find(l => l.startsWith('##'));
    if (titleLine) {
      const title = titleLine.replace('##', '').trim();
      const body = lines.slice(lines.indexOf(titleLine) + 1).join('\n').trim();
      approachSections.push({ title, index: approachSections.length });
      approachContents.push(body);
    }
  }

  // Pre-render MDX content on the server
  const mainContentMdx = <MDXRemote source={mainContent} components={mdxComponents} />;
  const approachMdx = approachContents.map((body, index) => (
    <MDXRemote key={`approach-${index}`} source={body} components={mdxComponents} />
  ));

  return (
    <WeightsBiasesContent
      metadata={{
        title: metadata.title || '',
        description: metadata.description,
        year: metadata.year || '',
        client: metadata.client || '',
        role: metadata.role || '',
        category: metadata.category,
      }}
      content={content}
      mainContentMdx={mainContentMdx}
      approachMdx={approachMdx}
      approachSections={approachSections}
    />
  );
}
