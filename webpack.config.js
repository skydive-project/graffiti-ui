const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebPackPlugin = require('copy-webpack-plugin');
var nodeExternals = require('webpack-node-externals');
const path = require('path');

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/index.html",
    filename: "./index.html"
});

module.exports = [
    {
        entry: {
            index: './src/Index.tsx',
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: '[name].js',
            publicPath: '/',
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    use: {
                        loader: 'awesome-typescript-loader'
                    },
                    exclude: /node_modules/
                },
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                            }
                        }
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'fonts/'
                            }
                        }
                    ]
                }
            ]
        },

        devServer: {
            historyApiFallback: true,
        },

        devtool: "source-map",

        plugins: [
            htmlPlugin,
            new CopyWebPackPlugin([
                { from: 'assets', to: 'assets' }
            ])
        ]
    },
    {
        entry: {
            app: './src/lib/index.js',
        },
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: 'index.js',
            umdNamedDefine: true,
            library: 'graffiti-ui',
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.(t|j)sx?$/,
                    use: {
                        loader: 'awesome-typescript-loader'
                    },
                    exclude: /node_modules/
                },
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.(gif|png|jpe?g|svg)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                            }
                        }
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'fonts/'
                            }
                        }
                    ]
                }
            ]
        },

        devServer: {
            historyApiFallback: true,
        },

        devtool: "source-map"
    }
]
