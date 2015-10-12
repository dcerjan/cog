let clamp = (val, min, max) => val < min ? min : val > max ? max : val;

let sphericalToCartesian = (r, theta, phi) => {
  let sintheta = Math.sin(theta);
  return [
    r * sintheta * Math.cos(phi),
    r * sintheta * Math.sin(phi),
    r * Math.cos(theta)
  ];
};

let MathUtil = {
  sphericalToCartesian,
  clamp
};

export default MathUtil;
