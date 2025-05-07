// This gist contains JavaScript functions and tests for:
// - conversion from gamma-corrected (or gamma-compressed) sRGB to linear RGB, to Oklab
// - interpolation through Oklab
// - conversion back to linear RGB, then sRGB
// To use these tests, install nodejs, save this file locally, and run with:
//    node OklabExperiments.js
// No other dependencies are required to use this.
// Thanks to some helpful folks in the generative art community for helping me better understand what's happening with this.

// My toddler smacked the keyboard with a piece of cardboard and made me accidentally type:
// zaser~

// Some color / math code tweaked from functions found in this repo: https://github.com/mattdesl/tiny-artblocks

function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
  }
  
  // returns an object literal which is r, g and b integers from an RGB hex string:
  function hexToRGB(str) {
    var hex = str.replace("#", "");
    // NOTE: This can be removed for brevity if you stick with 6-character codes:
    // if (hex.length === 3) {hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];}
    var num = parseInt(hex, 16);
    return {r: num >> 16, g: (num >> 8) & 255, b: num & 255};
  };
  
  // converts RGB integer values to hex:
  function rgbToHex({r, g, b}) {
    // NEXT LINE OPTIONAL, depending on your purposes:
    // var r = clamp(r, 0, 255); var g = clamp(g, 0, 255); var b = clamp(b, 0, 255);
    return "#" + (b | (g << 8) | (r << 16) | (1 << 24)).toString(16).slice(1);
  }
  
  // correlary of first psuedocode block here (f_inv) : https://bottosson.github.io/posts/colorwrong/#what-can-we-do%3F ; "applying the inverse of the sRGB nonlinear transform function.." -- keeping the abbreviated syntax of arrow functions and ? : if/then, despite that they confuse and stretch my noob brain:
  const gammaToLinear = (c) =>
    c >= 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  // correlary of the first " : "..then switching back" :
  const linearToGamma = (c) =>
    c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  
  // Lab coordinates (parameters):
  // L = Lightness (0 (black) to ?? (diffuse white)
  // a = green (at negative -- is there a lower bound?) to red (positive)
  // b = blue (at negative) to yellow (at positive).
  // You can manually construct an object literal to pass to this function this way:
  // labVals = {L: 0.75, a: 0.7, b: 0.2};
  // sRGBresultObjectLiteral = oklabToSRGB(labVals);
  // You can also construct that as just {0.75, 0.7, 0.2}, and still pass it and it will work, apparently
  // "..Oklab is represented as an object {L, a, b} where L is between 0 and 1 for normal SRGB colors. a and b have a less clearly defined range, but will normally be between -0.5 and +0.5. Neutral gray colors will have a and b at zero (or very close)." re: https://www.npmjs.com/package/oklab
  // numbers updated from C++ example at https://bottosson.github.io/posts/oklab/ as updated 2021-01-25
  // helpful references:
  // https://observablehq.com/@sebastien/srgb-rgb-gamma
  // Other references: https://matt77hias.github.io/blog/2018/07/01/linear-gamma-and-sRGB-color-spaces.html
  // Takeaway: before manipulating color for sRGB (gamma-corrected or gamma compressed), convert it to linear RGB or a linear color space. Then do the manipulation, then convert it back to sRGB.
  function rgbToOklab({r, g, b}) {
    // This is my undersanding: JavaScript canvas and many other virtual and literal devices use gamma-corrected (non-linear lightness) RGB, or sRGB. To convert sRGB values for manipulation in the Oklab color space, you must first convert them to linear RGB. Where Oklab interfaces with RGB it expects and returns linear RGB values. This next step converts (via a function) sRGB to linear RGB for Oklab to use:
    r = gammaToLinear(r / 255); g = gammaToLinear(g / 255); b = gammaToLinear(b / 255);
    // This is the Oklab math:
    var l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    var m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    var s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    // Math.crb (cube root) here is the equivalent of the C++ cbrtf function here: https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab
    l = Math.cbrt(l); m = Math.cbrt(m); s = Math.cbrt(s);
    return {
      L: l * +0.2104542553 + m * +0.7936177850 + s * -0.0040720468,
      a: l * +1.9779984951 + m * -2.4285922050 + s * +0.4505937099,
      b: l * +0.0259040371 + m * +0.7827717662 + s * -0.8086757660
    }
  }
  
  function oklabToSRGB({L, a, b}) {
    var l = L + a * +0.3963377774 + b * +0.2158037573;
    var m = L + a * -0.1055613458 + b * -0.0638541728;
    var s = L + a * -0.0894841775 + b * -1.2914855480;
    // The ** operator here cubes; same as l_*l_*l_ in the C++ example:
    l = l ** 3; m = m ** 3; s = s ** 3;
    var r = l * +4.0767416621 + m * -3.3077115913 + s * +0.2309699292;
    var g = l * -1.2684380046 + m * +2.6097574011 + s * -0.3413193965;
    var b = l * -0.0041960863 + m * -0.7034186147 + s * +1.7076147010;
    // Convert linear RGB values returned from oklab math to sRGB for our use before returning them:
    r = 255 * linearToGamma(r); g = 255 * linearToGamma(g); b = 255 * linearToGamma(b);
    // OPTION: clamp r g and b values to the range 0-255; but if you use the values immediately to draw, JavaScript clamps them on use:
    r = clamp(r, 0, 255); g = clamp(g, 0, 255); b = clamp(b, 0, 255);
    // OPTION: round the values. May not be necessary if you use them immediately for rendering in JavaScript, as JavaScript (also) discards decimals on render:
      r = Math.round(r); g = Math.round(g); b = Math.round(b);
    return {r, g, b};
  }
