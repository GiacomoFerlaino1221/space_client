import axios from 'axios';
import { API_URI, ACCESS_KEY } from '../config';

export const GetLocal = (lang = 'en') => {
  return new Promise((resolve, reject) => {
    axios.get(`${API_URI}/v1/local`, {
      headers: {
        'x-minter-key': ACCESS_KEY
      }
    })
    .then(({ data }) => {
      let currentLocal = {};
      console.log(data);
      for (let key in data.local) {
        if (lang === 'en') {
          currentLocal[key] = data.local[key].en;
        }
        if (lang === 'ru') {
          currentLocal[key] = data.local[key].ru;
        }
      }
      resolve({ local: currentLocal });
    })
    .catch((err) => reject({ msg: err.message }));
  });
}