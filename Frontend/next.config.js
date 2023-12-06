/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
    ...nextConfig,
    async headers() {
        return [
            {
                // matching all routes
                source: "/:path*",
                headers: [
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: "true"
                    },
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "https://rattler-major-severely.ngrok-free.app"
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT"
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
                    },
                ]
            }
        ]
    }
};

