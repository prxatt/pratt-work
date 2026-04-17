import { getFileBySlug } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx/MDXComponents';
import SalesforceContent from './SalesforceContent';

export async function generateMetadata(): Promise<Metadata> {
  const project = await getFileBySlug('work', 'salesforce-grant-celebration');

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

export default async function SalesforcePage() {
  const project = await getFileBySlug('work', 'salesforce-grant-celebration');

  if (!project) {
    notFound();
  }

  const { metadata, content } = project;

  const typedMetadata = {
    title: metadata.title || '',
    description: metadata.description,
    year: metadata.year || '',
    role: metadata.role || '',
  };

  // Parse content sections for MDX rendering
  const contentSections = content.split('---').filter(section => section.trim());
  const mainDescription = contentSections[0]?.trim() || '';

  const approachSections = contentSections.slice(1).filter(section => {
    const trimmed = section.trim();
    return trimmed.startsWith('##');
  }).map(section => {
    const lines = section.trim().split('\n');
    const body = lines.slice(1).join('\n').trim();
    return body;
  });

  // Pre-render MDX content on the server
  const mainDescriptionMdx = <MDXRemote source={mainDescription} components={mdxComponents} />;
  const approachMdx = approachSections.map(body => (
    <MDXRemote key={body.slice(0, 20)} source={body} components={mdxComponents} />
  ));

  return (
    <SalesforceContent
      metadata={typedMetadata}
      content={content}
      mainDescriptionMdx={mainDescriptionMdx}
      approachMdx={approachMdx}
    />
  );
}
