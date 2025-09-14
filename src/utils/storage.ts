import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import path from "node:path"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"
import { config } from "../config/config"
import { buffer } from "node:stream/consumers"
import { Readable } from "node:stream"

const s3Client = new S3Client({
    region: config.aws.REGION,
    credentials: {
        accessKeyId: config.aws.ACCESS_KEY_ID as string,
        secretAccessKey: config.aws.SECRET_ACCESS_KEY as string,
    },
})

export const urlBucket = (): string => `https://${config.aws.BUCKET}.s3.us-east-2.amazonaws.com/`

interface UploadResponse {
    path: string;
    miniPath?: string;
}

interface UploadResponse {
    path: string
    miniPath?: string
}

export const uploadImage = async (
    imgData: { data: Buffer; name: string },
    dimension: number,
    folder: string,
    mini: boolean = false,
    miniDimension: number = 100
): Promise<UploadResponse> => {
    try {
        if (!imgData?.data || !imgData?.name) throw new Error("Invalid image data.")

        const imageFile = sharp(imgData.data)
        const { width, height, format } = await imageFile.metadata()

        if (!width || !height || !format) throw new Error("Couldn't get image metadata.")

        const maxDimension = Math.max(width, height)
        const percentage = dimension / maxDimension
        const resizedImage =
            percentage < 1
                ? await imageFile.resize(Math.round(width * percentage), Math.round(height * percentage)).toBuffer()
                : await imageFile.toBuffer()

        const extension = path.extname(imgData.name)
        const fileName = `${folder}/${uuidv4()}${extension}`
        const uploadParams = {
            Bucket: config.aws.BUCKET,
            Key: fileName,
            Body: resizedImage,
            ContentType: `image/${format}`
        }

        await s3Client.send(new PutObjectCommand(uploadParams))

        let miniPath: string | undefined

        if (mini) {
            const miniImage = await sharp(imgData.data).resize(miniDimension).toBuffer()
            const miniFileName = `${folder}/${uuidv4()}${extension}`
            const miniUploadParams = {
                Bucket: config.aws.BUCKET,
                Key: miniFileName,
                Body: miniImage,
                ContentType: `image/${format}`
            }
            await s3Client.send(new PutObjectCommand(miniUploadParams))
            miniPath = miniFileName
        }

        return { path: fileName, miniPath }
    } catch (error) {
        throw new Error("Couldn't upload image.")
    }
}

export const uploadImageBase64 = async (base64String: string, filePath: string, dimension: number): Promise<string> => {
    try {
        if (!base64String) throw new Error("Base64 string cannot be empty.")
        if (!filePath) throw new Error("File path cannot be empty.")
        if (!dimension || dimension <= 0) throw new Error("Dimension must be a positive number.")

        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "")
        const decodedData = Buffer.from(base64Data, "base64")
        const imageFile = sharp(decodedData)

        const metadata = await imageFile.metadata()
        const { width = 0, height = 0, format } = metadata

        if (!format) throw new Error("Image format not found.")

        const maxDimension = Math.max(width, height)
        const scale = dimension / maxDimension

        const processedImage = scale < 1
            ? await imageFile.resize(Math.round(width * scale), Math.round(height * scale)).toBuffer()
            : await sharp(decodedData).toBuffer()

        const fileName = `${filePath}/${uuidv4()}.${format}`

        const putObjectCommand = new PutObjectCommand({
            Bucket: config.aws.BUCKET,
            Key: fileName,
            Body: processedImage,
            ContentType: `image/${format}`,
        })

        await s3Client.send(putObjectCommand)

        return fileName
    } catch (error) {
        throw new Error("Couldn't upload base64 image.")
    }
}

export const uploadFile = async (file: any, ruta: string): Promise<{ url: string; path: string }> => {
    try {
        if (!file) throw new Error("File not provided.")

        const bucketName = config.aws.BUCKET
        const extension = path.extname(file.name)
        const fileName = `${ruta}/${uuidv4()}${extension}`

        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: file.data,
            ContentType: file.mimetype
        }

        await s3Client.send(new PutObjectCommand(uploadParams))

        return {
            url: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
            path: fileName
        }
    } catch (error) {
        throw new Error("Couldn't upload file.")
    }
}

export const uploadTxt = async (text: string, folder: string, fileName?: string): Promise<string> => {
    try {
        if (!text) throw new Error("Text cannot be empty.")
        if (!folder) throw new Error("Folder cannot be empty.")

        const uuid = fileName || uuidv4()
        const filePath = `${folder}/${uuid}.txt`

        await s3Client.send(
            new PutObjectCommand({
                Bucket: config.aws.BUCKET,
                Key: filePath,
                Body: text,
                ContentType: "text/plain"
            })
        )

        return filePath
    } catch (error) {
        throw new Error("Couldn't upload text file.")
    }
}

export const deleteFile = async (fileName: string) => {
    if (!fileName) {
        console.error('Filename cannot be empty.');
        return;
    }

    const route = 'trash/deleteFiles.json';

    try {
        let existingData: string[] = [];
        try {
            const { Body } = await s3Client.send(new GetObjectCommand({
                Bucket: config.aws.BUCKET,
                Key: route,
            }));
            if (!Body) {
                throw new Error('S3 response body is empty.');
            }

            const bodyStream = Body as Readable;
            const bodyBuffer = await streamToPromise(bodyStream);
            const bodyString = bodyBuffer.toString();
            existingData = JSON.parse(bodyString);
        } catch (error) {
			if (error instanceof Error && error.name !== 'NotFound') {
				console.error('Error while fetching existing data:', error);
				throw error;
			}
        }

        if (!existingData.includes(fileName)) {
            existingData.push(fileName);

            await s3Client.send(new PutObjectCommand({
                Bucket: config.aws.BUCKET,
                Key: route,
                Body: JSON.stringify(existingData, null, 2),
                ContentType: 'application/json',
            }));
        }

        console.log(`File ${fileName} has been moved to ${route}.`);

    } catch (error) {
        console.error('Error:', error);
    }
};

function streamToPromise(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (error: Error) => reject(error));
    });
}
