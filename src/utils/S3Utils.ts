import AWS, {S3} from "aws-sdk";
import fetch, { Response } from "node-fetch";
import {
  PutObjectRequest,
  Types,
  DeleteObjectOutput, ListObjectsOutput,
} from "aws-sdk/clients/s3";
import {env} from "@jolt-us/env";
import ReadableStream = NodeJS.ReadableStream;

const BUCKET_NAME = env("BUCKET_NAME", "string","jolt-video-recordings");

export class S3Utils {
    constructor(
        private readonly s3: S3 = new AWS.S3()
    ) { }
    async uploadFileFromUrl(url: string, fileName: string, expectedFileSize?: number): Promise<{Bucket: string, Key: string}> {
        const fetchRes: Response = await fetch(url);
        const uploadParams: PutObjectRequest = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fetchRes.body,
        };
        if (env("DEBUG_UPLOAD", "boolean", false)) {
            this.logUploadFile(fetchRes.body, expectedFileSize)
        }
        return await this.s3.upload(uploadParams).promise();
    }
    deletes3File(key: string): Promise<DeleteObjectOutput> {
        const delParams: Types.DeleteObjectRequest = {
            Bucket: BUCKET_NAME,
            Key: key,
        };
        return this.s3.deleteObject(delParams).promise();
    }
    getListFiles(key: string): Promise<ListObjectsOutput> {
        return this.s3.listObjectsV2({
            Bucket: BUCKET_NAME,
            Prefix: key,
        }).promise();
    }
    getSignUrl(key: string): string {
        const TWO_MONTHS_IN_SECONDS =  60 * 60 * 24 * 60;
        return this.s3.getSignedUrl('getObject', {Bucket: BUCKET_NAME, Key: key, Expires: TWO_MONTHS_IN_SECONDS})
    }
    logUploadFile(stream: ReadableStream, fileSize: number = NaN): void {
        let total: number = 0;
        stream.on("data", (data) => {
            total += data.length;
            console.log(
                `received: ${data.length} more data: ${total}/${fileSize} missing: ${
                    fileSize - total
                }`
            );
        });
        stream.on("error", (error) => {
            console.log("upload error: ", JSON.stringify(error, null, "\t"));
        });
        stream.on("close", () => {
            console.log("total data on finish on close: ", total);
        });
        stream.on("finish", () => {
            console.log("total data on finish: ", total);
        });
    }
}

export const s3Utils: S3Utils = new S3Utils(new AWS.S3());
