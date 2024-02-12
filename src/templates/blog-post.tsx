import * as React from 'react';
import { graphql } from 'gatsby';

export default function BlogPost({ data, children }) {
  const post = data.mdx;
  return (
    <article>
      <h1>{post.frontmatter.title}</h1>
      {children}
    </article>
  );
}

export const query = graphql`
    query BlogPostById($id: String!) {
        mdx(id: { eq: $id }) {
            id
            frontmatter {
                title
            }
        }
    }
`;
