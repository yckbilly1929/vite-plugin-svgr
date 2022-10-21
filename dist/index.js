"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.svgrOptionsFromQuery = void 0;
const fs_1 = __importDefault(require("fs"));
const esbuild_1 = require("esbuild");
const core_1 = require("@svgr/core");
function svgrPlugin(options = {}) {
    const transformed = [];
    return {
        name: 'vite:svgr',
        async transform(code, id) {
            var _a;
            if (id.indexOf('.svg?component') === -1) {
                return null;
            }
            const globalSvgrOptions = (_a = options === null || options === void 0 ? void 0 : options.svgrOptions) !== null && _a !== void 0 ? _a : {};
            const queryIndex = id.indexOf('?component');
            const query = id.substr(queryIndex + 1);
            const specificSvgrOptions = svgrOptionsFromQuery(query);
            const svgrOptions = Object.assign(Object.assign({}, globalSvgrOptions), specificSvgrOptions);
            const svgDataPath = id.substr(0, queryIndex);
            const svgData = await fs_1.default.promises.readFile(svgDataPath, 'utf8');
            const componentCode = await (0, core_1.transform)(svgData, svgrOptions, { filePath: svgDataPath });
            const component = await (0, esbuild_1.transform)(componentCode, { loader: 'jsx' });
            transformed.push(id);
            return { code: component.code, map: null };
        },
        generateBundle(config, bundle) {
            if (options.keepEmittedAssets) {
                return;
            }
            for (const [key, bundleEntry] of Object.entries(bundle)) {
                const { type, name } = bundleEntry;
                if (type === 'asset' &&
                    (name === null || name === void 0 ? void 0 : name.endsWith('.svg')) &&
                    transformed.findIndex((id) => id.includes(name)) >= 0) {
                    delete bundle[key];
                }
            }
        }
    };
}
exports.default = svgrPlugin;
function svgrOptionsFromQuery(query) {
    const options = {};
    const pairs = query.split('&');
    pairs.forEach((pair) => {
        var _a;
        const [key, value] = pair.split('=');
        switch (key) {
            case 'ref':
            case 'icon':
            case 'svgo':
            case 'memo':
            case 'titleProp':
            case 'dimensions': {
                if (!value || value === 'true') {
                    options[key] = true;
                }
                else if (value === 'false') {
                    options[key] = false;
                }
                else {
                    throw new Error(`Invalid boolean option value: ${key} = "${value}"`);
                }
                break;
            }
            case 'expandProps': {
                if (value === 'start' || value === 'end') {
                    options[key] = value;
                }
                else if (value === 'false') {
                    options[key] = false;
                }
                else {
                    throw new Error(`Invalid expandProps option value: "${value}"`);
                }
                break;
            }
            case 'svgProps':
            case 'replaceAttrValues': {
                if (!value) {
                    throw new Error(`Missing "${key}" k/v pair`);
                }
                const [k, v] = value.split(':');
                if (!v) {
                    throw new Error(`Missing "${key}" value`);
                }
                (_a = options[key]) !== null && _a !== void 0 ? _a : (options[key] = {});
                options[key][k] = v;
                break;
            }
            case 'component': {
                break;
            }
            default: {
                throw new Error(`Invalid svgr option: "${key}"`);
            }
        }
    });
    return options;
}
exports.svgrOptionsFromQuery = svgrOptionsFromQuery;
