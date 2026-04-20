import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { reportIncidentSchema } from '@csirs/shared/schemas';
import { useCreateIncidentMutation } from '@/api/incidentApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Send } from 'lucide-react';

type FormData = z.infer<typeof reportIncidentSchema> & {
  attachments?: FileList;   // ← Add this for file handling
};
export default function ReportIncident() {
  const [isLoggedInMode, setIsLoggedInMode] = useState(false);
  const [createIncident, { isLoading }] = useCreateIncidentMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(reportIncidentSchema),
    defaultValues: { category: 'OTHER' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('description', data.description);

      // Handle attachments safely
      if (data.attachments && data.attachments.length > 0) {
        Array.from(data.attachments).forEach((file) => {
          formData.append('attachments', file);
        });
      }

      await createIncident(formData).unwrap();
      toast.success('Incident reported successfully!');
      reset();

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to report incident');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Report an Incident</CardTitle>
          <CardDescription>
            Your report helps keep our campus safe. Choose to stay anonymous or report as a logged-in user.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Toggle: Anonymous vs Logged-in */}
          <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">Report as Logged-in User</p>
              <p className="text-sm text-gray-500">You can track your report later</p>
            </div>
            <Switch checked={isLoggedInMode} onCheckedChange={setIsLoggedInMode} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Category</Label>
              <Select {...register('category')}>
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
                  <SelectItem value="CYBER_BULLYING">Cyber Bullying</SelectItem>
                  <SelectItem value="INFRASTRUCTURE_ISSUE">Infrastructure Issue</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location</Label>
              <Input {...register('location')} placeholder="e.g. Computer Lab Block A" />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...register('description')} rows={5} placeholder="Describe what happened..." />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>

            {/* Optional file upload */}
            <div>
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Attachments (optional - max 5 files)
              </Label>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                {...register('attachments' as any)}   // bypass Zod since files are not in schema
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full text-lg" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Report'}
              <Send className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}