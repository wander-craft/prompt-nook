import { useState } from "react";
import { Search } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import AddPromptDialog from "@/components/AddPromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
}

const Index = () => {
  const [prompts, setPrompts] = usePersistedState<Prompt[]>("prompts", []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = usePersistedState<string[]>("categories", ["General"]);
  const { toast } = useToast();

  const exportData = () => {
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
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.prompts && data.categories) {
            setPrompts(data.prompts);
            setCategories(data.categories);
            toast({
              title: "Import successful",
              description: "Your prompts and categories have been imported"
            });
          } else {
            throw new Error("Invalid data format");
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "The file format is invalid",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredPrompts = prompts.filter(
    (prompt) =>
      (selectedCategory === "All" || prompt.category === selectedCategory) &&
      (prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddPrompt = (title: string, content: string, category: string) => {
    const newPrompt = {
      id: crypto.randomUUID(),
      title,
      content,
      category,
    };
    setPrompts([...prompts, newPrompt]);
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
    toast({
      title: "Prompt added",
      description: "Your prompt has been added to the library.",
    });
  };

  const handleEditPrompt = (
    id: string,
    title: string,
    content: string,
    category: string
  ) => {
    setPrompts(
      prompts.map((prompt) =>
        prompt.id === id ? { ...prompt, title, content, category } : prompt
      )
    );
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
    toast({
      title: "Prompt updated",
      description: "Your prompt has been updated successfully.",
    });
  };

  const handleDeletePrompt = (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    setPrompts(prompts.filter((prompt) => prompt.id !== id));
    
    // Remove category if it's not used by any other prompt
    if (prompt) {
      const categoryStillInUse = prompts.some(
        (p) => p.id !== id && p.category === prompt.category
      );
      if (!categoryStillInUse) {
        setCategories(categories.filter((cat) => cat !== prompt.category));
      }
    }
    
    toast({
      title: "Prompt deleted",
      description: "Your prompt has been removed from the library.",
    });
  };

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
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">IDE Prompt Library</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={exportData}>
              Export
            </Button>
            <div className="relative">
              <input
                type="file"
                onChange={importData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".json"
              />
              <Button variant="outline">Import</Button>
            </div>
            <AddPromptDialog onAdd={handleAddPrompt} categories={categories} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
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

        {Object.entries(groupedPrompts).map(([category, prompts]) => (
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
        ))}
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