import Axios from "axios"

const axios = Axios.create({
	baseURL: process.env.API_BASE_URL,
})

export default axios