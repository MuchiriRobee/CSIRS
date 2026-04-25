import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, MessageSquare, MapPin, ShieldAlert, User } from 'lucide-react';
import { format } from 'date-fns';
import { useGetIncidentCommentsQuery, useAddCommentMutation } from '../../api/incidentApi';
import { useAuth } from '../../providers/AuthProvider';   // ← NEW
type Incident = {
  id: string;
  category: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
  reporter?: { name: string; email: string; phone?: string };
};

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function IncidentDetailDialog({
  incident,
  open,
  onOpenChange,
  onSuccess,
}: IncidentDetailDialogProps) {
  const [newComment, setNewComment] = useState('');
  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  
  const { data: commentsResponse } = useGetIncidentCommentsQuery(
    incident?.id || '',
    { skip: !incident?.id }
  );

  const comments = commentsResponse?.data || [];

const { user } = useAuth();

  const handleAddComment = async () => {
    if (!incident || !newComment.trim()) return;

    try {
      await addComment({
        incidentId: incident.id,
        content: newComment.trim(),
      }).unwrap();

      setNewComment('');
      onSuccess?.(); // Optional callback
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col mr-dialog">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <DialogTitle className="mr-dialog-title text-xl">
              Incident #{incident.id.slice(-8)}
            </DialogTitle>
          </div>
          <DialogDescription className="mr-dialog-desc">
            Reported on {format(new Date(incident.createdAt), 'dd MMMM yyyy • HH:mm')}
          </DialogDescription>
        </DialogHeader>

        {/* Incident Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span className="mr-info-label">Category</span>
              </div>
              <p className="mr-info-value font-medium">
                {incident.category.replace(/_/g, ' ')}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="mr-info-label">Location</span>
              </div>
              <p className="mr-info-value">{incident.location}</p>
            </div>
          </div>

          <div>
            <span className="mr-info-label">Description</span>
            <p className="mr-info-value whitespace-pre-wrap mt-1 leading-relaxed">
              {incident.description}
            </p>
          </div>

          <div>
            <span className="mr-info-label">Status</span>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              incident.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
              incident.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {incident.status}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t p-6 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h3>
          </div>

          {/* Scrollable Comments Table */}
          <div className="flex-1 overflow-y-auto border rounded-lg bg-slate-50 mb-4">
            {comments.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Author</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Comment</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comments.map((comment: any) => (
                    <tr key={comment.id} className="hover:bg-white">
                      <td className="px-4 py-3 text-sm font-medium">
                        {comment.author?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm">{comment.content}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 text-right whitespace-nowrap">
                        {format(new Date(comment.createdAt), 'dd MMM HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                <p>No comments yet. Be the first to comment.</p>
              </div>
            )}
          </div>

         {/* Current User Info */}
          {user && (
            <div className="mb-3 px-1 flex items-center gap-2 text-xs text-slate-500">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-3 h-3" />   {/* Add User icon import if needed */}
              </div>
              <span>Commenting as <strong>{user.name}</strong></span>
            </div>
          )}

          {/* Add Comment Input */}
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="mr-comment-input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              disabled={isAdding}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAdding}
              className="mr-comment-send-btn px-6"
            >
              {isAdding ? 'Sending...' : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}