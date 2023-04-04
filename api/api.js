import axios from 'axios';

const apiUrl = process.env.NODE_ENV === 'prod' 
  ? `https://yogahome.cyclic.app`
  : `http://localhost:${Number(process.env.PORT)}`;


console.log(process.env.NODE_ENV)
console.log(apiUrl)

const axiosInstanceUrl = axios.create({
  baseURL: apiUrl,
});

export {axiosInstanceUrl};