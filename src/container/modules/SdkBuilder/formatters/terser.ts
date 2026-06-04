import { minify } from "terser";
import type { SdkBuilderFormatter } from "../SdkBuilder.types.js";

/**
 * Default SDK formatter — minifies the generated bundle with terser.
 *
 * Pass to `output.formatter` in `config/sdkbuilder.ts`:
 *   import { terserFormatter } from "../container/modules/SdkBuilder/formatters/terser.js";
 *   output: { filename: "sdk/api.sdk.js", formatter: terserFormatter }
 *
 * Swap out for any other tool by supplying a different formatter function:
 *
 *   // uglify-js@3
 *   import UglifyJS from "uglify-js";
 *   formatter: (code) => UglifyJS.minify(code).code
 *
 *   // prettier (for readable formatted output)
 *   import prettier from "prettier";
 *   formatter: (code) => prettier.format(code, { parser: "babel" })
 *
 *   // no formatting — omit the property entirely
 */
export const terserFormatter: SdkBuilderFormatter = async (code: string): Promise<string> => {
  try {
    const result = await minify(code, {
      compress: {
        drop_console: false,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    });
    return result.code ?? code;
  } catch (err) {
    Logger.log(`[SdkBuilder] terser failed, writing unformatted output: ${err}`);
    return code;
  }
};
