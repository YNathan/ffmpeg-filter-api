export interface VideoResponseDto  {
    all_videos_freeze_frame_synced :boolean,
    videos: Array<video>
}

export interface video {
    longest_valid_period:number,
    valid_video_percentage: number,
    "valid_periods": Array<Array<number>>;
}
