import {s3Utils} from "../utils/S3Utils";
import {assertThat, isNotEmpty} from "@jolt-us/jolt-test-utils";
import {ZoomRecordingService} from "./ZoomRecordingService";


describe("ZoomRecordingService", () => {
    const zoomRecordingService: ZoomRecordingService = new ZoomRecordingService(s3Utils);

    it("should return list with files",async  () => {
        const list = await zoomRecordingService.findRecording({
            start: 0,
            roomId: "3299116434"
        });
        assertThat(list.recordings, isNotEmpty())
    })
});