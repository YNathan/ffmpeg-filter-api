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
                    const currentVideoDurationAsArray = this.getValuesBetweenTexts(filterResultDurationText, 'Duration: ', ', start');
                    console.log(`current duration ${currentVideoDurationAsArray}`);
                    const durationAsDateFields = currentVideoDurationAsArray[0].split(':');
                    const videoTotalDurationSeconds = (+durationAsDateFields[0]) * 60 * 60 + (+durationAsDateFields[1]) * 60 + (+durationAsDateFields[2]);
                    console.log(`total seconds ${videoTotalDurationSeconds}`);


                    const freeze_starts = this.getValuesBetweenTexts(filterResultText, 'lavfi.freezedetect.freeze_start=', '\n');
                    const freeze_ends = this.getValuesBetweenTexts(filterResultText, 'lavfi.freezedetect.freeze_end=', '\n');
                    const freeze_durations = this.getValuesBetweenTexts(filterResultText, 'lavfi.freezedetect.freeze_duration=', '\n');
                    let longestPeriodFroze = 0;
                    const pointArr = [[0]];
                    let validityDuration = 0;

                    let currentCheckSync = true;
                    for (const currentFrozIndex in freeze_starts) {

                        const currentFreezeStart = parseFloat(freeze_starts[currentFrozIndex]);
                        const currentFreezeEnd = parseFloat(freeze_ends[currentFrozIndex]);
                        const currentFreezeeDuration = parseFloat(freeze_durations[currentFrozIndex]);

                        // longest freezed
                        if (currentFreezeeDuration > longestPeriodFroze) {
                            longestPeriodFroze = currentFreezeeDuration;
                        }

                        const currentStart = pointArr[currentFrozIndex][0];
                        validityDuration += currentFreezeStart - currentStart;
                        pointArr[currentFrozIndex].push(currentFreezeStart);
                        if ((parseInt(currentFrozIndex) + 1) < freeze_ends.length) {
                            pointArr.push([currentFreezeEnd]);
                        }

                        for (let checkLastIndex = 0; checkLastIndex < videoResponse.videos.length; checkLastIndex++) {
                            currentCheckSync = true;
                            const lastUrlCurrentStart = videoResponse.videos[checkLastIndex].valid_periods[parseInt(currentFrozIndex)][0];
                            const lastUrlCurrentFreezeStart = videoResponse.videos[checkLastIndex].valid_periods[parseInt(currentFrozIndex)][1];
                            if (!(lastUrlCurrentStart !== undefined  && this.isSync(currentStart, lastUrlCurrentStart))) {
                                currentCheckSync = false;
                            }

                            if (!(lastUrlCurrentFreezeStart !== undefined && this.isSync(currentFreezeStart, lastUrlCurrentFreezeStart))) {
                                currentCheckSync = false;
                            }
                        }
                    }

                    const videoObj: video = {
                        longest_valid_period: longestPeriodFroze,
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



    public getValuesBetweenTexts(text: string, firstText: string, secondString: string): string[] {
        const res = [];
        const firstSplitedArray = text.split(firstText);
        for (let i = 1; i < firstSplitedArray.length; i++) {
            res.push(firstSplitedArray[i].split(secondString)[0]);
        }
        return res;
    }

}
