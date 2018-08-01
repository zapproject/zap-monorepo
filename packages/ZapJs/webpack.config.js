

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    target: "node",
    externals: {
        fs: "commonjs fs"
    }
}
