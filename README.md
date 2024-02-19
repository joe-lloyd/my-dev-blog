<!-- AUTO-GENERATED-CONTENT:START (STARTER) -->
<p align="center">
  <a href="https://www.joe-lloyd.com">
    <img alt="joe-lloyd logo" src="src/images/logo.png" width="160" />
  </a>
</p>
<h1 align="center">
  Joe Lloyd Dev Blog
</h1>

---

# 10,000 Hours of Development

Welcome to "10,000 Hours of Development" - a blog dedicated to diving deep into the world of TypeScript, React, and Node.js. Here, we explore tutorials and advanced coding concepts, helping developers master these technologies one post at a time.

## Features

- **Overview and Detail Pages**: Dive into topics with detailed explanations and walkthroughs.
- **Tags**: Easily navigate through posts related to specific topics.
- **Code Examples**: Access to gists with practical code examples accompanying our tutorials.

## Getting Started

To get this project running on your local machine, follow these steps:

### Prerequisites

- Node.js (v20)
- TypeScript

### Installation

1. Clone the repo:
   ```
   git clone <repository-url>
   ```
2. Install NPM packages:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Visit `http://localhost:8000` to view the blog.

## Usage

To add a new post:

1. Create a new MDX file in the `content/post` directory.
2. Add the necessary metadata at the top of your MDX file:

```mdx
---
title: "Your Title Here"
author: "Your Name"
date: "YYYY-MM-DD"
slug: "post-slug"
excerpt: "Brief description of the post"
featuredImage: "/path/to/image"
tags: ["tag1", "tag2"]
seoTitle: "SEO Title Here"
seoDescription: "SEO Description Here"
published: true/false
videoSrc: "URL to video"
gistLink: "URL to gist with code examples"
---
```

## Deployment

This project is set up for continuous deployment with Netlify. Pushes to the `main` branch will automatically trigger a new deployment.

## Built With

- **Gatsby**: For building the blog.
- **React**: Used for UI components.
- **TypeScript**: For type-safe code.
- **SCSS**: For styling.
- **MDX**: For writing posts using Markdown and JSX.
- **GraphQL**: For data queries.

## Project Status

This is an ongoing project, with regular updates and new posts.

## Contributing

This blog is a personal project, and I'm currently not looking for contributions. However, feel free to fork the project and experiment on your own!

## Questions or Feedback

Feel free to reach out if you have any questions or feedback regarding the blog or the setup.
