import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch'; // We'll add this component later if needed
import { useCreateIncidentMutation } from '../../api/incidentApi';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'sonner';
//import type { ReportIncidentInput } from '@csirs/shared';
import { Loader2, Upload } from 'lucide-react';

const reportFormSchema = z.object({
  category: z.enum(['THEFT', 'PHYSICAL_ASSAULT', 'SEXUAL_HARASSMENT', 'FIRE_OUTBREAK', 'MEDICAL_EMERGENCY', 'PROPERTY_DAMAGE', 'CYBER_BULLYING', 'INFRASTRUCTURE_ISSUE', 'OTHER']),
  location: z.string().min(3, 'Location is required'),
  description: z.string().min(10, 'Please provide more details'),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportIncidentDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function ReportIncidentDialog({ trigger, onSuccess }: ReportIncidentDialogProps) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const { user } = useAuth();
  const [createIncident, { isLoading }] = useCreateIncidentMutation();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      category: 'THEFT',
      location: '',
      description: '',
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    const formData = new FormData();
    formData.append('category', values.category);
    formData.append('location', values.location);
    formData.append('description', values.description);
    formData.append('isAnonymous', String(isAnonymous));   // ← NEW: Send the toggle state
    if (file) {
      formData.append('attachment', file);
    }

    try {
      await createIncident(formData).unwrap();
      toast.success('Incident reported successfully! Thank you.');
      form.reset();
      setFile(null);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="bg-accent hover:bg-orange-600 text-black font-semibold px-10 py-7 text-lg rounded-2xl shadow-lg">
            Report an Incident Now
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Report an Incident</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {user && (
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="font-medium">Report as {user.name}</p>
                <p className="text-sm text-muted-foreground">You will be able to track this report</p>
              </div>
              <Switch 
                checked={isAnonymous} 
                onCheckedChange={setIsAnonymous} 
              />
              <span className="text-sm">Anonymous</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(value) => form.setValue('category', value as any)} defaultValue={form.getValues('category')}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>

                <SelectItem value="THEFT">Theft</SelectItem>
                <SelectItem value="PHYSICAL_ASSAULT">Physical Assault</SelectItem>
                <SelectItem value="SEXUAL_HARASSMENT">Sexual Harassment</SelectItem>
                <SelectItem value="FIRE_OUTBREAK">Fire Outbreak</SelectItem>
                <SelectItem value="MEDICAL_EMERGENCY">Medical Emergency</SelectItem>
                <SelectItem value="PROPERTY_DAMAGE">Property Damage</SelectItem>
                <SelectItem value="CYBER_BULLYING">Cyberbullying</SelectItem>
                <SelectItem value="INFRASTRUCTURE_ISSUE">Infrastructure Issue</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              placeholder="e.g. Hostel Block B, Lab A" 
              {...form.register('location')} 
            />
            {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              rows={5}
              placeholder="Provide as much detail as possible..." 
              {...form.register('description')} 
            />
            {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Attachment (Optional - Photo or PDF)</Label>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center">
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="file-upload"
                accept="image/*,.pdf"
              />
              <label htmlFor="file-upload" className="cursor-pointer text-sm text-primary hover:underline">
                {file ? file.name : 'Click to upload evidence'}
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}