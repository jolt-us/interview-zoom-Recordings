

export type FileType = "MP4" | "M4A" | "TIMELINE" | "TRANSCRIPT" | "CHAT" | "CC"
export type RecordingType = "shared_screen_with_speaker_view" | "shared_screen_with_gallery_view" | "speaker_view" |"gallery_view" | "audio_only" |
"shared_screen" | "chat_file" | "TIMELINE"

export type ZoomFile = {
    id: string,
    meeting_id: string,
    recording_start: string, // yyyy-mm-dd'T'hh:mm:ss'Z'
    recording_end: string, // yyyy-mm-dd'T'hh:mm:ss'Z'
    file_type: FileType, 
    file_size: number,
    play_url?: string,
    download_url: string,
    status: string,
    recording_type: RecordingType
}

export type ZoomMeeting = {
    uuid: string,
    id: string,
    account_id: string,
    host_id: string,
    topic: string,
    type?: number,
    start_time: string, // yyyy-mm-dd'T'hh:mm:ss'Z'
    timezone?: string,
    host_email: string,
    duration: number,
    total_size: number,
    recording_count: number,
    share_url?: string,
    recording_files: ZoomFile[]
}
