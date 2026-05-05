import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '../ui/dialog';
import {
  Send, MessageSquare, MapPin, ShieldAlert,
  User, Calendar, Tag, FileText, Clock, FileImage,  Pencil, X, Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAddCommentMutation, useGetIncidentDetailsQuery, useUpdateOwnIncidentMutation } from '../../api/incidentApi';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


/* ── Types ──────────────────────────────────────────────── */
type Incident = {
  id: string;
  category: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
  reporter?: { name: string; email: string; phone?: string } | null;
  isAnonymous?: boolean;
  reporterId?: string | null;
};

interface Props {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/* ── Status config ──────────────────────────────────────── */
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:     { label: 'Pending',     cls: 'idd-status idd-status--amber' },
  IN_PROGRESS: { label: 'In Progress', cls: 'idd-status idd-status--blue'  },
  RESOLVED:    { label: 'Resolved',    cls: 'idd-status idd-status--green' },
  CLOSED:      { label: 'Closed',      cls: 'idd-status idd-status--slate' },
};

/* ── Detail row helper ──────────────────────────────────── */
function DetailItem({ icon: Icon, label, children }: {
  icon: any; label: string; children: React.ReactNode;
}) {
  return (
    <div className="idd-detail-item">
      <div className="idd-detail-label">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="idd-detail-value">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function IncidentDetailDialog({ incident, open, onOpenChange, onSuccess }: Props) {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ category: '', location: '', description: '' });

  const [updateOwnIncident, { isLoading: isSaving }] = useUpdateOwnIncidentMutation();
  const { user } = useAuth();

  const [addComment, { isLoading: isAdding }] = useAddCommentMutation();
  const { data: incidentResponse, isLoading: commentsLoading } = useGetIncidentDetailsQuery(
    incident?.id || '',
    { skip: !incident?.id || !open }
  );

  // Backend returns newest first (orderBy: createdAt desc)
 const fullIncident = incidentResponse?.data;
const comments = fullIncident?.comments || [];
const attachments = fullIncident?.attachments || [];

  const handleAddComment = async () => {
    if (!incident || !newComment.trim()) return;
    try {
      await addComment({ incidentId: incident.id, content: newComment.trim() }).unwrap();
      setNewComment('');
      toast.success('Comment added');
      onSuccess?.();
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleEditOpen = () => {
    if (!incident) return;
  setEditForm({
    category: incident.category,
    location: incident.location,
    description: incident.description,
  });
  setIsEditing(true);
};

const handleEditSave = async () => {
  if (!incident) return;
  try {
    await updateOwnIncident({ id: incident.id, ...editForm }).unwrap();
    toast.success('Incident updated successfully');
    setIsEditing(false);
    onSuccess?.();
  } catch {
    toast.error('Failed to update incident');
  }
};

  if (!incident) return null;

  const statusCfg = STATUS_CFG[incident.status] ?? { label: incident.status, cls: 'idd-status idd-status--slate' };
  const isAnon = !incident.reporterId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="idd-dialog">
        {/* Hidden a11y title for screen readers */}
        <DialogHeader className="sr-only">
          <DialogTitle>Incident Details</DialogTitle>
          <DialogDescription>Full incident report and comments</DialogDescription>
        </DialogHeader>

        {/* ── Custom header ── */}
        <div className="idd-header">
          <div className="idd-header-left">
            <div className="idd-header-icon">
              <ShieldAlert className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="idd-title">Incident Report</h2>
              <p className="idd-subtitle">
                <Calendar className="w-3 h-3" />
                {format(new Date(incident.createdAt), 'dd MMMM yyyy • HH:mm')}
              </p>
            </div>
          </div>

          <div className="idd-header-right">
            <span className={statusCfg.cls}>{statusCfg.label}</span>
          
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="idd-body">

          {/* ── Incident details grid ── */}
          <div className="idd-details-section">
            <p className="idd-section-label">Incident Details</p>

            <div className="idd-details-grid">
              <DetailItem icon={Tag} label="Category">
                <span className="idd-category-text">
                  {incident.category.replace(/_/g, ' ')}
                </span>
              </DetailItem>

              <DetailItem icon={MapPin} label="Location">
                {incident.location}
              </DetailItem>

              <DetailItem icon={User} label="Reporter">
                {isAnon ? (
                  <span className="idd-anon-label">Anonymous</span>
                ) : (
                  <div className="idd-reporter-wrap">
                    <div className="idd-reporter-avatar">
                      {incident.reporter?.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="idd-reporter-name">{incident.reporter?.name ?? '—'}</p>
                      {incident.reporter?.email && (
                        <p className="idd-reporter-email">{incident.reporter.email}</p>
                      )}
                    </div>
                  </div>
                )}
              </DetailItem>

              <DetailItem icon={Clock} label="Reported On">
                {format(new Date(incident.createdAt), 'dd MMM yyyy, HH:mm')}
              </DetailItem>
            </div>

            <DetailItem icon={FileText} label="Description">
              <p className="idd-description">{incident.description}</p>
            </DetailItem>
            {/* ── Edit form overlay (renders inside body, replaces details section visually) ── */}
<AnimatePresence>
  {isEditing && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="idd-edit-overlay"
    >
      <div className="idd-edit-header">
        <div className="idd-edit-header-left">
          <Pencil className="w-4 h-4 text-amber-500" />
          <span className="idd-edit-title">Edit Incident Details</span>
        </div>
        <button onClick={() => setIsEditing(false)} className="idd-close-btn" aria-label="Cancel edit">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="idd-edit-form">
        {/* Category */}
        <div className="idd-edit-field">
          <label className="idd-edit-label">
            <Tag className="w-3.5 h-3.5" /> Category
          </label>
          <Select value={editForm.category} onValueChange={(v) => setEditForm(f => ({ ...f, category: v }))}>
            <SelectTrigger className="idd-edit-select-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                ['THEFT',               'Theft'],
                ['PHYSICAL_ASSAULT',    'Physical Assault'],
                ['SEXUAL_HARASSMENT',   'Sexual Harassment'],
                ['FIRE_OUTBREAK',       'Fire Outbreak'],
                ['MEDICAL_EMERGENCY',   'Medical Emergency'],
                ['PROPERTY_DAMAGE',     'Property Damage'],
                ['CYBER_BULLYING',      'Cyberbullying'],
                ['INFRASTRUCTURE_ISSUE','Infrastructure Issue'],
                ['OTHER',               'Other'],
              ].map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="idd-edit-field">
          <label className="idd-edit-label">
            <MapPin className="w-3.5 h-3.5" /> Location
          </label>
          <input
            type="text"
            value={editForm.location}
            onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
            className="idd-edit-input"
            placeholder="e.g. Hostel Block B, Lab A"
          />
        </div>

        {/* Description */}
        <div className="idd-edit-field">
          <label className="idd-edit-label">
            <FileText className="w-3.5 h-3.5" /> Description
          </label>
          <textarea
            value={editForm.description}
            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
            className="idd-edit-textarea"
            rows={4}
            placeholder="Describe what happened..."
          />
        </div>

        {/* Actions */}
        <div className="idd-edit-actions">
          <button onClick={() => setIsEditing(false)} className="idd-edit-cancel-btn">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleEditSave}
            disabled={isSaving || !editForm.location.trim() || !editForm.description.trim()}
            className="idd-edit-save-btn"
          >
            {isSaving
              ? <><span className="idd-send-spinner" /> Saving…</>
              : <><Check className="w-3.5 h-3.5" /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

{/* ── Edit button — only show for reporter's own non-closed incidents ── */}
{!isEditing && user && user.role === 'REPORTER' && incident.reporterId && incident.status !== 'CLOSED' && incident.status !== 'RESOLVED' && (
  <div className="idd-edit-trigger-row">
    <button onClick={handleEditOpen} className="idd-edit-trigger-btn">
      <Pencil className="w-3.5 h-3.5" />
      Edit Report Details
    </button>
  </div>
)}
          </div>

{/* Attachments Section */}
{attachments.length > 0 && (
  <div className="idd-details-section">
    <p className="idd-section-label">Attachments ({attachments.length})</p>
    <div className="idd-attachments-grid">
      {attachments.map((att: any) => {
        const isImage = att.mimeType?.startsWith('image/');
        const fileUrl = att.filePath; // This should already be the Cloudinary secure_url
        return (
          <a
            key={att.id}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="idd-attachment-card"
            title={`Open ${att.fileName}`}
          >
            {isImage ? (
              <div className="idd-attachment-preview">
                <img
                  src={fileUrl}
                  alt={att.fileName}
                  className="idd-attachment-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="idd-attachment-fallback hidden">
                  <FileImage className="w-8 h-8 text-slate-300" />
                </div>
              </div>
            ) : (
              <div className="idd-attachment-preview idd-attachment-preview--file">
                <FileImage className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div className="idd-attachment-info">
              <p className="idd-attachment-name">{att.fileName}</p>
              <p className="idd-attachment-meta">
                {att.mimeType?.split('/')[1]?.toUpperCase() ?? 'FILE'}
                {att.size ? ` · ${(att.size / (1024 * 1024)).toFixed(2)} MB` : ''}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  </div>
)}

          {/* ── Comments section ── */}
          <div className="idd-comments-section">

            {/* Section header */}
            <div className="idd-comments-header">
              <div className="idd-comments-title-row">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span className="idd-comments-title">Comments</span>
                <span className="idd-comment-count">{comments.length}</span>
              </div>
              <p className="idd-comments-sub">Newest first · visible to all parties</p>
            </div>

            {/* Comments list */}
            <div className="idd-comments-list">
              {commentsLoading ? (
                <div className="idd-comments-loading">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="idd-comment-skeleton" />
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <AnimatePresence initial={false}>
                  {comments.map((comment: any, i: number) => {
                    const isCurrentUser = comment.author?.id === user?.id;
                    const isAdmin = comment.author?.role === 'ADMIN';
                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.28 }}
                        className={`idd-comment ${isCurrentUser ? 'idd-comment--mine' : ''}`}
                      >
                        <div className={`idd-comment-avatar ${isAdmin ? 'idd-comment-avatar--admin' : ''}`}>
                          {comment.author?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="idd-comment-body">
                          <div className="idd-comment-meta">
                            <span className="idd-comment-author">
                              {comment.author?.name ?? 'Unknown'}
                              {isCurrentUser && <span className="idd-comment-you">you</span>}
                              {isAdmin && !isCurrentUser && (
                                <span className="idd-comment-admin-tag">Admin</span>
                              )}
                            </span>
                            <span className="idd-comment-time">
                              {format(new Date(comment.createdAt), 'dd MMM · HH:mm')}
                            </span>
                          </div>
                          <p className="idd-comment-text">{comment.content}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <div className="idd-comments-empty">
                  <MessageSquare className="w-8 h-8 text-slate-200" />
                  <p className="idd-empty-title">No comments yet</p>
                  <p className="idd-empty-sub">Be the first to add a note on this incident.</p>
                </div>
              )}
            </div>

            {/* Add comment */}
            {user && (
              <div className="idd-add-comment">
                <div className="idd-commenter-row">
                  <div className="idd-commenter-avatar">
                    {user.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="idd-commenter-label">
                    Commenting as <strong>{user.name}</strong>
                  </span>
                </div>
                <div className="idd-input-row">
                  <div className="idd-input-wrap">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      placeholder="Write a comment… (Enter to send, Shift+Enter for new line)"
                      className="idd-textarea"
                      rows={2}
                      disabled={isAdding}
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAdding}
                    className="idd-send-btn"
                    aria-label="Send comment"
                  >
                    {isAdding
                      ? <span className="idd-send-spinner" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}