
/*******************************************************************************************************/
/*  Convert number to half                                                                             */
/*  from: http://stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript  */
/*******************************************************************************************************/

let ToHalf = ( () => {
  let 
    floatView = new Float32Array(1),
    int32View = new Int32Array(floatView.buffer);

  return function( fval ) {
    
    let
      fbits = int32View[0],
      sign  = (fbits >> 16) & 0x8000,          // sign only
      val   = ( fbits & 0x7fffffff ) + 0x1000; // rounded value

    floatView[0] = fval;

    if( val >= 0x47800000 ) {             // might be or become NaN/Inf
      if( ( fbits & 0x7fffffff ) >= 0x47800000 ) {
                                          // is or must become NaN/Inf
        if( val < 0x7f800000 ) {          // was value but too large
          return sign | 0x7c00;           // make it +/-Inf
        }
        return sign | 0x7c00 |            // remains +/-Inf or NaN
            ( fbits & 0x007fffff ) >> 13; // keep NaN (and Inf) bits
      }
      return sign | 0x7bff;               // unrounded not quite Inf
    }
    if( val >= 0x38800000 ) {             // remains normalized value
      return sign | val - 0x38000000 >> 13; // exp - 127 + 15
    }
    if( val < 0x33000000 )  {             // too small for subnormal
      return sign;                        // becomes +/-0
    }
    val = ( fbits & 0x7fffffff ) >> 23;   // tmp exp for subnormal calc
    return sign | ( ( fbits & 0x7fffff | 0x800000 ) // add subnormal bit
         + ( 0x800000 >>> val - 102 )     // round depending on cut off
         >> 126 - val );                  // div by 2^(1-(exp-127+15)) and >> 13 | exp=0
  };
})();

export default ToHalf;