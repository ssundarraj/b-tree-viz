# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

B-Tree Visualizer is a React/TypeScript web application that provides interactive visualizations of B-tree data structures. The project is built with Vite and uses D3.js for advanced tree visualizations.

## Development Commands

**Package Manager**: Use `pnpm` (configured in package.json)

**Core Development Tasks**:
- `pnpm dev` - Start development server (runs on port 3000)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run Jest tests
- `pnpm lint` - Run ESLint on TypeScript files in src/
- `pnpm typecheck` - Run TypeScript type checking without emitting files
- `pnpm format` - Format code with Prettier

## Architecture

**Core B-Tree Implementation**:
- `src/btree.ts` - Complete B-tree data structure implementation with insert, delete, search operations
- `src/btree.spec.ts` - Jest tests for B-tree functionality

**Visualization Components**:
- `src/viz/App.tsx` - Main React app with routing (uses React Router with basename `/b-tree-viz`)
- `src/viz/BTreePage.tsx` - B-tree visualization page
- `src/viz/TablePage.tsx` - Table/index visualization page
- `src/viz/BTreeD3Visualizer.tsx` - D3.js-based B-tree visualization component
- `src/viz/IndexBTreeVisualizer.tsx` - Index-specific B-tree visualizer
- `src/viz/components/ControlPanel.tsx` - UI controls for the visualizers

**Supporting Files**:
- `src/viz/BST.ts` & `src/viz/BSTVisualizer.tsx` - Binary search tree implementation and visualization
- `src/viz/hooks/useD3Zoom.ts` - Custom hook for D3 zoom functionality
- `src/viz/Navigation.tsx` - App navigation component

**Build Configuration**:
- Vite config sets base path to `/b-tree-viz/` for GitHub Pages deployment
- Entry point is `src/viz/main.tsx`
- GitHub Pages routing handled via sessionStorage redirect mechanism

## Key Implementation Details

- B-tree class is generic (`BTree<T>`) with configurable order and comparison function
- Minimum order is 3, with automatic calculation of min/max keys per node
- Visualizations use D3.js for rendering interactive tree diagrams
- React Router handles client-side routing with fallback to `/btree` route
- All TypeScript with strict typing enabled

## Testing

Tests are located in `*.spec.ts` files alongside source code. The B-tree implementation has comprehensive test coverage for all operations.