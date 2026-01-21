import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

interface MeetingBriefData {
  meeting: any;
  entity: any;
  sector: any;
  contact: any;
  platforms: any[];
  lastMeeting: any;
}

export async function generateMeetingBrief(data: MeetingBriefData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(24).text('Meeting Brief', { align: 'center' });
      doc.moveDown();

      // Meeting Info Section
      doc.fontSize(18).fillColor('#2563eb').text('Meeting Information');
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Date: ${format(new Date(data.meeting.scheduledAt), 'PPpp')}`);
      doc.text(`Type: ${data.meeting.type}`);
      doc.text(`Duration: ${data.meeting.duration} minutes`);
      doc.moveDown();

      // Entity & Sector Info
      doc.fontSize(18).fillColor('#2563eb').text('Entity Details');
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Entity: ${data.entity.name}`);
      doc.text(`Sector: ${data.sector.name}`);
      doc.text(`Status: ${data.entity.status}`);
      if (data.entity.description) {
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Description: ${data.entity.description}`);
        doc.fontSize(12);
      }
      doc.moveDown();

      // Contact Info (Personality Hat)
      doc.fontSize(18).fillColor('#2563eb').text('Contact Information');
      doc.fontSize(12).fillColor('#000000');
      doc.text(`Name: ${data.contact.name}`);
      doc.text(`Role: ${data.contact.role || 'N/A'}`);
      doc.text(`Email: ${data.contact.email || 'N/A'}`);
      doc.text(`Phone: ${data.contact.phone || 'N/A'}`);
      doc.text(`Preferred Contact: ${data.contact.preferredContactMethod}`);

      if (data.contact.personality) {
        doc.moveDown(0.5);
        doc.fontSize(14).fillColor('#059669').text('Personality Notes:');
        doc.fontSize(10).fillColor('#000000');
        doc.text(data.contact.personality, { width: 500 });
        doc.fontSize(12);
      }
      doc.moveDown();

      // Platforms in Next 3-4 Months
      doc.fontSize(18).fillColor('#2563eb').text('Upcoming Platform Deadlines (Next 4 Months)');
      doc.fontSize(12).fillColor('#000000');

      if (data.platforms.length > 0) {
        data.platforms.forEach((platform: any) => {
          const deadlineDate = platform.deadline ? format(new Date(platform.deadline), 'PP') : 'No deadline';
          doc.fontSize(11).fillColor('#000000');
          doc.text(`• ${platform.name} - ${platform.action}`, { continued: true });
          doc.text(` (Deadline: ${deadlineDate})`);
          doc.fontSize(10).fillColor('#64748b');
          doc.text(`  Status: ${platform.status} | Progress: ${platform.progress}%`);
          if (platform.targetPlatform) {
            doc.text(`  Target: ${platform.targetPlatform}`);
          }
          doc.moveDown(0.5);
        });
      } else {
        doc.text('No upcoming platform deadlines in the next 4 months.');
      }
      doc.moveDown();

      // Last Meeting Summary
      if (data.lastMeeting) {
        doc.fontSize(18).fillColor('#2563eb').text('Last Meeting Summary');
        doc.fontSize(12).fillColor('#000000');
        doc.text(`Date: ${format(new Date(data.lastMeeting.scheduledAt), 'PP')}`);

        if (data.lastMeeting.notes) {
          doc.moveDown(0.5);
          doc.fontSize(14).text('Notes:');
          doc.fontSize(10).text(data.lastMeeting.notes);
        }

        if (data.lastMeeting.outcomes) {
          doc.moveDown(0.5);
          doc.fontSize(14).text('Outcomes:');
          doc.fontSize(10).text(data.lastMeeting.outcomes);
        }

        if (data.lastMeeting.nextSteps) {
          doc.moveDown(0.5);
          doc.fontSize(14).text('Next Steps:');
          doc.fontSize(10).text(data.lastMeeting.nextSteps);
        }
        doc.moveDown();
      }

      // Talking Points Section
      doc.fontSize(18).fillColor('#2563eb').text('Suggested Talking Points');
      doc.fontSize(11).fillColor('#000000');

      const talkingPoints = generateTalkingPoints(data);
      talkingPoints.forEach((point: string, index: number) => {
        doc.text(`${index + 1}. ${point}`);
        doc.moveDown(0.3);
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#64748b').text(
        `Generated on ${format(new Date(), 'PPpp')} | Gov Entity Tracker`,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateTalkingPoints(data: MeetingBriefData): string[] {
  const points: string[] = [];

  // Add platform-related talking points
  if (data.platforms.length > 0) {
    const urgentPlatforms = data.platforms.filter((p: any) => {
      const daysUntilDeadline = p.deadline
        ? Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysUntilDeadline < 60;
    });

    if (urgentPlatforms.length > 0) {
      points.push(`Discuss urgent platform deadlines: ${urgentPlatforms.map((p: any) => p.name).join(', ')}`);
    }

    const blockedPlatforms = data.platforms.filter((p: any) => p.status === 'blocked');
    if (blockedPlatforms.length > 0) {
      points.push(`Address blockers for: ${blockedPlatforms.map((p: any) => p.name).join(', ')}`);
    }
  }

  // Add follow-up from last meeting
  if (data.lastMeeting?.nextSteps) {
    points.push('Follow up on previous action items');
  }

  // Add status update point
  points.push(`Get status update on ${data.entity.name} consolidation progress`);

  // Add general points
  points.push('Discuss any new challenges or roadblocks');
  points.push('Confirm upcoming milestones and timelines');

  return points;
}
