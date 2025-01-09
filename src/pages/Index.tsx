import { useState } from "react";
import { Search } from "lucide-react";
import PromptCard from "@/components/PromptCard";
import AddPromptDialog from "@/components/AddPromptDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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

const CATEGORIES = [
  "All",
  "General",
  "Writing",
  "Programming",
  "Marketing",
  "Business",
  "Creative",
  "Academic",
  "Other",
];

const Index = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();

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
    toast({
      title: "Prompt updated",
      description: "Your prompt has been updated successfully.",
    });
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter((prompt) => prompt.id !== id));
    toast({
      title: "Prompt deleted",
      description: "Your prompt has been removed from the library.",
    });
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Prompt Library</h1>
          <AddPromptDialog onAdd={handleAddPrompt} />
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
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>

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