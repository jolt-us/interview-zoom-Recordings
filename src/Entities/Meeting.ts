
import {ZoomFile, ZoomMeeting} from "../types/Zoom";
import { FileToCopy } from "../types/FileToCopy";
import buildUrl from "build-url";
import { env } from "@jolt-us/env";
import moment, {Moment} from "moment";
import {ZoomApi} from "../utils/ZoomApi";
import {zoomS3Utils} from "../utils/ZoomS3Utils";
import {preservedMeetingForIT} from "../testUtils/preservedMeetingForIT";

const VIDEO_TYPE = env(
    "VALID_VIDEO_TYPE",
    "string",
    "shared_screen_with_gallery_view"
);


export class Meeting {
    readonly id: string;
    readonly folderName: string;
    readonly files: FileToCopy[];
    readonly isJoltClass: boolean;
    readonly shouldPreserveOnZoomCloud: boolean;
    readonly start: number;

    constructor(meeting: ZoomMeeting) {
        this.id = meeting.uuid;
        this.folderName = zoomS3Utils.getFolderName(meeting);
        this.files = this._getNecessaryFiles(this.folderName, meeting.recording_files);
        this.isJoltClass = _isJoltClass(meeting.host_email);
        this.shouldPreserveOnZoomCloud = _shouldPreserveOnZoomCloud(meeting.uuid);
        this.start = moment(meeting.start_time).valueOf();
    }

    private _getNecessaryFiles(folderName: string, recordingFiles: ZoomFile[]): FileToCopy[] {
        return recordingFiles
            .filter(file => file.file_type === "MP4" && file.recording_type === VIDEO_TYPE)
            .map(file => zoomS3Utils.formatFile(folderName, file));
    }
}

 function _isJoltClass(hostEmail: string): boolean {
    return hostEmail.startsWith("support+video-meeting");
}

 function _shouldPreserveOnZoomCloud(meetingId: string): boolean {
    return meetingId === preservedMeetingForIT.meetingId
}