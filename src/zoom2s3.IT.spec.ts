import { uploadS3Meeting } from "./zoom2s3"
import { s3Utils } from "./utils/S3Utils"
import { hasItem, hasProperty, hasSize } from "@jolt-us/jolt-test-utils";
import {fakeMeeting, fakeRecording} from "./testUtils/fakers";
import {preservedMeetingForIT} from "./testUtils/preservedMeetingForIT";
const {
    assertThat,
    is
} = require("@jolt-us/jolt-test-utils");

describe("Zoom to s3 save recording", function () {
    this.timeout(1000 * 60 * 15);
    it("should upload successfully", async () => {
        const res = await uploadS3Meeting(fakeMeeting({
            uuid: "LGnVrMuWTA6JQlYOreW/DzA==",
            id: "3299116434",
            topic: "Test From Local Device",
            start_time: "1970-01-01T20:20:20Z",
            recording_files: [
                fakeRecording({
                    id: "18791227-e3a1-4d62-83e7-343e124f2244",
                    file_type: "MP4",
                    file_size: 250668,
                    download_url: preservedMeetingForIT.fileUrl,
                    recording_type: "shared_screen_with_gallery_view",
                }),
                fakeRecording({
                    id: "18791227-e3a1-4d62-83e7-343e124f2200",
                    file_type: "M4A",
                    file_size: 250668,
                    download_url: "https://jolt.zoom.us/rec/download/u5QvJrqorTw3S4WTsASDUPF_W9XoKPis0nJP8vVfnhm2V3kBMAGjMLoQZuUoukuEVom_baDGLMcRkQO1",
                    recording_type: "audio_only",
                }),
            ]
        }));
        assertThat(res, hasSize(1));
        assertThat(res, hasItem(
            hasProperty("Key", is("zoom/1970-01-01/3299116434-LGnVrMuWTA6JQlYOreW%2FDzA%3D%3D-Test From Local Device-18791227-e3a1-4d62-83e7-343e124f2244.mp4"))
        ));
        const {Contents: s3List} = await s3Utils.getListFiles(res[0].Key);
        assertThat(s3List, hasItem(hasProperty("Size", is(250668))))
    })
});
