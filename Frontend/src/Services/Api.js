
import axios from 'axios'

export default() => {
  return axios.create({
    baseURL: process.env.VUE_APP_BACKEND_URL
  })
}


// http://198.211.109.6/api
// http://localhost:8080/api
// 'http://'+process.env.VUE_APP_BACKEND_URL+'/api'
// Git Test
