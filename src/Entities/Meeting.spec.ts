import {ZoomFile, ZoomMeeting} from "../types/Zoom";
import {Meeting} from "./Meeting";
import {fakeMeeting} from "../testUtils/fakers";
import {allOf, assertThat, hasItem, hasProperties, hasSize, is} from "@jolt-us/jolt-test-utils";
import {zoomS3Utils} from "../utils/ZoomS3Utils";


describe("Meeting", () => {
    let zoomMeeting: ZoomMeeting;


    it("should create a Meeting", () => {
        const goodFile: ZoomFile = {
            id: "18791227-e3a1-4d62-83e7-343e124f2244",
            meeting_id: "LGnVrMuWTA6JQlYOre/WDzA==",
            file_type: "MP4",
            file_size: 250668,
            recording_start: "1970-01-01T05:58:31Z",
            recording_end: "1970-01-01T09:33:00Z",
            download_url: "https://jolt.zoom.us/rec/download/u5QvJrqorTw3S4WTsASDUPF_W9XoKPis0nJP8vVfnhm2V3kBMAGjMLoQZuUoukuEVom_baDGLMcRkQO1",
            recording_type: "shared_screen_with_gallery_view",
            status: "completed"
        };
        const badFile: ZoomFile = {
            id: "18791227-e3a1-4d62-83e7-343e124f2244",
            meeting_id: "LGnVrMuWTA6JQlYOre/WDzA==",
            file_type: "MP4",
            file_size: 250668,
            recording_start: "1970-01-01T05:58:31Z",
            recording_end: "1970-01-01T09:33:00Z",
            download_url: "https://jolt.zoom.us/rec/download/u5QvJrqorTw3S4WTsASDUPF_W9XoKPis0nJP8vVfnhm2V3kBMAGjMLoQZuUoukuEVom_baDGLMcRkQO1",
            recording_type: "shared_screen_with_speaker_view",
            status: "completed"
        };
        zoomMeeting = {
            uuid: "LGnVrMuWTA6JQlYOre/WDzA==",
            id: "3299116434",
            host_id: "dF5RqpRPQeKiDyZlIY8HNg",
            topic: "Test From Local Device",
            start_time: "1970-01-01",
            host_email: "support+video-meeting-test@jolt.io",
            total_size: 253112,
            account_id: "me",
            duration: 0,
            recording_count: 2,
            recording_files: [goodFile,badFile]
        };
        const meeting = new Meeting(zoomMeeting);

        assertThat(meeting.id, is(zoomMeeting.uuid));
        assertThat(meeting.folderName, is(zoomS3Utils.getFolderName(zoomMeeting)));
        assertThat(meeting.isJoltClass, is(true));
        assertThat(meeting.files, hasSize(1));
        assertThat(meeting.files,
            hasItem(hasProperties(zoomS3Utils.formatFile(meeting.folderName, goodFile)))
        )
    })
});