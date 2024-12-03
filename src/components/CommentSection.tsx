import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

interface CommentSectionProps {
  assignmentId: string;
}

interface Comment {
  id: string;
  content: string;
  assignment_id: string;
  author_id: string;
  created_at: string;
  author: {
    name: string;
    avatar: string | null;
  };
}

const CommentSection = ({ assignmentId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(name, avatar)
        `)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            assignment_id: assignmentId,
            author_id: session.user.id,
          },
        ])
        .select(`
          *,
          author:profiles(name, avatar)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', assignmentId] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      setNewComment("");
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      <h4 className="font-medium text-sm text-gray-700">Comments</h4>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px]"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={addCommentMutation.isPending}
        >
          {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
        </Button>
      </form>

      <div className="space-y-3 mt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}`}
                alt={comment.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-gray-500 text-xs">
                {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;