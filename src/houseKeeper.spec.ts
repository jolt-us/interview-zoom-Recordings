import { HouseKeeper } from "./HouseKeeper";
import { S3Utils } from "./utils/S3Utils";
import {
    assertThat, ServiceStub,
    Spy, wasCalledOnceWith, wasCalledWith,

} from "@jolt-us/jolt-test-utils";
import {fakeMeeting, fakeRecording} from "./testUtils/fakers";
import {Meeting} from "./Entities/Meeting";
import {ZoomApi} from "./utils/ZoomApi";
import {zoomS3Utils} from "./utils/ZoomS3Utils";

describe("House Keeper", function() {
  let s3Utils: S3Utils;
  let zoomApi: ZoomApi;
  let houseKeeper: HouseKeeper;

  beforeEach(async () => {
      process.env.SHOULD_DELETE_AFTER_COPY = "TRUE";
      s3Utils = Spy.createObject<S3Utils>({
          getListFiles: async (key: string) => ({
              Contents: [
                  {
                      Key: `${key}-${validFileInS3.id}.mp4`,
                      Size: 1665
                  }
              ]
          })
      });

      zoomApi = ServiceStub.create();

      houseKeeper = new HouseKeeper(s3Utils, zoomApi);
  });

  it("should upload files to s3", async () => {
    const meetings: Meeting[] = [
        validMeetingCanUpload,
        validMeetingCanDelete,
        notValidCanDelete,
    ];
    await houseKeeper.uploadMissingFilesFromZoomToS3(meetings);
    const fileToSaveS3Key = `${validMeetingCanUpload.folderName}-${validFileNotInS3.id}.mp4`;
    const { downloadUrl, fileSize } = zoomS3Utils.formatFile(validMeetingCanUpload.folderName, validFileNotInS3);

    assertThat(s3Utils.uploadFileFromUrl, wasCalledWith(downloadUrl, fileToSaveS3Key, fileSize));
  });

    it('should delete unvalid meeting', async () => {
        const meetings: Meeting[] = [
            validMeetingCanUpload,
            notValidCanDelete,
        ];
        await houseKeeper.deleteCopiedMeetingsFromZoom(meetings);

        assertThat(zoomApi.deleteMeeting, wasCalledOnceWith(notValidCanDelete.id));
    });

    it('should delete copied meeting', async () => {
        const meetings: Meeting[] = [
            validMeetingCanUpload,
            validMeetingCanDelete,
        ];
        await houseKeeper.deleteCopiedMeetingsFromZoom(meetings);

        assertThat(zoomApi.deleteMeeting, wasCalledOnceWith(validMeetingCanDelete.id));
    });
});

const validFileInS3 = fakeRecording({
    id: "valid1",
    file_size: 1665,
    download_url: "http://sub.domain.com/file",
    file_type: "MP4",
    recording_type: "shared_screen_with_gallery_view"
});
const validFileNotInS3 = fakeRecording({
    id: "not-in-s3",
    download_url:  ZoomApi.urlWithAccess("http://sub.domain.com/a-file"),
    file_size: 1665,
    file_type: "MP4",
    recording_type: "shared_screen_with_gallery_view"
});
const notValidFile = fakeRecording({
    file_type: "M4A",
    download_url: "http://sub.domain.com/aduio-file"
});


const validMeetingCanUpload = fakeMeeting({
    id: "room-id",
    uuid: "meetingId-1==",
    start_time: "1970-01-01T33:22:11Z",
    topic: "Valid Meeting Topic",
    host_email: "support+video-meeting+1@maile.com",
    recording_files: [
        validFileInS3,
        validFileNotInS3,
        notValidFile
    ]
});
const validMeetingCanDelete = fakeMeeting({
    id: "room-id-2",
    uuid: "meetingId-2==",
    start_time: "2211-44-55T33:22:11Z",
    topic: "Valid Meeting Topic",
    host_email: "support+video-meeting+2@maile.com",
    recording_files: [
        validFileInS3,
        notValidFile
    ]
});

const notValidCanDelete = fakeMeeting({
    id: "room-id-3",
    host_email: "not-support+video-meeting+1@maile.com"
});

const preservedMeeting = fakeMeeting({
    host_email: "not-support+video-meeting+1@maile.com",
    uuid: "LGnVrMuWTA6JQlYOreWDzA=="
});
