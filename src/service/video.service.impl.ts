import { injectable} from "inversify";
import {Request, Response, NextFunction} from "express";
import {ErrorCodes} from "../exceptions/error-codes";
import {BadRequestError} from "../exceptions/http-errors/bad-request-error";
import {VideoService} from "./video.service";
import {video, VideoResponseDto} from "../models/dto/video.response.dto";
import ffmpeg from "ffmpeg-cli";
import fetch from "node-fetch";
import {readFileSync, writeFileSync} from "fs";


ffmpeg.run("-version");
console.log(ffmpeg.runSync("-version"));

@injectable()
export class VideoServiceImpl implements VideoService {
    protected TAG = `[${VideoServiceImpl.name}]`;


    public async parseVideo(
        request: Request,
        response: Response<VideoResponseDto>,
        next: NextFunction
    ): Promise<Response<VideoResponseDto>> {
        try {
            let globalsCheckSync = false;
            const urls = request.body.urls;
            const videoResponse: VideoResponseDto = {
                all_videos_freeze_frame_synced: false,
                videos: []
            }
            console.log(urls);
            for (const urlIdx in urls) {
                const url = urls[urlIdx];
                const videoUrlResponse = await fetch(url);
                const buffer = await videoUrlResponse.buffer();
                const fileName = this.fileNameFromUrl(url);
                try {
                    writeFileSync(`/tmp/${fileName}`, buffer);

                    ffmpeg.runSync(`-i /tmp/${fileName} -vf "freezedetect=n=0.003:d=2,metadata=mode=print:file=/tmp/${fileName.split('.')[0]}-metadata.txt" -map 0:v:0 -f null -`);
                    ffmpeg.runSync(`-i /tmp/${fileName} 2>&1 | grep "Duration" > /tmp/${fileName.split('.')[0]}-duration.txt`);

                    const filterResultBuffer = readFileSync(`/tmp/${fileName.split('.')[0]}-metadata.txt`);
                    let filterResultText = filterResultBuffer.toString('utf-8');
                    filterResultText += '\n';

                    const filterResultDurationBuffer = readFileSync(`/tmp/${fileName.split('.')[0]}-duration.txt`);
                    const filterResultDurationText = filterResultDurationBuffer.toString('utf-8');
                    const currentVideoDuratuionAsArray = this.getValuesBetweenTexts(filterResultDurationText, 'Duration: ', ', start');
                    console.log(`current duration ${currentVideoDuratuionAsArray}`);
                    const durationAsDateFildes = currentVideoDuratuionAsArray[0].split(':');
                    const videoTotalDurationSeconds = (+durationAsDateFildes[0]) * 60 * 60 + (+durationAsDateFildes[1]) * 60 + (+durationAsDateFildes[2]);
                    console.log(`total seconds ${videoTotalDurationSeconds}`);


                    const freeze_starts = this.getValuesBetweenTexts(filterResultText, 'lavfi.freezedetect.freeze_start=', '\n');
                    const freeze_ends = this.getValuesBetweenTexts(filterResultText, 'lavfi.freezedetect.freeze_end=', '\n');
                    const freeze_durations = this.getValuesBetweenTexts(filterResultText, 'lavfi.freezedetect.freeze_duration=', '\n');
                    let longestPeriodFreezed = 0;
                    const pointArr = [[0]];
                    let validityDuration = 0;
                    let invalidityDuration = 0;
                    let currentCheckSync = true;
                    for (const currentFreezIndex in freeze_starts) {

                        const currentFreezStart = parseFloat(freeze_starts[currentFreezIndex]);
                        const currentFreezEnd = parseFloat(freeze_ends[currentFreezIndex]);
                        const currentFreezeDuration = parseFloat(freeze_durations[currentFreezIndex]);

                        // longest freezed
                        if (currentFreezeDuration > longestPeriodFreezed) {
                            longestPeriodFreezed = currentFreezeDuration;
                        }


                        const currentStart = pointArr[currentFreezIndex][0];
                        validityDuration += currentFreezStart - currentStart;
                        invalidityDuration += currentFreezeDuration;
                        pointArr[currentFreezIndex].push(currentFreezStart);
                        if ((parseInt(currentFreezIndex) + 1) < freeze_ends.length) {
                            pointArr.push([currentFreezEnd]);
                        }

                        for (let checkLastIndex = 0; checkLastIndex < videoResponse.videos.length; checkLastIndex++) {
                            currentCheckSync = true;
                            const lastUrlCurrentStart = videoResponse.videos[checkLastIndex].valid_periods[parseInt(currentFreezIndex)][0];
                            const lastUrlCurrentFreezStart = videoResponse.videos[checkLastIndex].valid_periods[parseInt(currentFreezIndex)][1];
                            if (!(lastUrlCurrentStart !== undefined  && this.isSync(currentStart, lastUrlCurrentStart))) {
                                currentCheckSync = false;
                            }

                            if (!(lastUrlCurrentFreezStart !== undefined && this.isSync(currentFreezStart, lastUrlCurrentFreezStart))) {
                                currentCheckSync = false;
                            }
                        }
                    }

                    const videoObj: video = {
                        longest_valid_period: longestPeriodFreezed,
                        valid_periods: pointArr,
                        valid_video_percentage: (validityDuration / videoTotalDurationSeconds) * 100
                    }

                    videoResponse.videos.push(videoObj);
                    if (!currentCheckSync) {
                        globalsCheckSync = currentCheckSync;
                    }
                    videoResponse.all_videos_freeze_frame_synced = globalsCheckSync;
                } catch (e) {
                    console.log(e);
                }
            }

            // ,
            //     "https://storage.googleapis.com/hiring_process_data/freeze_frame_input_c.mp4
            return response.status(200).send(videoResponse);
        } catch (error) {
            next(new BadRequestError(ErrorCodes.ERROR_UNKNOWN, error.message));
        }
    }

    public isSync(num1: number, num2: number): boolean {
        const precision = 0.500;
        if(num1 < num2){
            const tmp = num2;
            num2 = num1;
            num1 = num2;
        }
        const res = num1 - num2;
        return res <= precision;
    }

    public fileNameFromUrl(fileUrl: string): string {
        const splitedAsArray = fileUrl.split('/');
        const fileName = splitedAsArray[splitedAsArray.length - 1];
        return fileName;
    }

    public async parseVideoSync(): Promise<VideoResponseDto> {
        const res: VideoResponseDto = {
            "all_videos_freeze_frame_synced": true,
            "videos": [
                {
                    "longest_valid_period": 7.35,
                    "valid_video_percentage": 56.00,
                    "valid_periods": [
                        [
                            0.00,
                            3.50
                        ],
                        [
                            6.65,
                            14
                        ],
                        [
                            19.71,
                            20.14
                        ]
                    ]
                },
                {
                    "longest_valid_period": 7.33,
                    "valid_video_percentage": 55.10,
                    "valid_periods": [
                        [
                            0.00,
                            3.40
                        ],
                        [
                            6.65,
                            13.98
                        ],
                        [
                            19.71,
                            20.00
                        ]
                    ]
                }
            ]
        }


        return res;
    }


    public getValuesBetweenTexts(text: string, firstText: string, secondString: string): string[] {
        const res = [];
        const firstSplitedArray = text.split(firstText);
        for (let i = 1; i < firstSplitedArray.length; i++) {
            res.push(firstSplitedArray[i].split(secondString)[0]);
        }
        return res;
    }

}
