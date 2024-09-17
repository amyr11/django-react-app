/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		API_BASE_URL: process.env.API_BASE_URL,
	},
	webpack: config => {
		config.watchOptions = {
			poll: 1000,
			aggregateTimeout: 300,
		}
		return config
	},
};

export default nextConfig;
