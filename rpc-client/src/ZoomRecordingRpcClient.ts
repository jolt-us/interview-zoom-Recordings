import {RpcClient, RpcClientOpts} from "@jolt-us/jolt-rpc";

export type RecordingFile = {
    url: string,
    size: number,
    timestamp: number
}

export type ZoomRecordings = {
    recordings: RecordingFile[]
}

export type RoomDetails = {
    roomId: string,
    start: number | string,
}

export const zoomRecordingRpcName = "zoomRecordingService";

export interface ZoomRecordingService {
    findRecording(roomDetails: RoomDetails): Promise<ZoomRecordings>;
}

export class ZoomRecordingServiceRpc {
    static create(
        path: string,
        opts: RpcClientOpts,
    ): ZoomRecordingService {
        return RpcClient.create<ZoomRecordingService>(path, zoomRecordingRpcName, opts);
    }
}