import { ParsedFeature, Options } from './models';
export declare const parseFeature: (featurePath: string, featureText: string, options?: Options | undefined) => ParsedFeature;
export declare const loadFeature: (featureFilePath: string, options?: Options | undefined) => ParsedFeature;
