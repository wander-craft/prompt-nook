import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const enablePublicAccess = import.meta.env.VITE_ENABLE_PUBLIC_ACCESS === 'true';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Log the configuration to verify it's correct
console.log('Supabase configuration:', {
  url: supabaseUrl ? 'Available' : 'Missing',
  key: supabaseKey ? 'Available' : 'Missing',
  publicAccess: enablePublicAccess ? 'Enabled' : 'Disabled'
});

// Test the connection
supabase.from('prompts').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
      if (error.code === '42501') { // Permission denied error
        console.warn('Row-Level Security (RLS) policy is preventing access. Make sure RLS is configured correctly in Supabase.');
      }
    } else {
      console.log('Supabase connection successful, prompt count:', count);
    }
  })
  // Using a void Promise to handle any errors
  .then(undefined, (err) => {
    console.error('Supabase connection test error:', err);
  });

// Initialize the database schema if needed
export const initializeDatabase = async () => {
  try {
    // Check if the prompts table exists
    const { error } = await supabase
      .from('prompts')
      .select('id', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') { // Table doesn't exist
      console.log('Prompts table does not exist, creating it...');
      // Create the prompts table
      // Note: This would typically be done through Supabase migrations
      // This is just a fallback for development
      const { error: createError } = await supabase.rpc('create_prompts_table');
      if (createError) {
        console.error('Failed to create prompts table:', createError);
      } else {
        console.log('Prompts table created successfully');
      }
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Call initializeDatabase when the app starts
initializeDatabase();

export type Tables = {
  prompts: {
    Row: {
      id: string;
      title: string;
      content: string;
      category: string;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<Tables['prompts']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Tables['prompts']['Insert']>;
  };
};
