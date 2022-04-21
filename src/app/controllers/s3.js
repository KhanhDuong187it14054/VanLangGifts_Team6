require('dotenv').config();
const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');

const bucketName = 'vanlanggifts-web';
const region = 'us-west-2';
const accessKeyId = 'AKIA2P3DKJENLSYKS447';
const secretAccessKey = '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';

// const s3 = new S3({
//     region,
//     accessKeyId,
//     secretAccessKey,
// })

// //uploads a file to s3
// function uploadFile(files) {

//     for(var i = 0; i < files.length; i++) {
//         var file = files[i];
//         console.log('--filepath', file.path)
//         const fileStream = fs.createReadStream(file.path);

//         const uploadParams = {
//             Bucket: bucketName,
//             Body: fileStream,
//             Key: file.filename
//         }
//         return s3.upload(uploadParams).promise()
//     }
// }
// exports.uploadFile = uploadFile

// //downloads a file from s3

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});
exports.uploadFile = async (files) => {
    const params = files.map((file) => {
        const fileStream = fs.createReadStream(file.path);

        return {
            Bucket: bucketName,
            Body: fileStream,
            Key: file.filename,
        };
    });

    return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

exports.getFileStream = async (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    };
    return s3.getObject(downloadParams).createReadStream();
};
