import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { IrysUploadResponseInterface } from "@/lib/interfaces";
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function uploadImagesInHTML(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const images = doc.querySelectorAll('img');

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const blobUrl = img.getAttribute('src');

      if (blobUrl && blobUrl.startsWith('blob:')) {
        try {
          const response = await fetch(blobUrl);
          const blob = await response.blob();

          const { data: img_upload_res } = await axios.post<IrysUploadResponseInterface>(
            "/api/irys/upload/upload-file",
            blob
          );

          img.setAttribute('src', img_upload_res.url || "");
        } catch (error: any) { }
      }
    }

    return doc.body.innerHTML;
  } catch (error: any) {
    throw error;
  }
}

export function generateRoomID(applicantion: string, date: Date, fromTime: string, toTime: string) {
  const meetingDate = new Date(date)
  const [fromHours, toHours] = fromTime.split(':').map(Number)
  const [fromMinutes, toMinutes] = toTime.split(':').map(Number)

  const fromDateTime = meetingDate.setHours(fromHours, fromMinutes, 0, 0);
  const toDateTime = meetingDate.setHours(toHours, toMinutes, 0, 0);

  const hash = crypto.createHash('sha1').update(applicantion + fromDateTime + toDateTime).digest('hex').slice(0, 10)

  return `interview-room-${hash}`
}