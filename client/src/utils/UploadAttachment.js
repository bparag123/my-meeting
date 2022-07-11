import axios from 'axios'

const getPresignedUrl = async (key, type) => {
    const response = await axios.post('https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/storeMedia', {
        Key: key,
        ContentType: type
    })
    return response.data.url.uploadURL
}

const uploadFileToBucket = async (presignedUrl, file) => {
    try {
        const options = {
            headers: { "Content-Type": file.type }
        }
        const result = await axios.put(presignedUrl, file, {
            ...options,
            onUploadProgress: (e) => {
                console.log("Uploading ", e)
            },

        })
        return result
    } catch (error) {
        return error.message
    }

}

const getFileDownloadableUrl = async (name) => {

    const result = await axios.post('https://iaz55f28ph.execute-api.us-east-1.amazonaws.com/dev/meetings/getMedia', {
        Key: name
    })
    return result.data.url.getURL
}
export { getPresignedUrl, uploadFileToBucket, getFileDownloadableUrl }