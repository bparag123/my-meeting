// import { Storage } from "@aws-amplify/storage"

// const upload = async (fileObj) => {
//     const response = await Storage.put('uploadfiles/', fileObj, {
//         contentType: fileObj.type,
//     })
//     console.log(response)
// }

// export default upload

// import config from "../config"
// import AWS from 'aws-sdk'

// AWS.config.credentials = new AWS.Credentials(config.ACCESS_KEY_ID, config.SECRET_ACCESS_KEY, null)

// const uploadFile = async (fileObj) => {
//     console.log(fileObj)
//     const myBucket = 'datadesignattachments'
//     const s3 = new AWS.S3({
//         region: 'us-east-1',
//         params: {
//             Bucket: myBucket
//         }
//     })

//     const params = {
//         ACL: 'public-read',
//         Body: fileObj.file,
//         Bucket: myBucket,
//         Key: fileObj.name
//     };

//     s3.putObject(params)
//         .on('httpUploadProgress', (evt) => {
//             console.log(evt)
//         })
//         .send((err) => {
//             if (err) console.log(err)
//         })
// }

// export default uploadFile