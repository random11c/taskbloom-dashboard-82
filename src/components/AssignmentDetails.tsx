import { Assignment } from "@/types/assignment";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import AssigneeDisplay from "./AssigneeDisplay";
import { FileText, Paperclip } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";

interface AssignmentDetailsProps {
  assignment: Assignment;
  isAdmin: boolean;
}

interface FileAttachment {
  id: string;
  filename: string;
  content_type: string;
  file_path: string;
}

export const AssignmentDetails = ({ assignment, isAdmin }: AssignmentDetailsProps) => {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttachments();
  }, [assignment.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('assignment_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: dbError } = await supabase
        .from('assignment_attachments')
        .insert({
          assignment_id: assignment.id,
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          size: file.size,
          created_by: user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been attached to the assignment.`
      });

      fetchAttachments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchAttachments = async () => {
    const { data, error } = await supabase
      .from('assignment_attachments')
      .select('id, filename, content_type, file_path')
      .eq('assignment_id', assignment.id);

    if (error) {
      console.error('Error fetching attachments:', error);
      return;
    }

    setAttachments(data);
  };

  const downloadFile = async (attachment: FileAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignment_attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <AssigneeDisplay assignees={assignment.assignees} />
          <span className="text-sm text-gray-500">
            Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
          </span>
        </div>
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id={`file-upload-${assignment.id}`}
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`file-upload-${assignment.id}`)?.click()}
              disabled={isUploading}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach File
            </Button>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
          <div className="grid gap-2">
            {attachments.map((attachment) => (
              <button
                key={attachment.id}
                onClick={() => downloadFile(attachment)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 text-left w-full"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{attachment.filename}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};