import {ZoomFile, ZoomMeeting} from "../types/Zoom";
import {Meeting} from "../Entities/Meeting";

export function fakeMeeting(opt: Partial<ZoomMeeting> = {} ): Meeting {
    const zoomMeeting = Object.assign({
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
        recording_files: [
            fakeRecording(),
        ]
    }, opt);
    return new Meeting(zoomMeeting);
}
export function fakeRecording(opt: Partial<ZoomFile> = {}): ZoomFile {
    return Object.assign({
        id: "18791227-e3a1-4d62-83e7-343e124f2244",
        meeting_id: "LGnVrMuWTA6JQlYOre/WDzA==",
        file_type: "MP4",
        file_size: 250668,
        recording_start: "1970-01-01T05:58:31Z",
        recording_end: "1970-01-01T09:33:00Z",
        download_url: "https://jolt.zoom.us/rec/download/u5QvJrqorTw3S4WTsASDUPF_W9XoKPis0nJP8vVfnhm2V3kBMAGjMLoQZuUoukuEVom_baDGLMcRkQO1",
        recording_type: "shared_screen_with_gallery_view",
        status: "completed",
    }, opt);
}