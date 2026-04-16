import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import env, { MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME, FRONTEND_URL } from '../config/index.js';
import { IncidentStatus } from '@csirs/shared/types';
import { userRepository } from '../repositories/user.repository.js';

const mailerSend = new MailerSend({
  apiKey: env.MAILERSEND_API_KEY || '',
});

// Dynamic sender using .env (easy to change per institution)
const fromEmail = new Sender(MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME);

export class NotificationService {
  /**
   * Notify admins when a new incident is reported
   */
static async sendNewIncidentNotification(incident: any) {
    if (!env.MAILERSEND_API_KEY) {
      console.warn('⚠️ MAILERSEND_API_KEY not set - skipping email notification');
      return;
    }

    // Fetch all admin users dynamically
    const admins = await userRepository.findAllAdmins();

    if (admins.length === 0) {
      console.warn('⚠️ No admin users found in database - skipping notification');
      return;
    }

    const emailParams = new EmailParams()
      .setFrom(fromEmail)
      .setSubject(`New Incident Reported - ${incident.category}`)
      .setHtml(`
        <h2>New Safety Incident Reported</h2>
        <p><strong>Category:</strong> ${incident.category}</p>
        <p><strong>Location:</strong> ${incident.location}</p>
        <p><strong>Description:</strong> ${incident.description}</p>
        <p><strong>Reported by:</strong> ${incident.reporterId ? 'Logged-in user' : 'Anonymous'}</p>
        <p><a href="${FRONTEND_URL}/admin/incidents/${incident.id}">View Incident Details</a></p>`)
      .setText(`
        New Safety Incident Reported
        Category: ${incident.category}
        Location: ${incident.location}
        Description: ${incident.description}
        Reported by: ${incident.reporterId ? 'Logged-in user' : 'Anonymous'}
      `);

    // Send to every admin
    for (const admin of admins) {
      try {
        emailParams.setTo([new Recipient(admin.email, admin.name)]);
        await mailerSend.email.send(emailParams);
        console.log(`📧 New incident notification sent to ${admin.email} for ID: ${incident.id}`);
      } catch (error) {
        console.error(`Failed to send email to ${admin.email}:`, error);
      }
    }
  }

  /**
   * Notify reporter when status changes (only if logged-in)
   */
  static async sendStatusUpdateNotification(incident: any, newStatus: IncidentStatus) {
    if (!incident.reporterId || !env.MAILERSEND_API_KEY) return;

    const emailParams = new EmailParams()
      .setFrom(fromEmail)
      .setTo([new Recipient(incident.reporter.email, incident.reporter.name)])
      .setSubject(`Your Report Status Updated - ${newStatus}`)
      .setHtml(`
        <h2>Your Safety Report has been Updated</h2>
        <p><strong>Incident ID:</strong> ${incident.id}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        ${incident.adminNotes ? `<p><strong>Admin Notes:</strong> ${incident.adminNotes}</p>` : ''}
        <p><a href="${FRONTEND_URL}/my-reports/${incident.id}">View Your Report</a></p>        
        <p>Thank you for helping keep our campus safe.</p>
      `)
      .setText(`
        Your report has been updated to ${newStatus}.
        Incident ID: ${incident.id}
        ${incident.adminNotes ? `Admin Notes: ${incident.adminNotes}` : ''}
      `);

    try {
      await mailerSend.email.send(emailParams);
      console.log(`📧 Status update email sent to reporter for incident ${incident.id}`);
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }
}