import { supabase, type Tables } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export type Prompt = Tables['prompts']['Row'];
export type NewPrompt = Tables['prompts']['Insert'];
export type PromptUpdate = Tables['prompts']['Update'];

const handleError = (error: PostgrestError | null) => {
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
  }
};

export const getPrompts = async (): Promise<Prompt[]> => {
  console.log('Fetching prompts from Supabase...');
  
  try {
    // First check if the table exists and has records
    const { count, error: countError } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking prompt count:', countError);
      handleError(countError);
      return [];
    }
    
    console.log('Prompt count in Supabase:', count);
    
    if (count === 0) {
      console.log('No prompts found in Supabase');
      return [];
    }
    
    // Get all prompts
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      handleError(error);
      return [];
    }
    
    console.log('Successfully fetched prompts:', data?.length || 0);
    console.log('Sample prompt:', data && data.length > 0 ? JSON.stringify(data[0]) : 'No prompts');
    
    return data || [];
  } catch (err) {
    console.error('Unexpected error in getPrompts:', err);
    return [];
  }
};

export const createPrompt = async (promptData: NewPrompt): Promise<Prompt> => {
  console.log('Creating prompt in Supabase:', promptData);
  
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert([promptData])
      .select()
      .single();

    handleError(error);
    
    if (!data) {
      throw new Error('No data returned from insert operation');
    }
    
    console.log('Prompt created successfully:', data.id);
    return data;
  } catch (err) {
    console.error('Error creating prompt:', err);
    throw err;
  }
};

export const updatePrompt = async (id: string, promptData: PromptUpdate): Promise<Prompt> => {
  console.log('Updating prompt in Supabase:', id, promptData);
  
  try {
    const { data, error } = await supabase
      .from('prompts')
      .update(promptData)
      .eq('id', id)
      .select()
      .single();

    handleError(error);
    
    if (!data) {
      throw new Error('No data returned from update operation');
    }
    
    console.log('Prompt updated successfully:', id);
    return data;
  } catch (err) {
    console.error('Error updating prompt:', err);
    throw err;
  }
};

export const deletePrompt = async (id: string): Promise<void> => {
  console.log('Deleting prompt from Supabase:', id);
  
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    handleError(error);
    console.log('Prompt deleted successfully:', id);
  } catch (err) {
    console.error('Error deleting prompt:', err);
    throw err;
  }
};

export const getCategories = async (): Promise<string[]> => {
  console.log('Fetching categories from Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('category');

    handleError(error);
    
    // Extract unique categories
    const categories = data ? [...new Set(data.map(item => item.category))] : [];
    console.log('Fetched categories from Supabase:', categories);
    
    return categories.length > 0 ? categories : ['General'];
  } catch (err) {
    console.error('Error fetching categories:', err);
    return ['General'];
  }
};

export const saveAllPrompts = async (prompts: Prompt[]): Promise<void> => {
  console.log('Saving all prompts to Supabase:', prompts.length);
  
  try {
    // First, get existing prompts from Supabase
    const { data: existingPrompts, error: fetchError } = await supabase
      .from('prompts')
      .select('id');
    
    handleError(fetchError);
    console.log('Existing prompts in Supabase:', existingPrompts?.length || 0);
    
    // Create a set of existing IDs for quick lookup
    const existingIds = new Set((existingPrompts || []).map(p => p.id));
    
    // Separate prompts into those to create and those to update
    const promptsToCreate: NewPrompt[] = [];
    const promptsToUpdate: { id: string, data: PromptUpdate }[] = [];
    
    for (const prompt of prompts) {
      // If the prompt has an ID and exists in Supabase, update it
      if (prompt.id && existingIds.has(prompt.id)) {
        promptsToUpdate.push({
          id: prompt.id,
          data: {
            title: prompt.title,
            content: prompt.content,
            category: prompt.category
          }
        });
      } 
      // If the prompt doesn't have an ID or doesn't exist in Supabase, create it
      else {
        promptsToCreate.push({
          title: prompt.title,
          content: prompt.content,
          category: prompt.category
        });
      }
    }
    
    console.log(`Will create ${promptsToCreate.length} prompts and update ${promptsToUpdate.length} prompts`);
    
    // Create new prompts in a batch if there are any
    if (promptsToCreate.length > 0) {
      const { data: newPrompts, error: createError } = await supabase
        .from('prompts')
        .insert(promptsToCreate)
        .select();
      
      handleError(createError);
      console.log('Created prompts:', newPrompts?.length || 0);
    }
    
    // Update existing prompts one by one
    for (const { id, data } of promptsToUpdate) {
      const { error: updateError } = await supabase
        .from('prompts')
        .update(data)
        .eq('id', id);
      
      handleError(updateError);
    }
    
    console.log(`Saved ${promptsToCreate.length} new prompts and updated ${promptsToUpdate.length} existing prompts`);
  } catch (err) {
    console.error('Error saving prompts to Supabase:', err);
    throw err;
  }
};
