import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useCreateIncidentMutation } from '../../api/incidentApi';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'sonner';
import {
  Loader2, Upload, Shield, MapPin, AlignLeft,
  Tag, UserX, User, CheckCircle2, X, FileImage,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Schema (unchanged) ─────────────────────────────────── */
const reportFormSchema = z.object({
  category: z.enum([
    'THEFT', 'PHYSICAL_ASSAULT', 'SEXUAL_HARASSMENT', 'FIRE_OUTBREAK',
    'MEDICAL_EMERGENCY', 'PROPERTY_DAMAGE', 'CYBER_BULLYING',
    'INFRASTRUCTURE_ISSUE', 'OTHER',
  ]),
  location: z.string().min(3, 'Location is required'),
  description: z.string().min(10, 'Please provide more details'),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportIncidentDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const categories = [
  { value: 'THEFT',              label: 'Theft',               emoji: '🔓' },
  { value: 'PHYSICAL_ASSAULT',   label: 'Physical Assault',    emoji: '⚠️' },
  { value: 'SEXUAL_HARASSMENT',  label: 'Sexual Harassment',   emoji: '🚫' },
  { value: 'FIRE_OUTBREAK',      label: 'Fire Outbreak',       emoji: '🔥' },
  { value: 'MEDICAL_EMERGENCY',  label: 'Medical Emergency',   emoji: '🏥' },
  { value: 'PROPERTY_DAMAGE',    label: 'Property Damage',     emoji: '🏗️' },
  { value: 'CYBER_BULLYING',     label: 'Cyberbullying',       emoji: '💻' },
  { value: 'INFRASTRUCTURE_ISSUE', label: 'Infrastructure Issue', emoji: '🔧' },
  { value: 'OTHER',              label: 'Other',               emoji: '📋' },
];

export default function ReportIncidentDialog({ trigger, onSuccess }: ReportIncidentDialogProps) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { user } = useAuth();
  const [createIncident, { isLoading }] = useCreateIncidentMutation();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { category: 'THEFT', location: '', description: '' },
  });

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      form.reset();
      setFile(null);
      setIsAnonymous(false);
      setSubmitted(false);
    }, 300);
  };

  const onSubmit = async (values: ReportFormValues) => {
    const formData = new FormData();
    formData.append('category', values.category);
    formData.append('location', values.location);
    formData.append('description', values.description);
    formData.append('isAnonymous', String(isAnonymous));
    if (file) formData.append('attachment', file);

    try {
      await createIncident(formData).unwrap();
      setSubmitted(true);
      toast.success('Incident reported successfully! Thank you.');
      onSuccess?.();
    } catch {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="hero-btn-primary">
            <span className="hero-btn-pulse" />
            Report an Incident
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="rid-dialog">
        {/* Hidden default close — we render our own */}
        <DialogHeader className="sr-only">
          <DialogTitle>Report an Incident</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rid-success"
            >
              <div className="rid-success-icon">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="rid-success-title">Report Submitted</h3>
              <p className="rid-success-body">
                Your report has been received and routed to our campus security team.
                {user && !isAnonymous && ' You can track its status in My Reports.'}
              </p>
              <button onClick={handleClose} className="rid-success-btn">
                Done
              </button>
            </motion.div>
          ) : (
            /* ── Form state ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Header */}
              <div className="rid-header">
                <div className="rid-header-left">
                  <div className="rid-header-icon">
                    <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="rid-title">Report an Incident</h2>
                    <p className="rid-subtitle">All reports are handled with strict confidentiality</p>
                  </div>
                </div>
            
              </div>

              {/* Anonymous toggle (only when logged in) */}
              {user && (
                <div className={`rid-anon-bar ${isAnonymous ? 'rid-anon-bar--on' : ''}`}>
                  <div className="rid-anon-identity">
                    {isAnonymous
                      ? <UserX className="w-4 h-4 text-amber-500" />
                      : <User className="w-4 h-4 text-slate-400" />
                    }
                    <div>
                      <p className="rid-anon-name">
                        {isAnonymous ? 'Reporting anonymously' : `Reporting as ${user.name}`}
                      </p>
                      <p className="rid-anon-hint">
                        {isAnonymous
                          ? 'Your identity is hidden from security staff'
                          : 'You can track this report in My Reports'}
                      </p>
                    </div>
                  </div>
                  <div className="rid-anon-toggle-wrap">
                    <span className="rid-anon-label">Anonymous</span>
                    <Switch
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      className="rid-switch"
                    />
                  </div>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="rid-form" noValidate>

                {/* Category */}
                <div className="rid-field">
                  <Label className="rid-label">
                    <Tag className="w-3.5 h-3.5" />
                    Incident Category
                  </Label>
                  <Select
                    onValueChange={(v) => form.setValue('category', v as any)}
                    defaultValue={form.getValues('category')}
                  >
                    <SelectTrigger className="rid-select-trigger">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="rid-select-content">
                      {categories.map(({ value, label, emoji }) => (
                        <SelectItem key={value} value={value} className="rid-select-item">
                          <span className="rid-select-emoji">{emoji}</span>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="rid-field">
                  <Label htmlFor="rid-location" className="rid-label">
                    <MapPin className="w-3.5 h-3.5" />
                    Location
                  </Label>
                  <div className="rid-input-wrap">
                    <MapPin className="rid-input-icon" />
                    <Input
                      id="rid-location"
                      placeholder="e.g. Hostel Block B, Computer Lab A"
                      {...form.register('location')}
                      className="rid-input rid-input--icon"
                      aria-invalid={!!form.formState.errors.location}
                    />
                  </div>
                  {form.formState.errors.location && (
                    <p className="rid-error">
                      <AlertTriangle className="w-3 h-3" />
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="rid-field">
                  <Label htmlFor="rid-description" className="rid-label">
                    <AlignLeft className="w-3.5 h-3.5" />
                    Description
                    <span className="rid-label-hint">Be as specific as possible</span>
                  </Label>
                  <Textarea
                    id="rid-description"
                    rows={4}
                    placeholder="Describe what happened — include time, people involved, and any other relevant details..."
                    {...form.register('description')}
                    className="rid-textarea"
                    aria-invalid={!!form.formState.errors.description}
                  />
                  {form.formState.errors.description && (
                    <p className="rid-error">
                      <AlertTriangle className="w-3 h-3" />
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                {/* File upload */}
                <div className="rid-field">
                  <Label className="rid-label">
                    <FileImage className="w-3.5 h-3.5" />
                    Attachment
                    <span className="rid-label-optional">Optional — photo or PDF</span>
                  </Label>
                  <div
                    className={`rid-dropzone ${file ? 'rid-dropzone--has-file' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('rid-file-input')?.click()}
                  >
                    <input
                      id="rid-file-input"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    {file ? (
                      <div className="rid-file-preview">
                        <FileImage className="w-5 h-5 text-amber-500" />
                        <span className="rid-file-name">{file.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="rid-file-remove"
                          aria-label="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="rid-dropzone-idle">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="rid-dropzone-text">
                          Drag & drop or <span className="rid-dropzone-link">browse files</span>
                        </span>
                        <span className="rid-dropzone-hint">JPG, PNG, PDF up to 10 MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rid-submit-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}