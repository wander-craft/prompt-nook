# Prompt Nook

Prompt Nook is a modern web application designed for managing and organizing AI prompts. It provides a clean, intuitive interface for storing, categorizing, and accessing your collection of prompts.

## Features

- **Prompt Management**: Create, edit, and delete prompts with titles and detailed content
- **Category Organization**: Organize prompts by categories for better structure
- **Search Functionality**: Quickly find prompts using the search feature
- **Category Filtering**: Filter prompts by category to focus on specific types
- **Data Persistence**: Prompts are stored in Supabase for centralized access across users
- **Export/Import**: Export and import your prompt collection for backup and sharing
- **Modern UI**: Clean, responsive interface built with React and Shadcn/UI

## Live Demo

Visit the live application at: https://wander-craft.github.io/prompt-nook/

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- Shadcn/UI
- Tailwind CSS
- Supabase (for database and storage)

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up your database by running the SQL script in `supabase/schema.sql`
3. Configure Row-Level Security (RLS) policies as needed
4. Create a `.env` file based on `.env.example` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ENABLE_PUBLIC_ACCESS=true
   ```

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with Supabase credentials
4. Start the development server: `npm run dev`

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Ensure your Supabase project is properly configured with the necessary RLS policies

