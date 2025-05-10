module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: ['react-native-reanimated/plugin'], // ⚠️ dòng này LUÔN nằm cuối
    };
};
