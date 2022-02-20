import { FileToCopy } from "./types/FileToCopy";
import { s3Utils } from "./utils/S3Utils";
import {Meeting} from "./Entities/Meeting";

export async function uploadS3Meeting(meeting: Meeting): Promise<any> {
  if (!meeting.isJoltClass) {
    return {
      error: "meeting is not valid!"
    };
  }
  if (!meeting.files || meeting.files.length == 0) {
    return {
      error: "couldn't find a valid file!"
    };
  }

  return await Promise.all(
      meeting.files.map(file =>
      s3Utils.uploadFileFromUrl(
          file.downloadUrl,
          file.filePath,
          file.fileSize
      )
    )
  );
}
