import axios from 'axios';
import qs from 'query-string';

const API_SERVICE_URL = process.env.REACT_APP_API_HOSTNAME + "/api/";

// export const fetchSingleUser = (type, id) => {
//     return axios.get(`${API_SERVICE_URL + url}/${id}`);
// }

export const updatePhotographerServiceInformation = (uid, serviceInformation) => {
    return axios.put(`${API_SERVICE_URL}photographers/${uid}`, serviceInformation);
}
