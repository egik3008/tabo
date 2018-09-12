let urlUploadRequest = process.env.REACT_APP_CLOUDINARY_API_BASE_URL;
    urlUploadRequest += '/image/upload';
const defaultPreset = process.env.REACT_APP_CLOUDINARY_PHOTOS_PORTFOLIO_PRESET

export const uploadPhoto = (fileItemObject, tags, preset = defaultPreset) => {
    if (fileItemObject.size <= 10000000) {
        const formData = new FormData();
        formData.append('upload_preset', preset);
        formData.append('tags', tags);
        formData.append('file', fileItemObject);

        return axios.post(urlUploadRequest, formData);
        
      } else {
        return new Promise();
      }
}