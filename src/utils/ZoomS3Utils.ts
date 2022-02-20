import {ZoomFile, ZoomMeeting} from "../types/Zoom";
import moment from "moment"
import {ZoomApi} from "./ZoomApi";
import {RoomDetails} from "@jolt-us/jolt-zoom-recording-client";

export class ZoomS3Utils {
    getFolderName(meeting: ZoomMeeting) {
        const date = moment(meeting.start_time).format("YYYY-MM-DD");
        const roomId = meeting.id;
        const meetingId = encodeURIComponent(meeting.uuid);
        const meetingName = meeting.topic.replace(
            /[^A-Za-z0-9\s\_\-]/g,
            ""
        );
        return `zoom/${date}/${roomId}-${meetingId}-${meetingName}`;
    }
    formatFile(folder: string, file: ZoomFile) {
        return {
            downloadUrl: ZoomApi.urlWithAccess(file.download_url),
            fileName: `${file.id}.mp4`,
            folderName: folder,
            filePath: `${folder}-${file.id}.mp4`,
            fileSize: file.file_size
        }
    }

    s3RoomPrefix(roomDetails: RoomDetails) {
        const date =  moment(roomDetails.start).format("YYYY-MM-DD");
        return `zoom/${date}/${roomDetails.roomId}`
    }
}


export const zoomS3Utils = new ZoomS3Utils();