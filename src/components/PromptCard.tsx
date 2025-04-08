import { useState } from "react";
import { Copy, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditPromptDialog from "./EditPromptDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { type Prompt } from "@/services/api";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (id: string, title: string, content: string, category: string) => void;
  onDelete: (id: string) => void;
}

const PromptCard = ({ prompt, onEdit, onDelete }: PromptCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  return (
    <>
      <Card className="group relative hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-md">{prompt.title}</CardTitle>
              <Badge variant="secondary">{prompt.category}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this prompt? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(prompt.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {prompt.content}
          </p>
        </CardContent>
      </Card>

      <EditPromptDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        prompt={prompt}
        onEdit={(title, content, category) =>
          onEdit(prompt.id, title, content, category)
        }
      />
    </>
  );
};

export default PromptCard;