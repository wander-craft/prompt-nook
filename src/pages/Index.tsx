import { useState, useEffect } from "react";
import { Search, Save, Upload, Download, Plus, Menu, MoreVertical } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import AddPromptDialog from "@/components/AddPromptDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPrompts, createPrompt, updatePrompt, deletePrompt, getCategories, saveAllPrompts, type Prompt } from "@/services/api";

const Index = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["General"]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
    fetchCategories();
  }, []);

  const fetchPrompts = async () => {
    try {
      console.log('Fetching prompts from Supabase...');
      const data = await getPrompts();
      console.log('Fetched prompts:', data.length);
      setPrompts(data);
      return data; // Return the data for cases where we need it
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prompts",
        variant: "destructive",
      });
      return []; // Return empty array in case of error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.length > 0 ? data : ["General"]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const handleAddPrompt = async (title: string, content: string, category: string) => {
    try {
      console.log('Adding prompt:', { title, content, category });
      const newPrompt = await createPrompt({ title, content, category });
      console.log('Response:', newPrompt);
      setPrompts([newPrompt, ...prompts]);
      if (!categories.includes(category)) {
        setCategories([...categories, category]);
      }
      setLastUpdated(new Date().toISOString());
      setUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Prompt added successfully",
      });
    } catch (error) {
      console.error('Error adding prompt:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add prompt",
        variant: "destructive",
      });
    }
  };

  const handleEditPrompt = async (id: string, title: string, content: string, category: string) => {
    try {
      const updatedPrompt = await updatePrompt(id, { title, content, category });
      setPrompts(prompts.map(p => p.id === id ? updatedPrompt : p));
      if (!categories.includes(category)) {
        setCategories([...categories, category]);
      }
      setLastUpdated(new Date().toISOString());
      setUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Prompt updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      });
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      setLastUpdated(new Date().toISOString());
      setUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedPrompts = filteredPrompts.reduce((acc, prompt) => {
    const category = prompt.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  return (
    <div className="min-h-screen p-8 bg-[url('/images/app-bg.jpeg')] bg-cover bg-center bg-fixed">
      <div className="max-w-5xl mx-auto space-y-8 bg-background/95 p-8 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-[24px] sm:text-4xl font-bold text-center sm:text-left">IDE Chat: Prompt Library</h1>
          
          {/* Mobile dropdown menu */}
          <div className="flex md:hidden justify-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => {
                  const data = {
                    prompts,
                    categories
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'prompt-nook-data.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast({
                    title: "Export successful",
                    description: "Your prompts and categories have been exported"
                  });
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <div className="relative w-full">
                    <input
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (e) => {
                            try {
                              const data = JSON.parse(e.target?.result as string);
                              console.log('Imported data:', data);
                              
                              if (data.prompts && data.categories) {
                                // First, show a loading toast
                                toast({
                                  title: "Importing prompts",
                                  description: "Please wait while we save your prompts..."
                                });
                                
                                // Prepare imported prompts - ensure they don't have conflicting IDs
                                const importedPrompts = data.prompts.map((prompt: any) => ({
                                  // Remove id to ensure we create new prompts in Supabase
                                  title: prompt.title || 'Untitled Prompt',
                                  content: prompt.content || '',
                                  category: prompt.category || 'General'
                                }));
                                
                                console.log('Prepared imported prompts:', importedPrompts.length);
                                
                                // Save each prompt individually to ensure they're properly saved
                                for (const prompt of importedPrompts) {
                                  try {
                                    console.log('Creating individual prompt:', prompt.title);
                                    await createPrompt(prompt);
                                  } catch (promptError) {
                                    console.error('Error creating individual prompt:', promptError);
                                  }
                                }
                                
                                // Then fetch the latest data from Supabase
                                const updatedPrompts = await fetchPrompts();
                                console.log('Fetched prompts after import:', updatedPrompts.length);
                                
                                // Update categories
                                const uniqueCategories = [...new Set([...categories, ...data.categories])];
                                setCategories(uniqueCategories);
                                setUnsavedChanges(false);
                                setLastUpdated(new Date().toISOString());
                                
                                toast({
                                  title: "Import successful",
                                  description: `${importedPrompts.length} prompts have been imported and saved to database`
                                });
                              } else {
                                throw new Error("Invalid data format");
                              }
                            } catch (error) {
                              console.error('Error importing prompts:', error);
                              toast({
                                title: "Import failed",
                                description: error instanceof Error ? error.message : "The file format is invalid",
                                variant: "destructive"
                              });
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".json"
                    />
                    <div className="flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={async () => {
                  try {
                    // Save all prompts to Supabase
                    console.log('Saving all prompts via Save button...');
                    await saveAllPrompts(prompts);
                    
                    // Refresh prompts from the database to ensure we have the latest data
                    const updatedPrompts = await fetchPrompts();
                    console.log('Refreshed prompts after save:', updatedPrompts.length);
                    
                    setUnsavedChanges(false);
                    setLastUpdated(new Date().toISOString());
                    toast({
                      title: "Success",
                      description: "All prompts saved successfully to database",
                    });
                  } catch (error) {
                    console.error('Error saving prompts:', error);
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to save prompts",
                      variant: "destructive",
                    });
                  }
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </DropdownMenuItem>
                
                <AddPromptDialog
                  categories={categories}
                  onAdd={(title, content, category) => {
                    handleAddPrompt(title, content, category);
                    setUnsavedChanges(true);
                  }}
                  customTrigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Prompt
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden md:flex flex-row items-center justify-end gap-4 w-full md:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
              const data = {
                prompts,
                categories
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'prompt-nook-data.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast({
                title: "Export successful",
                description: "Your prompts and categories have been exported"
              });
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <div className="relative w-full sm:w-auto">
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      try {
                        const data = JSON.parse(e.target?.result as string);
                        console.log('Imported data:', data);
                        
                        if (data.prompts && data.categories) {
                          // First, show a loading toast
                          toast({
                            title: "Importing prompts",
                            description: "Please wait while we save your prompts..."
                          });
                          
                          // Prepare imported prompts - ensure they don't have conflicting IDs
                          const importedPrompts = data.prompts.map((prompt: any) => ({
                            // Remove id to ensure we create new prompts in Supabase
                            title: prompt.title || 'Untitled Prompt',
                            content: prompt.content || '',
                            category: prompt.category || 'General'
                          }));
                          
                          console.log('Prepared imported prompts:', importedPrompts.length);
                          
                          // Save each prompt individually to ensure they're properly saved
                          for (const prompt of importedPrompts) {
                            try {
                              console.log('Creating individual prompt:', prompt.title);
                              await createPrompt(prompt);
                            } catch (promptError) {
                              console.error('Error creating individual prompt:', promptError);
                            }
                          }
                          
                          // Then fetch the latest data from Supabase
                          const updatedPrompts = await fetchPrompts();
                          console.log('Fetched prompts after import:', updatedPrompts.length);
                          
                          // Update categories
                          const uniqueCategories = [...new Set([...categories, ...data.categories])];
                          setCategories(uniqueCategories);
                          setUnsavedChanges(false);
                          setLastUpdated(new Date().toISOString());
                          
                          toast({
                            title: "Import successful",
                            description: `${importedPrompts.length} prompts have been imported and saved to database`
                          });
                        } else {
                          throw new Error("Invalid data format");
                        }
                      } catch (error) {
                        console.error('Error importing prompts:', error);
                        toast({
                          title: "Import failed",
                          description: error instanceof Error ? error.message : "The file format is invalid",
                          variant: "destructive"
                        });
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".json"
              />
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
            <Button
              variant="outline" 
              className="flex items-center gap-2 w-full sm:w-auto"
              onClick={async () => {
                try {
                  // Save all prompts to Supabase
                  console.log('Saving all prompts via Save button...');
                  await saveAllPrompts(prompts);
                  
                  // Refresh prompts from the database to ensure we have the latest data
                  const updatedPrompts = await fetchPrompts();
                  console.log('Refreshed prompts after save:', updatedPrompts.length);
                  
                  setUnsavedChanges(false);
                  setLastUpdated(new Date().toISOString());
                  toast({
                    title: "Success",
                    description: "All prompts saved successfully to database",
                  });
                } catch (error) {
                  console.error('Error saving prompts:', error);
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to save prompts",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <AddPromptDialog
              categories={categories}
              onAdd={(title, content, category) => {
                handleAddPrompt(title, content, category);
                setUnsavedChanges(true);
              }}
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground bg-muted p-2 rounded-md">
          <p><strong>Note:</strong> All prompts are now stored in Supabase. Use the Save button to ensure your changes are saved to the database.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'} • Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          Object.entries(groupedPrompts).map(([category, prompts]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-md font-normal">{category}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {prompts.length === 0
              ? "No prompts yet. Add your first prompt!"
              : "No prompts found matching your search."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;