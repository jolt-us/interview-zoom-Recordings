
import {RecordingFile, ZoomRecordingService as IZoomRecordingService} from "@jolt-us/jolt-zoom-recording-client"
import {RoomDetails, ZoomRecordings} from "@jolt-us/jolt-zoom-recording-client";
import {S3Utils} from "../utils/S3Utils";
import {ListObjectsOutput, Object} from "aws-sdk/clients/s3";
import moment from "moment";
import {zoomS3Utils} from "../utils/ZoomS3Utils";

export class ZoomRecordingService implements IZoomRecordingService {
    constructor(
        private readonly s3: S3Utils
    ) { }
    async findRecording(roomDetails: RoomDetails): Promise<ZoomRecordings> {
        const s3Key = zoomS3Utils.s3RoomPrefix(roomDetails);
        const listS3Objects: ListObjectsOutput = await this.s3.getListFiles(s3Key);
        return this.formatS3Response(listS3Objects);
    }

    formatS3Response(listS3Objects: ListObjectsOutput): ZoomRecordings {
        return  {
            recordings: listS3Objects.Contents.map(s3Obj => this.s3ObjectToRecordFile(s3Obj))
        }
    }
    s3ObjectToRecordFile(s3Object: Object): RecordingFile {
        return {
            size: s3Object.Size,
            timestamp: this.getTimestampFromKey(s3Object.Key),
            url: this.getPublicUrl(s3Object)
        }
    }
    getPublicUrl(s3Object: Object): string {
        return this.s3.getSignUrl(s3Object.Key)
    }
    getTimestampFromKey(key: String): number {
        return moment(key.split("/")[2]).valueOf()
    }
}