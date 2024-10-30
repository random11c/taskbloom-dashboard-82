import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Comment } from "@/types/project";
import { format } from "date-fns";

interface CommentSectionProps {
  comments: Comment[];
  assignmentId: string;
  onAddComment: (content: string) => void;
}

const CommentSection = ({ comments, assignmentId, onAddComment }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

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
        <Button type="submit" size="sm">Add Comment</Button>
      </form>

      <div className="space-y-3 mt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}`}
                alt={comment.authorName}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-gray-500 text-xs">
                {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
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