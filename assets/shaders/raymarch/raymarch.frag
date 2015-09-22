precision highp float;

uniform   vec3    uEyePosition;
uniform   float   uElapsedTime;
uniform   vec2    uResolution;
uniform   vec2    uMouse;
uniform   mat3    uCamera;

float PI=3.14159265;

#define max_distance 30.0
#define min_distance 0.0
#define epsilon 0.001

struct {
  vec3 light1;
  vec3 light2;
  vec3 c1;
  vec3 c2;
} sceneObjs;

float smoothMin( float a, float b, float k ) {
  float res = exp(-k * a) + exp(-k * b);
  return -log(res) / k;
}

float combine(float d1, float d2, float r) {
  float m = min(d1, d2);
  if( (d1 < r) && (d2 < r)) {
    return min(m, r - sqrt((r - d1) * (r - d1) + (r - d2) * (r - d2)));    
  } else {
    return m;
  }
}

float cylinderYZ(vec3 p, vec3 c) {
  return length(p.yz - c.xy) - c.z;
}

float cylinderXZ(vec3 p, vec3 c) {
  return length(p.xz - c.xy) - c.z;
}

float cylinderXY(vec3 p, vec3 c) {
  return length(p.xy - c.xy) - c.z;
}

float sphere(vec3 point, float r) {
  return length(point) - r;
}

float roundBox(vec3 p, vec3 b, float r) {
  return length(max(abs(p) - b, 0.0)) - r;
}

vec3 repeat( vec3 p, vec3 c ) {
  vec3 q = mod(p , c) - 0.5 * c;
  return q;
}

float mandelbulb(vec3 point) {
  vec3 z = point;
  float power = 8.0; //  * (sin(uElapsedTime) + 2.0);
  float dr = 1.0;
  float r = 0.1;
  for (int i = 0; i < 8 ; i++) {
    r = length(z);
    if(r > 16.0) break;
    
    // convert to polar coordinates
    float theta = acos(z.z/r); // * (1.0 + sin(uElapsedTime * PI * 0.1) * 0.2);
    float phi = atan(z.y,z.x);
    dr =  pow( r, power - 1.0) * power * dr + 1.0; // * (1.0 + cos(uElapsedTime * PI * 0.1) * 0.3);
    
    // scale and rotate the point
    float zr = pow(r, power);
    theta = theta * power;
    phi = phi * power;
    
    // convert back to cartesian coordinates
    z = zr * vec3( sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta) );
    z += point;
  }
  return 0.5 * log(r) * r/dr;
}

float scene(vec3 point) {
  float t = 0.3 * uElapsedTime;

  float ca = cos(t * PI * 0.05);
  float sa = sin(t * PI * 0.05);

  mat3 R1 = mat3(ca, 0.0, -sa, 0.0, 1.0, 0.0,  sa, 0.0,  ca);
  mat3 R2 = mat3(ca, -sa, 0.0,  sa,  ca, 0.0, 0.0, 0.0, 1.0);

  /*
  vec3 p = repeat(point, vec3(4.0, 4.0, 4.0));

  float r = sin( t );
  float c1 = cylinderYZ(repeat(point, vec3(0.0, 4.0, 4.0)), vec3(0.0, 0.0, 0.1));
  float c2 = cylinderXY(repeat(point, vec3(4.0, 4.0, 0.0)), vec3(0.0, 0.0, 0.1));
  float c3 = cylinderXZ(repeat(point, vec3(4.0, 0.0, 4.0)), vec3(0.0, 0.0, 0.1));

  float c = combine(c1, c2, 0.08);
  c = combine(c, c3, 0.08);

  float s = sphere(p, 0.7);

  float m = sphere(repeat(point * R, vec3(2.0, 2.0, 2.0)), 0.4);
  */
  return mandelbulb(repeat(point * R2 * R1 * R2, vec3(2.5, 2.5, 2.5)));

  vec3 p = point; //repeat(point, vec3(2.0, 2.0, 2.0));

  float m1 = mandelbulb((p + 0.2 * vec3(sin(uElapsedTime * PI * 0.2))) * R1 * R2 * R1);
  float m2 = mandelbulb(p * R2 * R1 * R2);

  float lights = combine(sphere(sceneObjs.light1 + p, 0.2), sphere(sceneObjs.light2 + p, 0.2), 0.01);
  //float m = combine(m1, m2, 0.05); 
  //float m = max(m1, -m2); //, 0.05);
  //float m = max(m1, -roundBox(p + vec3(0.5, 0.0, 0.0), vec3(1.6, 1.6, 0.1), 0.5)); //, 0.05);
  //return m; // * R1 * R2);
  //return mandelbulb(point);
  /* 
    combine(
      c,
      combine(
        sphere(p, 0.6), 
        roundBox(p, vec3(0.02, 1.0, 1.0), 0.02),
        0.08
      ),
      0.08
    );
  */
}

vec3 get_normal(vec3 point) {
  float d0 = scene(point);
  float dX = scene(point - vec3(epsilon, 0.0, 0.0));
  float dY = scene(point - vec3(0.0, epsilon, 0.0));
  float dZ = scene(point - vec3(0.0, 0.0, epsilon));
  return normalize(vec3(dX-d0, dY-d0, dZ-d0));
}

float raymarch(vec3 ray_origin, vec3 ray_direction) {
  
  float d = min_distance;
  vec3 new_point;

  for (int i = 0; i < 256; i++) {
    new_point = ray_origin + ray_direction * d;
    float s = scene(new_point);
    if(s < epsilon + epsilon * (d / max_distance)) {
      return d;
    }
    d += s;
    if (d > max_distance) {
      return max_distance;
    }
  }
  return max_distance;
}

void main(void) {

  vec2 uv = ((2.0 * gl_FragCoord.xy) - uResolution.xy) / min(uResolution.x, uResolution.y);

  vec3 eye_pos =  uEyePosition;
  vec3 forward =  vec3(uCamera[2]);
  vec3 up =       vec3(uCamera[1]);
  vec3 right =    vec3(uCamera[0]);

  float angle = PI * 2.0 * uElapsedTime * 0.17;
  float c = cos(angle);
  float s = sin(angle);

  mat3 R1 = mat3(c, 0.0, -s,  0.0, 1.0, 0.0,  s, 0.0, c);
  mat3 R2 = mat3(c, -s, 0.0,  s, c, 0.0,  0.0, 0.0, 1.0);

  sceneObjs.light1 = vec3(0.0, sin(uElapsedTime * PI * 0.7) * 4.0, -7.0) * R1 * R2;
  sceneObjs.light2 = vec3(0.0, sin(uElapsedTime * PI * 0.4) * 2.0, 7.0) * R2 * R1;
  sceneObjs.c1 = (vec3(0.3, 0.3, 0.3));
  sceneObjs.c2 = (vec3(0.4, 0.4, 0.4));

  vec3 ray_dir = normalize(up * uv.y + right * uv.x + forward);

  float d = raymarch(eye_pos, ray_dir);

  vec3 fog = vec3(1.0, 1.0, 1.0);

  if(d < max_distance) {
    vec3 point = (eye_pos + ray_dir * d);
    vec3 point_normal = get_normal(point);

    vec3 light_dir1 = -normalize(sceneObjs.light1 - point);
    vec3 light_dir2 = -normalize(sceneObjs.light2 - point);

    float dotp_diffuse1 = max(0.0, dot(light_dir1, point_normal));
    float dotp_diffuse2 = max(0.0, dot(light_dir2, point_normal));

    vec3 h = d / max_distance * vec3(0.2, 0.2, 0.4);

    vec3 col = h + (dotp_diffuse1 * sceneObjs.c1) + (dotp_diffuse2 * sceneObjs.c2);
    float fogFactor = 1.0 - exp( -d * 0.2);

    gl_FragColor = vec4(
      mix(
        col, 
        fog, 
        fogFactor
      ), 
      1.0
    );
  } else {
    gl_FragColor = vec4(fog, 1.0);
  }
}
