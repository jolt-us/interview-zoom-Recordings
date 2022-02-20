import { S3Utils } from "./utils/S3Utils"
import { ZoomApi } from "./utils/ZoomApi"
import { env } from "@jolt-us/env";
import { ListObjectsOutput, Object } from "aws-sdk/clients/s3";
import { FileToCopy } from "./types/FileToCopy";
import {Meeting} from "./Entities/Meeting";

export class HouseKeeper {
  constructor(
      private readonly s3Utils: S3Utils,
      private readonly zoomApi: ZoomApi,
  ) { }
  async uploadMissingFilesFromZoomToS3(allMeetings: Meeting[]): Promise<number> {
    const filesToSave: FileToCopy[] = await this._findAllNeededAndNotOnS3Files(allMeetings);
    for (const file of filesToSave) {
      await this._uploadUsableFileToS3(file)
    }
    return filesToSave.length;
  }
  private async _findAllNeededAndNotOnS3Files(allMeetings: Meeting[]): Promise<FileToCopy[]> {
    const filesToSave: FileToCopy[] = [];
    for (const meeting of allMeetings) {
      if (meeting.isJoltClass) {
        filesToSave.push(...(await this._findFilesToSave(meeting)))
      }
    }
    return filesToSave;
  }
  private async _uploadUsableFileToS3(file: FileToCopy): Promise<{Bucket: string, Key: string}> {
    return this.s3Utils.uploadFileFromUrl(file.downloadUrl, file.filePath, file.fileSize);
  }
  async deleteCopiedMeetingsFromZoom(allMeetings: Meeting[]): Promise<number> {
    const shouldDeleteAfterCopy: boolean = env("SHOULD_DELETE_AFTER_COPY", "boolean", false);
    let count = 0;
    if (shouldDeleteAfterCopy) {
      for (const meeting of allMeetings) {
        if (await this._shouldDeleteMeeting(meeting)) {
          const res = await this.zoomApi.deleteMeeting(meeting.id);
          console.log(res);
          count++;
        }
      }
    }
    return count;
  }
  private async _shouldDeleteMeeting(meeting: Meeting): Promise<boolean> {
    if (meeting.shouldPreserveOnZoomCloud) {
      return false;
    } else if (meeting.isJoltClass) {
      return await this._isAllMeetingFilesSavedInS3(meeting);
    } else {
      return true;
    }
  }
  private async _findFilesToSave(meeting: Meeting): Promise<FileToCopy[]> {
    const s3MeetingFiles: ListObjectsOutput = await this._getS3MeetingFiles(meeting);
    return meeting.files.filter((meetingFile: FileToCopy) => {
      return !this._isFileInS3Objects(meetingFile, s3MeetingFiles.Contents);
    })
  }
  private async _isAllMeetingFilesSavedInS3(meeting: Meeting): Promise<boolean> {
    const filesToSave = await this._findFilesToSave(meeting);
    return filesToSave.length == 0
  }
  private async _getS3MeetingFiles(meeting: Meeting): Promise<ListObjectsOutput> {
    return await this.s3Utils.getListFiles(meeting.folderName);
  }
  private _isFileInS3Objects(file: FileToCopy, s3Objects: Object[]): boolean {
    const s3FileMatch: Object = s3Objects.find((s3Object: Object) => {
      if (s3Object.Key !== file.filePath) return false;
      if (s3Object.Size === file.fileSize) {
        return true;
      } else {
        console.warn(
            `${file.fileName} exist but not complete: ${file.fileSize}  ->  ${s3Object.Size}`
        );
        return false;
      }
    });
    return Boolean(s3FileMatch);
  }
}
