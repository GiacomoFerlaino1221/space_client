import axios from 'axios';
import crypto from 'crypto';
import request from 'request';

import { API_URI, ACCESS_KEY } from '../config';

export const GetProviderList = (currency) => {
  return new Promise((resolve, reject) => {
    let currency_key = localStorage.getItem(currency);
    
    axios.post('https://paygate.kuna.io/public-api/payment-prerequest', {
      currency: String(currency).toUpperCase(),
      public_key: currency_key
    })
      .then(({ data }) => resolve(data.data))
      .catch((err) => reject(err));
  });
};

export const MakeDeposite = (currency, amount, code) => {
  return new Promise((resolve, reject) => {
    const apiKey = 'y0XaMQxwEFjL8byhNFuCTs1qCbOEGlOzufb3oHcc';
    const apiSecret = 'Hu3JQKojVcS0LAXvenLyZuj908Hpiohj0XKNHtcM';
    const apiPath = '/v3/auth/deposit';
    const nonce = Date.now().toString();

    const body = {
      currency: String(currency).toLowerCase(),
      amount: parseInt(amount)
    };

    let signature = `${apiPath}${nonce}${JSON.stringify(body)}`;
    const sig = crypto.createHmac('sha384', apiSecret).update(signature);
    const shex = sig.digest('hex');


    request.post(`https://api.kuna.io${apiPath}`, {
      headers: {
        'kun-nonce': nonce,
        'kun-apikey': apiKey,
        'kun-signature': shex
      },
      body: body,
      json: true
    }, (err, resp, body) => {
      if (err) reject(err);
      

      let obj = {};
      const { deposit_id } = body;

      obj.reference_id = deposit_id;
      obj.public_key = localStorage.getItem(String(currency).toLowerCase());
      obj.description = "Space";
      obj.service = String(code);
      obj.currency = String(currency).toUpperCase();
      obj.amount = parseInt(amount);

      request.post('https://paygate.kuna.io/public-api/payment-invoices', {
        body: obj,
        json: true,
      }, (error, response, bodyData) => {
        resolve(bodyData.data);
      })
    });
  });
}

export const CheckPayment = (deposit_id) => {
  return new Promise((resolve, reject) => {
    const apiKey = 'y0XaMQxwEFjL8byhNFuCTs1qCbOEGlOzufb3oHcc';
    const apiSecret = 'Hu3JQKojVcS0LAXvenLyZuj908Hpiohj0XKNHtcM';
    const apiPath = '/v3/auth/deposit/details';
    const nonce = Date.now().toString();

    const body = {
      id: deposit_id
    };

    let signature = `${apiPath}${nonce}${JSON.stringify(body)}`;
    const sig = crypto.createHmac('sha384', apiSecret).update(signature);
    const shex = sig.digest('hex');
    
    request.post(`https://api.kuna.io${apiPath}`, {
      headers: {
        'kun-nonce': nonce,
        'kun-apikey': apiKey,
        'kun-signature': shex
      },
      body: body,
      json: true
    }, (err, resp, body) => {
      if (err) reject(err);
      resolve(body);
    });

  });
}

export const SendCoins = (amount, wallet) => {
  // send_coins
  return new Promise((resolve, reject) => {
    axios.post(`${API_URI}/v1/send_coins`, {
      amount,
      wallet
    }, {
      headers: {
        'x-minter-key': ACCESS_KEY
      }
    })
      .then(({ data }) => resolve(data))
      .catch((err) => reject(err));
  })
}

export const AuthenticateKuna = () => {
  return new Promise((resolve, reject) => {
    const apiKey = 'y0XaMQxwEFjL8byhNFuCTs1qCbOEGlOzufb3oHcc';
    const apiSecret = 'Hu3JQKojVcS0LAXvenLyZuj908Hpiohj0XKNHtcM';
    const apiPath = '/v3/auth/me';
    const nonce = Date.now().toString();
    const body = {};

    let signature = `${apiPath}${nonce}${JSON.stringify(body)}`;
    const sig = crypto.createHmac('sha384', apiSecret).update(signature);
    const shex = sig.digest('hex');


    request.post(`https://api.kuna.io${apiPath}`, {
      headers: {
        'kun-nonce': nonce,
        'kun-apikey': apiKey,
        'kun-signature': shex
      },
      body: body,
      json: true
    }, (err, resp, body) => {
      if (err) reject(err);
      resolve(body);
    });

  });
}

