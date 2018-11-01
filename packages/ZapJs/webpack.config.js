
const path = require("path")
module.exports = {
    entry: {
        "zapjs": "./src/index.ts"
       // "zapjs.min": "./src/index.ts"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js",
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".ts", ".js", ".json"]
    },
    optimization: {
        minimize: true
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: "awesome-typescript-loader",
                        options: {
                            transpileOnly: true,
                            happyPackModeL: true
                        }
                    },
                    {
                        loader: "cache-loader"
                    },
                    {
                        loader: "babel-loader"
                    }
                ],
                exclude: [
                    /node_modules/,
                    /test/,
                    /dist/,
                    /.cache-loader/
                ]

            }
        ]
    }
}
