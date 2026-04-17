import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_PATH = path.join(process.cwd(), 'content');

export async function getFiles(type: 'work' | 'blog' | 'playground') {
  const dirPath = path.join(CONTENT_PATH, type);
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath);
}

export async function getFileBySlug(type: 'work' | 'blog' | 'playground', slug: string) {
  const filePath = path.join(CONTENT_PATH, type, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);
  
  return {
    metadata: data,
    content,
    slug,
  };
}

export async function getAllFilesMetadata(type: 'work' | 'blog' | 'playground') {
  const files = await getFiles(type);
  
  return files
    .map((fileName) => {
      const source = fs.readFileSync(path.join(CONTENT_PATH, type, fileName), 'utf8');
      const { data } = matter(source);
      return {
        ...data,
        slug: fileName.replace(/\.mdx$/, ''),
      };
    })
    .sort((a: any, b: any) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });
}
