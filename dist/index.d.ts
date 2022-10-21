import type { Plugin } from 'vite';
interface SvgrPluginOptions {
    keepEmittedAssets?: boolean;
    svgrOptions?: SVGROptions;
}
interface SVGROptions {
    icon?: boolean;
    dimensions?: boolean;
    expandProps?: 'start' | 'end' | false;
    svgo?: boolean;
    ref?: boolean;
    memo?: boolean;
    replaceAttrValues?: Record<string, string>;
    svgProps?: Record<string, string>;
    titleProp?: boolean;
}
export default function svgrPlugin(options?: SvgrPluginOptions): Plugin;
export declare function svgrOptionsFromQuery(query: string): SVGROptions;
export {};
