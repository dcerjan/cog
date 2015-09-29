
let _evalSegmentPosition3 = (spline, t, segment) => {
  let 
    i = segment + 1,
    t2 = t * t,
    t3 = t2 * t;
  
  return new Vector3(
    0.5*( (2.0 * spline.points[i].x) + 
          (     -spline.points[i-1].x +       spline.points[i+1].x) * t +
          (2.0 * spline.points[i-1].x - 5.0 * spline.points[i].x + 4.0 * spline.points[i+1].x - spline.points[i+2].x) * t2 +
          (     -spline.points[i-1].x + 3.0 * spline.points[i].x - 3.0 * spline.points[i+1].x + spline.points[i+2].x) * t3 ),
    0.5*( (2.0 * spline.points[i].y) + 
          (     -spline.points[i-1].y +       spline.points[i+1].y) * t +
          (2.0 * spline.points[i-1].y - 5.0 * spline.points[i].y + 4.0 * spline.points[i+1].y - spline.points[i+2].y) * t2 +
          (     -spline.points[i-1].y + 3.0 * spline.points[i].y - 3.0 * spline.points[i+1].y + spline.points[i+2].y) * t3 ),
    0.5*( (2.0 * spline.points[i].z) + 
          (     -spline.points[i-1].z +       spline.points[i+1].z) * t +
          (2.0 * spline.points[i-1].z - 5.0 * spline.points[i].z + 4.0 * spline.points[i+1].z - spline.points[i+2].z) * t2 +
          (     -spline.points[i-1].z + 3.0 * spline.points[i].z - 3.0 * spline.points[i+1].z + spline.points[i+2].z) * t3 )
  );
};

let _evalSegmentDerivative3 = (spline, t, segment) => {
  let 
    i = segment + 1,
    t2 = t * t;
  // calculate the first derivative approach
  return new Vector3(
    0.5*( (       -spline.points[i-1].x +        spline.points[i+1].x) +
          (  4.0 * spline.points[i-1].x - 10.0 * spline.points[i].x + 8.0 * spline.points[i+1].x - 2.0 * spline.points[i+2].x) * t +
          ( -3.0 * spline.points[i-1].x +  9.0 * spline.points[i].x - 9.0 * spline.points[i+1].x + 3.0 * spline.points[i+2].x) * t2 ),
    0.5*( (       -spline.points[i-1].y +        spline.points[i+1].y) +
          (  4.0 * spline.points[i-1].y - 10.0 * spline.points[i].y + 8.0 * spline.points[i+1].y - 2.0 * spline.points[i+2].y) * t +
          ( -3.0 * spline.points[i-1].y +  9.0 * spline.points[i].y - 9.0 * spline.points[i+1].y + 3.0 * spline.points[i+2].y) * t2 ),
    0.5*( (       -spline.points[i-1].z +        spline.points[i+1].z) +
          (  4.0 * spline.points[i-1].z - 10.0 * spline.points[i].z + 8.0 * spline.points[i+1].z - 2.0 * spline.points[i+2].z) * t +
          ( -3.0 * spline.points[i-1].z +  9.0 * spline.points[i].z - 9.0 * spline.points[i+1].z + 3.0 * spline.points[i+2].z) * t2 )
  );
};

let _evalSegmentTangent3 = (spline, t, eps, segment) => {
  if(t <= 0.0) {
    return spline.points[segment-1].sub(spline.points[segment+1]).normalize();
  } else  if(t > (1.0 - eps)) {
    return spline.points[segment].sub(spline.points[segment+2]).normalize();
  } else {
    let
      src = _evalSegmentPosition3(spline, t, segment);
      dest = _evalSegmentPosition3(spline, t + eps, segment);
      ret = dest.sub(src);
    return ret;
  }
};


class CatmullRomSpline3 {
  constructor() {
    this.points = [];
    this.arcs   = [];
    this.len    = 0.0;
  }

  addPoint(point) {
    this.points.push(point);
  }

  clear() {
    this.points = [];
    this.arcs   = [];
    this.len    = 0.0;
  }

  compile(resolution, closed) {
    if(this.points.lenght < 4) { throw new Error("CatmullRom2.compile cannot be called on spline with less than 4 control poligon points"); }
    if(resolution <= 0) { throw new Error("CatmullRom2.compile resolution must be greater than 0"); }

    if(closed) {
      this.points.push(this.points[0]);
      this.points.push(this.points[1]);
      this.points.push(this.points[2]);
    }

    let
      numSegments = this.points.size - 3;
      i, j, len, nv, ov, tmp, step, t;
    
    this.len = 0.0;
    this.arcs = [];
    
    step = 1.0 / resolution;
    
    // iterate over segments
    for(i = 0; i < numSegments; ++i) {
      ov = nv = _evalSegmentPosition3(this, 0.0, i);
      // aproximate lenghts for current segment
      len = 0.0;
      for(j = 1; j <= resolution; ++j) {
        t = j * step;
        // protect from extrapolation float error
        if(t > 1.0) t = 1.0;
        nv = _evalSegmentPosition3(this, t, i);
        tmp = nv.sub(ov);
        len += tmp.length();
        ov = nv;
      } 
      this.arcs.push(len);
      this.len += len;
    }
  }

  position(t) {
    // first we have to find in which segment our t lies
    let
      len = t * this.len,
      tlen = 0.0,
      i, nt;

    for(i = 0; i < this.arcs.size; ++i) {
      // if target len is in between curent segments start len and end len we have found a target segment
      if( (len > tlen) && (len  <= (tlen + this.arcs[i])) ) break;
      tlen += this.arcs[i];
    }
    
    nt = (len - tlen) / (this.arcs[i]);

    // get the position at target interpolation factor for target segment
    return _evalSegmentPosition3(this, nt, i);
  }

  tangent(t, epsilon) {
    // first we have to find in which segment our t lies
    let
      len = t * this.len,
      tlen = 0.0,
      i, nt;

    for(i = 0; i < this.arcs.size; ++i) {
      // if target len is in between curent segments start len and end len we have found a target segment
      if( (tlen >= len && tlen) < (len + this.arcs[i]) ) break;
      tlen += this.arcs[i];
    }
    
    // transform our interpolation factor to target segment's lenght span
    nt = (len - tlen) / (this.arcs[i]);
    
    // get the position at target interpolation factor for target segment
    return _evalSegmentTangent3(this, nt, epsilon, i);
  }
}


export default CatmullRomSpline3;
