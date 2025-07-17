'use strict';

const { ObjectId } = require('mongodb');
const { withDatabase } = require('../utils/database');
const { success, error } = require('../utils/response');
const { getProjectById } = require('../utils/projects');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const axios = require('axios');
const AdmZip = require('adm-zip');
const stream = require('stream');
const { promisify } = require('util');

const s3Client = new S3Client({ region: 'us-west-2' });
const BUCKET_NAME = 'steven-aivideos';
const pipeline = promisify(stream.pipeline);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    const projectId = event.pathParameters.id;
    
    if (!projectId) {
        return error('Missing project ID', 'Project ID is required', 400);
    }
    
    try {
        // Get project data with all related scenes, images, and videos
        const project = await withDatabase(async (db) => {
            return await getProjectById(db, projectId);
        });
        
        if (!project) {
            return error('Project not found', `No project found with ID: ${projectId}`, 404);
        }
        
        // Create a new zip file
        const zip = new AdmZip();
        
        // Add audio file to zip if available
        if (project.audioUrl) {
            try {
                const response = await axios.get(project.audioUrl, { responseType: 'arraybuffer' });
                zip.addFile('audio.mp3', Buffer.from(response.data));
            } catch (err) {
                console.error('Error downloading audio file:', err.message);
                // Continue even if audio download fails
            }
        }
        
        // Add images to zip
        for (let i = 0; i < project.scenes.length; i++) {
            const scene = project.scenes[i];
            
            if (scene.images && scene.images.length > 0) {
                for (let j = 0; j < scene.images.length; j++) {
                    const image = scene.images[j];
                    if (image.url) {
                        try {
                            const response = await axios.get(image.url, { responseType: 'arraybuffer' });
                            // Name format: "Escena 1" or "Escena 1 - opt 2" for multiple images
                            const fileName = scene.images.length === 1 
                                ? `Escena ${i + 1}.png` 
                                : `Escena ${i + 1} - opt ${j + 1}.png`;
                            zip.addFile(fileName, Buffer.from(response.data));
                        } catch (err) {
                            console.error(`Error downloading image for scene ${i + 1}:`, err.message);
                            // Continue even if image download fails
                        }
                    }
                }
            }
        }
        
        // Generate zip buffer
        const zipBuffer = zip.toBuffer();
        
        // Generate a unique filename for the zip file
        const timestamp = new Date().getTime();
        const filename = `${projectId}_${timestamp}.zip`;
        
        // Check if there's an existing zip file for this project and delete it
        try {
            // Query the bucket to find existing zip files for this project
            const listParams = {
                Bucket: BUCKET_NAME,
                Prefix: `zips/${projectId}_`
            };
            
            const listResponse = await s3Client.send(new ListObjectsV2Command(listParams));
            
            if (listResponse.Contents && listResponse.Contents.length > 0) {
                // Delete each existing zip file
                for (const item of listResponse.Contents) {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: item.Key
                    }));
                    console.log(`Deleted old zip file: ${item.Key}`);
                }
            }
        } catch (err) {
            console.error('Error deleting old zip files:', err.message);
            // Continue even if deletion fails
        }
        
        // Upload the zip to S3
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: `zips/${filename}`,
            Body: zipBuffer,
            ContentType: 'application/zip',
            ACL: 'public-read'
        };
        
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Generate the S3 URL
        const zipUrl = `https://${BUCKET_NAME}.s3.us-west-2.amazonaws.com/zips/${filename}`;
        
        return success({
            message: 'Project assets downloaded successfully',
            zipUrl: zipUrl
        });
    } catch (err) {
        return error('Error downloading project assets', err.message);
    }
};