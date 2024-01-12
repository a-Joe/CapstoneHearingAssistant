require('dotenv').config();
const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');

//Implementing Amazon S3
const s3 = new S3({
    accessKeyId: process.env.AWS_ACESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
})

//Add file to S3 storage
function addFile(file, filename, bucket) {
    const params = {
        Bucket: bucket,
        Key: filename,
        Body: file
    };
    
    return s3.upload(params).promise();
}

//Get file from S3 storage
function getFile(fileKey, bucket) {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucket
    };

    return s3.getObject(downloadParams).promise();
}

//Delete file
function deleteFile(fileKey, bucket) {
    const deleteParams = {
        Bucket: bucket,
        Key: fileKey
    };

    return s3.deleteObject(deleteParams).promise();
}

module.exports = { addFile, getFile, deleteFile };