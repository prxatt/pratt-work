import { MDXRemoteProps } from 'next-mdx-remote/rsc';

export const mdxComponents: MDXRemoteProps['components'] = {
  h1: (props) => (
    <h1 className="font-display text-5xl md:text-7xl text-primary tracking-tighter mt-16 mb-8 uppercase" {...props} />
  ),
  h2: (props) => (
    <h2 className="font-display text-4xl md:text-5xl text-primary tracking-tighter mt-12 mb-6 uppercase" {...props} />
  ),
  h3: (props) => (
    <h3 className="font-display text-2xl md:text-3xl text-secondary tracking-widest mt-8 mb-4 uppercase" {...props} />
  ),
  p: (props) => (
    <p className="text-secondary text-lg md:text-xl leading-relaxed mb-6" {...props} />
  ),
  ul: (props) => (
    <ul className="list-none flex flex-col gap-4 mb-8" {...props} />
  ),
  li: (props) => (
    <li className="flex items-start gap-4 text-secondary text-lg md:text-xl leading-relaxed before:content-['—'] before:text-tertiary" {...props} />
  ),
  strong: (props) => (
    <strong className="text-primary font-bold" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-2 border-primary pl-8 py-4 my-12 italic text-primary text-2xl font-display tracking-tight" {...props} />
  ),
};
