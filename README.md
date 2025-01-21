# React Router App Route

A React application with dynamic routing capabilities built using Vite, React Router, and TypeScript.

## Requirements

- NodeJS LTS 20.18.1
- PNPM 8.x.x / corepack
- NVM (Node Version Manager) - To easily switch between node versions

## Tech Stack

- Vite v6.0.5
- React v18.3.1
- React Router v7.1.3
- TypeScript v5.6.2
- SWC (Speedy Web Compiler)
- ESLint v9.17.0

## Features

- File-based routing system
- Dynamic route generation
- Lazy loading components
- Error boundary handling
- Loading states
- 404 page handling
- Nested layouts support
- TypeScript support

## Quick Start

```bash
# Preparing NVM ENV
nvm install 20.18.1
nvm alias react-router-app 20.18.1
nvm use react-router-app

# Preparing pnpm as package manager
npm install -g corepack
corepack enable

# Installing packages
pnpm install

# Starting app in development mode
pnpm dev

# Building for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── lib/
│   └── router.tsx    # Core routing logic
├── pages/
│   ├── (auth)/      # Auth-related pages
│   ├── (public)/    # Public pages
│   ├── error.tsx    # Global error boundary
│   ├── 404.tsx     # Global 404 page
│   └── loading.tsx  # Global loading state
└── main.tsx        # Application entry point
```

## Routing Conventions

- `page.tsx`: Defines a route page
- `layout.tsx`: Defines a layout wrapper
- `loading.tsx`: Defines loading states
- `error.tsx`: Defines error boundaries
- `404.tsx`: Defines not found pages

### Dynamic Routes

- `[param]`: Dynamic parameter (e.g., `/user/[id]`)
- `(group)`: Route grouping
- `[...param]`: Catch-all routes

## Development

```bash
# Run development server
pnpm dev

# Run linting
pnpm lint

# Type checking
pnpm build
```

## License

MIT
