!(function n(i, o, a) {
    function s(t, e) {
        if (!o[t]) {
            if (!i[t]) {
                var r = "function" == typeof require && require;
                if (!e && r) return r(t, !0);
                if (u) return u(t, !0);
                throw (((r = new Error("Cannot find module '" + t + "'")).code = "MODULE_NOT_FOUND"), r);
            }
            (r = o[t] = { exports: {} }),
                i[t][0].call(
                    r.exports,
                    function (e) {
                        return s(i[t][1][e] || e);
                    },
                    r,
                    r.exports,
                    n,
                    i,
                    o,
                    a
                );
        }
        return o[t].exports;
    }
    for (var u = "function" == typeof require && require, e = 0; e < a.length; e++) s(a[e]);
    return s;
})(
    {
        1: [
            function (e, t, r) {
                const n = e("webgl-context"),
                    i = n({ antialias: !0 }),
                    o = (e("gl-reset")(i), e("./lib/app-instance"));
                let a,
                    s = document.getElementById("screen"),
                    u = document.getElementById("loading");
                window.addEventListener(
                    "load",
                    () => {
                        (a = o(i, s)), s.appendChild(a.canvas), (u.style.display = "none");
                    },
                    !1
                );
            },
            { "./lib/app-instance": 2, "gl-reset": 27, "webgl-context": 73 },
        ],
        2: [
            function (e, t, r) {
                let ee = e("./app"),
                    te = e("object-assign"),
                    re = e("gl-fbo"),
                    ne = e("gl-shader"),
                    ie = e("gl-texture2d"),
                    n = e("glslify"),
                    oe = e("ndarray"),
                    ae = e("ndarray-fill"),
                    se = e("a-big-triangle"),
                    ue = n(["#define GLSLIFY 1\nattribute vec2 position;\n\nvarying vec2 vUv;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n  vUv = 0.5 * (position + 1.0);\n}"]),
                    fe = n([
                        "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D buffer;\nuniform sampler2D refTex;\nuniform sampler2D dataTex;\nuniform sampler2D data2Tex;\nuniform vec2 dims;\nuniform float time;\nuniform float frame;\nuniform float scale;\n\nvarying vec2 vUv;\n\n// #pragma glslify: cellular2D = require('./cellular2D')\n// #pragma glslify: cellular2x2 = require('./cellular2x2')\n// #pragma glslify: cellular2x2x2 = require('./cellular2x2x2')\n// #pragma glslify: cellular3D = require('./cellular3D')\n//\n// Fractional Brownian motion\n// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83\n//\nfloat rand(float n) {\n  return fract(sin(n) * 43758.5453123);\n}\n\nfloat noise(float p) {\n  float fl = floor(p);\n  float fc = fract(p);\n  return mix(rand(fl), rand(fl + 1.0), fc);\n}\n\nfloat rand(vec2 n) { \n  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n}\n\nfloat noise(vec2 p){\n  vec2 ip = floor(p);\n  vec2 u = fract(p);\n  u = u*u*(3.0-2.0*u);\n\n  float res = mix(mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x), mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);\n  return res*res;\n}\n\nfloat mod289(float x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 perm(vec4 x) {\n  return mod289(((x * 34.0) + 1.0) * x);\n}\n\nfloat noise(vec3 p) {\n  vec3 a = floor(p);\n  vec3 d = p - a;\n  d = d * d * (3.0 - 2.0 * d);\n\n  vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);\n  vec4 k1 = perm(b.xyxy);\n  vec4 k2 = perm(k1.xyxy + b.zzww);\n\n  vec4 c = k2 + a.zzzz;\n  vec4 k3 = perm(c);\n  vec4 k4 = perm(c + 1.0);\n\n  vec4 o1 = fract(k3 * (1.0 / 41.0));\n  vec4 o2 = fract(k4 * (1.0 / 41.0));\n\n  vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);\n  vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);\n\n  return o4.y * d.y + o4.x * (1.0 - d.y);\n}\n\n#define NUM_OCTAVES 8\n\nfloat fbm(float x) {\n  float v = 0.0;\n  float a = 0.5;\n  float shift = float(100);\n  for (int i = 0; i < NUM_OCTAVES; ++i) {\n    v += a * noise(x);\n    x = x * 2.0 + shift;\n    a *= 0.5;\n  }\n  return v;\n}\n\nfloat fbm(vec2 x) {\n  float v = 0.0;\n  float a = 0.5;\n  vec2 shift = vec2(100);\n  // Rotate to reduce axial bias\n    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));\n  for (int i = 0; i < NUM_OCTAVES; ++i) {\n    v += a * noise(x);\n    x = rot * x * 2.0 + shift;\n    a *= 0.5;\n  }\n  return v;\n}\n\nfloat fbm(vec3 x) {\n  float v = 0.0;\n  float a = 0.5;\n  vec3 shift = vec3(100);\n  for (int i = 0; i < NUM_OCTAVES; ++i) {\n    v += a * noise(x);\n    x = x * 2.0 + shift;\n    a *= 0.5;\n  }\n  return v;\n}\n\n// #pragma glslify: snoise2 = require(glsl-noise/simplex/2d)\n// #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)\n// #pragma glslify: snoise4 = require(glsl-noise/simplex/4d)\n// #pragma glslify: cnoise2 = require(glsl-noise/classic/2d)\n// #pragma glslify: cnoise3 = require(glsl-noise/classic/3d)\n// #pragma glslify: cnoise4 = require(glsl-noise/classic/4d)\n// #pragma glslify: pnoise2 = require(glsl-noise/periodic/2d)\n// #pragma glslify: pnoise3 = require(glsl-noise/periodic/3d)\n// #pragma glslify: pnoise4 = require(glsl-noise/periodic/4d)\n\n// #pragma glslify: map = require(glsl-map)\n\n// #pragma glslify: random = require(glsl-random)\n\nvoid main() {\n  vec3 color = texture2D(buffer, vUv).rgb;\n\n  vec4 data = texture2D(dataTex, vUv);\n  vec4 data2 = texture2D(data2Tex, vUv);\n\n  vec2 pos = vec2(vUv.x + (data.r - 1.0/256.0) * scale * data.b * 256.0, vUv.y + (data.g - 1.0/256.0) * scale * data.a * 256.0);\n  // pos += fbm(vUv*40.1 + time*0.1) * 0.005;\n  pos = mod(pos, vec2(1.0));\n  if (data2.r > 0.0){\n    color = texture2D(refTex, pos).rgb;\n  } else {\n    color = texture2D(buffer, pos).rgb;\n  }\n\n  gl_FragColor = vec4(color, 1.0);\n}",
                    ]),
                    le = n(["precision mediump float;\n#define GLSLIFY 1\n\nuniform sampler2D buffer;\n\nvarying vec2 vUv;\n\nvoid main() {\n  gl_FragColor = texture2D(buffer, vUv);\n}"]),
                    he = e("./pattern-generator"),
                    ce = e("./flow-generator");
                t.exports = (a, e) => {
                    let r = Math.min(window.devicePixelRatio, 2),
                        t = a.canvas,
                        s = ee(t, { parent: e, scale: r })
                            .on("tick", J)
                            .on("dispose", function () {
                                k.dispose(), X.dispose(), shaderState[0].dispose(), shaderState[1].dispose(), q.dispose(), Y.dispose(), W.dispose(), clearTimeout($);
                            })
                            .on("resize", function () {
                                z();
                            }),
                        i = 0,
                        o = 0,
                        n = !1;
                    console.log("FXHASH", fxhash);
                    let u = 0.5,
                        f = Math.floor(s.shape[0] * u),
                        l = Math.floor(s.shape[1] * u);
                    var h;
                    let [c, p] =
                            (h = fxrand()) < 0.025
                                ? [f, 1 + Math.ceil(fxrand() * fxrand() * 15)]
                                : h < 0.975
                                ? [1 + Math.ceil(fxrand() * fxrand() * 15), 1 + Math.ceil(fxrand() * fxrand() * 15)]
                                : [1 + Math.ceil(fxrand() * fxrand() * 15), l],
                        d = Math.ceil(l / c),
                        g = Math.ceil(f / p),
                        _ = fxrand() < 0.7 ? 0.25 : 0.5;
                    var E;
                    let y = !1,
                        m = Math.floor(8 * fxrand()),
                        v = fxrand() < 0.5,
                        b =
                            ((E = fxrand()),
                            16 < c || 16 < p
                                ? E < 0.1
                                    ? 0
                                    : E < 0.5
                                    ? 1
                                    : 7
                                : E < 0.07
                                ? 0
                                : E < 0.19
                                ? 1
                                : E < 0.31
                                ? 2
                                : E < 0.34
                                ? 3
                                : E < 0.4
                                ? 4
                                : E < 0.58
                                ? 5
                                : E < 0.64
                                ? 6
                                : E < 0.74
                                ? 7
                                : E < 0.78
                                ? 8
                                : E < 0.83
                                ? 9
                                : E < 0.95
                                ? 10
                                : 11),
                        T = Math.floor(16 * fxrand()),
                        A = fxrand() < 0.4,
                        w = fxrand() < 0.4,
                        R = "noise",
                        x = 0.005 + 0.15 * fxrand(),
                        I = 16 * fxrand(),
                        N = fxrand() * fxrand() * fxrand(),
                        S = 0.05 + 0.1 * fxrand(),
                        M = 1 - 0.1 * fxrand(),
                        U = 1 - 0.1 * fxrand(),
                        L = !0,
                        F,
                        C,
                        O = 0.33 * fxrand(),
                        P = 0.33 * fxrand(),
                        B = 0.5 * fxrand(),
                        D = 0.5 * fxrand(),
                        j = 500 + Math.floor(4500 * fxrand()),
                        V = 500 + Math.floor(4500 * fxrand());
                    window.$fxhashFeatures = {
                        "Pattern width": 16 < p ? "max" : p,
                        "Pattern height": 16 < c ? "max" : c,
                        Dynamics: 0.25 === _ ? "normal" : "turbo",
                        Pattern: v ? "random" : m,
                        "Color mode": ((e) => {
                            switch (e) {
                                case 0:
                                    return "black and white";
                                case 1:
                                    return "full palette";
                                case 2:
                                    return "tone";
                                case 3:
                                    return "dark I";
                                case 4:
                                    return "normal I";
                                case 5:
                                    return "saturated I";
                                case 6:
                                    return "bright I";
                                case 7:
                                    return "random";
                                case 8:
                                    return "dark II";
                                case 9:
                                    return "normal II";
                                case 10:
                                    return "saturated II";
                                case 11:
                                    return "bright II";
                                default:
                                    return "";
                            }
                        })(b),
                        "Inverted b/w": A ? "yes" : "no",
                        Colored: w ? "background" : "foreground",
                        "Noise amp": x.toFixed(2),
                        "Noise seed": I.toFixed(2),
                        "Noise seed range": N.toFixed(2),
                        "Reset probability": Math.round(100 * S) + "%",
                        "Direction change probability": Math.round(100 * M) + "%",
                        "Reset change probability": Math.round(100 * U) + "%",
                        "Direction left right": (1 - O).toFixed(2),
                        "Direction up down": (1 - P).toFixed(2),
                        "Speed left right": (1 - B).toFixed(2),
                        "Speed up down": (1 - D).toFixed(2),
                        Interval: j + "-" + (j + V) + "ms",
                    };
                    let k = ne(a, ue, fe),
                        X = ne(a, ue, le),
                        G,
                        H,
                        q,
                        Y,
                        W;
                    function z() {
                        (f = Math.floor(s.shape[0] * u)),
                            (l = Math.floor(s.shape[1] * u)),
                            16 < p && (p = f),
                            16 < c && (c = l),
                            (d = Math.ceil(l / c)),
                            (g = Math.ceil(f / p)),
                            (G = [re(a, [f, l]), re(a, [f, l])]),
                            (H = 0),
                            (G[0].color[0].magFilter = a.NEAREST),
                            (G[0].color[0].minFilter = a.NEAREST),
                            (G[1].color[0].magFilter = a.NEAREST),
                            (G[1].color[0].minFilter = a.NEAREST);
                        let n = he([f, l], { rows: d, columns: g, singlePattern: y, patternType: m, randomPattern: v, colorMode: b, colorIndex: T, invertColors1: A, invertColors2: w }).pattern;
                        var e = ce([f, l], {
                            rows: d,
                            columns: g,
                            time: i,
                            frame: o,
                            type: R,
                            resetActive: L,
                            noiseAmp: x,
                            noiseSeed: I,
                            noiseSeedRange: N,
                            noiseReset: S,
                            directionThresholdRL: O,
                            directionThresholdUD: P,
                            speedThresholdRL: B,
                            speedThresholdUD: D,
                        });
                        (F = e.directionsRightLeft), (C = e.directionsUpDown), (speedRightLeft = e.speedRightLeft), (speedUpDown = e.speedUpDown), (reset = e.reset);
                        e = oe(new Uint8Array(f * l * 4), [f, l, 4]);
                        ae(e, (e, t, r) => (0 === r ? n[e + t * f][0] : 1 === r ? n[e + t * f][1] : 2 === r ? n[e + t * f][2] : 3 === r ? 255 : void 0)),
                            G[0].color[0].setPixels(e),
                            (q = ie(a, [f, l])),
                            q.setPixels(e),
                            (q.magFilter = a.NEAREST),
                            (q.minFilter = a.NEAREST),
                            (Y = ie(a, [g, d])),
                            (Y.magFilter = a.NEAREST),
                            (Y.minFilter = a.NEAREST),
                            (W = ie(a, [g, d])),
                            (W.magFilter = a.NEAREST),
                            (W.minFilter = a.NEAREST),
                            Z(),
                            Q();
                        for (let e = 0; e < 60; e++) J(0);
                    }
                    let K = () => {
                        let e = Math.floor(s.shape[0] * u),
                            n = Math.floor(s.shape[1] * u);
                        var t = j + Math.floor(fxrand() * V);
                        return setTimeout(function () {
                            if (fxrand() < 0.2) {
                                var t = fxrand() < 0.5;
                                let e = !1;
                                (e = !t || fxrand() < 0.5),
                                    (function (e, t) {
                                        if (e)
                                            for (let t = 0; t < d; t++)
                                                for (let e = 0; e < g; e++) {
                                                    var r = e + t * g;
                                                    0 === F[r] ? (F[r] = 2) : 2 === F[r] && (F[r] = 0);
                                                }
                                        if (t)
                                            for (let t = 0; t < d; t++)
                                                for (let e = 0; e < g; e++) {
                                                    var n = e + t * g;
                                                    0 === C[n] ? (C[n] = 2) : 2 === C[n] && (C[n] = 0);
                                                }
                                    })(t, e);
                            } else if (
                                ((flowScheme = ce([e, n], {
                                    rows: d,
                                    columns: g,
                                    time: i,
                                    frame: o,
                                    type: R,
                                    resetActive: L,
                                    noiseAmp: x,
                                    noiseSeed: I,
                                    noiseSeedRange: N,
                                    noiseReset: S,
                                    directionThresholdRL: O,
                                    directionThresholdUD: P,
                                    speedThresholdRL: B,
                                    speedThresholdUD: D,
                                })),
                                "noise" === R)
                            )
                                for (let t = 0; t < d; t++)
                                    for (let e = 0; e < g; e++) {
                                        var r = e + t * g;
                                        fxrand() < M && (F[r] = flowScheme.directionsRightLeft[r]),
                                            fxrand() < M && (C[r] = flowScheme.directionsUpDown[r]),
                                            fxrand() < M && (speedRightLeft[r] = flowScheme.speedRightLeft[r]),
                                            fxrand() < M && (speedUpDown[r] = flowScheme.speedUpDown[r]),
                                            fxrand() < U && (reset[r] = L ? flowScheme.reset[r] : 0);
                                    }
                            Z(), Q(), ($ = K());
                        }, t);
                    };
                    function Z() {
                        var e = oe(new Uint8Array(g * d * 4), [g, d, 4]);
                        ae(e, (e, t, r) => (0 === r ? F[e + t * g] : 1 === r ? C[e + t * g] : 2 === r ? speedRightLeft[e + t * g] : 3 === r ? speedUpDown[e + t * g] : 0)), Y.setPixels(e);
                    }
                    function Q() {
                        var e = oe(new Uint8Array(g * d * 4), [g, d, 4]);
                        ae(e, (e, t, r) => (0 === r ? reset[e + t * g] : 0)), W.setPixels(e);
                    }
                    (document.onkeydown = (e) => {
                        " " === (e = e || window.event).key && (n = !n);
                    }),
                        t.addEventListener("click", (e) => {
                            n = !n;
                        }),
                        z(),
                        (k.attributes.position.location = 0),
                        (X.attributes.position.location = 0),
                        a.disable(a.DEPTH_TEST),
                        s.start();
                    let $ = K();
                    return te(s, { canvas: t, gl: a });
                    function J(e) {
                        var t;
                        n ||
                            ((i += e / 1e3),
                            o++,
                            (function (e, t) {
                                let r = Math.floor(s.shape[0] * u),
                                    n = Math.floor(s.shape[1] * u),
                                    i = G[H],
                                    o = G[(H ^= 1)];
                                o.bind(),
                                    k.bind(),
                                    (k.uniforms.buffer = i.color[0].bind(0)),
                                    (k.uniforms.refTex = q.bind(1)),
                                    (k.uniforms.dataTex = Y.bind(2)),
                                    (k.uniforms.data2Tex = W.bind(3)),
                                    (k.uniforms.dims = s.shape),
                                    (k.uniforms.time = e),
                                    (k.uniforms.frame = t),
                                    (k.uniforms.scale = (720 * _) / Math.max(r, n)),
                                    se(a);
                            })(i, o),
                            (t = Math.floor(s.shape[0] * u)),
                            (e = Math.floor(s.shape[1] * u)),
                            a.bindFramebuffer(a.FRAMEBUFFER, null),
                            a.viewport(0, 0, (t * r) / u, (e * r) / u),
                            X.bind(),
                            (X.uniforms.buffer = G[H].color[0].bind()),
                            se(a));
                    }
                };
            },
            { "./app": 3, "./flow-generator": 4, "./pattern-generator": 5, "a-big-triangle": 6, "gl-fbo": 25, "gl-shader": 29, "gl-texture2d": 36, glslify: 49, ndarray: 56, "ndarray-fill": 54, "object-assign": 57 },
        ],
        3: [
            function (e, t, r) {
                const a = e("canvas-fit"),
                    s = e("raf-loop");
                t.exports = (r, e) => {
                    if (!r) throw new TypeError("must specify a canvas element");
                    e = e || {};
                    const n = a(r, e.parent, e.scaale),
                        i = s();
                    let o = [0, 0];
                    return (
                        t(),
                        window.addEventListener("resize", t, !1),
                        Object.defineProperties(i, {
                            scale: {
                                get: function () {
                                    return n.scale;
                                },
                                set: function (e) {
                                    n.scale = e;
                                },
                            },
                            shape: {
                                get: function () {
                                    return o;
                                },
                            },
                            parent: {
                                get: function () {
                                    return n.parent;
                                },
                                set: function (e) {
                                    n.parent = e;
                                },
                            },
                        }),
                        (i.dispose = () => {
                            i.stop(), window.removeEventListener("resize", t, !1), i.emit("dispose");
                        }),
                        i
                    );
                    function t() {
                        n();
                        var e = r.width,
                            t = r.height;
                        (o[0] = Math.floor(e / n.scale)), (o[1] = Math.floor(t / n.scale)), i.emit("resize");
                    }
                };
            },
            { "canvas-fit": 13, "raf-loop": 60 },
        ],
        4: [
            function (e, t, r) {
                const n = e("simplex-noise")["SimplexNoise"];
                let E = [],
                    y = [],
                    m = [],
                    v = [],
                    b = [],
                    T;
                t.exports = (e, t) => {
                    if (
                        ((T = t),
                        (E = new Array(T.columns * T.rows)),
                        E.fill(1),
                        (y = new Array(T.columns * T.rows)),
                        y.fill(1),
                        (m = new Array(T.columns * T.rows)),
                        m.fill(0),
                        (v = new Array(T.columns * T.rows)),
                        v.fill(0),
                        (b = new Array(T.columns * T.rows)),
                        b.fill(0),
                        "noise" === T.type)
                    ) {
                        const _ = new n(fxhash);
                        var a = T.noiseSeed + fxrand() * T.noiseSeedRange,
                            s = T.noiseSeed + fxrand() * T.noiseSeedRange,
                            u = T.noiseSeed + fxrand() * T.noiseSeedRange,
                            f = T.noiseSeed + fxrand() * T.noiseSeedRange,
                            l = +fxrand() * T.noiseAmp,
                            h = +fxrand() * T.noiseAmp,
                            c = +fxrand() * T.noiseAmp,
                            p = +fxrand() * T.noiseAmp;
                        for (let o = 0; o < T.rows; o++)
                            for (let i = 0; i < T.columns; i++) {
                                var d = i + o * T.columns,
                                    g = _.noise2D(a + i * l + T.frame, u + o * c);
                                let e = 1;
                                g > T.directionThresholdRL ? (e = 2) : g < -T.directionThresholdRL && (e = 0);
                                let t = 1;
                                (g > T.speedThresholdRL || g < -T.speedThresholdRL) && (t = 2);
                                g = _.noise2D(s + i * h, f + o * p + T.frame);
                                let r = 1;
                                g > T.directionThresholdUD ? (r = 2) : g < -T.directionThresholdUD && (r = 0);
                                let n = 1;
                                (g > T.speedThresholdUD || g < -T.speedThresholdUD) && (n = 2), (E[d] = e), (y[d] = r), (m[d] = t), (v[d] = n), (b[d] = 0), T.resetActive && (b[d] = fxrand() < T.noiseReset ? 1 : 0);
                            }
                    }
                    return { directionsRightLeft: E, directionsUpDown: y, speedRightLeft: m, speedUpDown: v, reset: b };
                };
            },
            { "simplex-noise": 64 },
        ],
        5: [
            function (e, t, r) {
                let n = [
                        [102, 102, 102],
                        [0, 42, 136],
                        [20, 18, 168],
                        [59, 0, 164],
                        [92, 0, 126],
                        [110, 0, 64],
                        [108, 7, 0],
                        [87, 29, 0],
                        [52, 53, 0],
                        [12, 73, 0],
                        [0, 82, 0],
                        [0, 79, 8],
                        [0, 64, 78],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [174, 174, 174],
                        [21, 95, 218],
                        [66, 64, 254],
                        [118, 39, 255],
                        [161, 27, 205],
                        [184, 30, 124],
                        [181, 50, 32],
                        [153, 79, 0],
                        [108, 110, 0],
                        [56, 135, 0],
                        [13, 148, 0],
                        [0, 144, 50],
                        [0, 124, 142],
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0],
                        [254, 254, 254],
                        [100, 176, 254],
                        [147, 144, 254],
                        [199, 119, 254],
                        [243, 106, 254],
                        [254, 110, 205],
                        [254, 130, 112],
                        [235, 159, 35],
                        [189, 191, 0],
                        [137, 217, 0],
                        [93, 229, 48],
                        [69, 225, 130],
                        [72, 206, 223],
                        [79, 79, 79],
                        [0, 0, 0],
                        [0, 0, 0],
                        [254, 254, 254],
                        [193, 224, 254],
                        [212, 211, 254],
                        [233, 200, 254],
                        [251, 195, 254],
                        [254, 197, 235],
                        [254, 205, 198],
                        [247, 217, 166],
                        [229, 230, 149],
                        [208, 240, 151],
                        [190, 245, 171],
                        [180, 243, 205],
                        [181, 236, 243],
                        [184, 184, 184],
                        [0, 0, 0],
                        [0, 0, 0],
                    ],
                    a = [],
                    s = 0,
                    u = { rows: 10, columns: 10, singlePattern: !0, randomPattern: !1, patternType: 0, colorMode: 0, colorIndex: 0, invertColors1: !1, invertColors2: !1 };
                const f = (e, t) => {
                    let r = 0;
                    switch (u.colorMode) {
                        case 0:
                            return u.invertColors1 ? (u.invertColors2 ? [0, 0, 0] : [255, 255, 255]) : u.invertColors2 ? [255, 255, 255] : [0, 0, 0];
                        case 1:
                            return (r = e[0] + e[1] * e[2] + t[0]), n[r % 64];
                        case 2:
                            return (r = Math.min(u.colorIndex, 13) + ((t[0] + e[1]) % 4) * 16), n[r % 64];
                        case 3:
                            return (r = u.colorIndex + e[0]), n[r % 16];
                        case 4:
                            return (r = u.colorIndex + e[0]), n[16 + (r % 16)];
                        case 5:
                            return (r = u.colorIndex + e[0]), n[32 + (r % 16)];
                        case 6:
                            return (r = u.colorIndex + e[0]), n[48 + (r % 16)];
                        case 7:
                            return fxrand() < 0.7 ? [0, 0, 0] : ((r = (t[1] % 16) + 32), n[r % 64]);
                        case 8:
                            return (r = u.colorIndex + Math.floor(e[0] + t[0])), n[r % 16];
                        case 9:
                            return (r = u.colorIndex + Math.floor(e[0] + t[0])), n[16 + (r % 16)];
                        case 10:
                            return (r = u.colorIndex + Math.floor(e[0] + t[0])), n[32 + (r % 16)];
                        case 11:
                            return (r = u.colorIndex + Math.floor(e[0] + t[0])), n[48 + (r % 16)];
                        default:
                            return [0, 0, 0];
                    }
                };
                const i = [
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = e % 2 == 0 && t % 2 == 0 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = e % 2 != 0 && t % 3 != 0 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = (e + t) % 4 == 0 && t % 2 == 0 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = (e + (t % 3)) % 4 == 0 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = (e % 3) % 2 == 0 && t % 3 == 1 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = (e * e) % 4 == 0 && ((t + e) % 3) % 4 == 0 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = t % 2 == e % 3 ? n : i);
                                }
                        },
                        (r) => {
                            let n = u.invertColors1 ? [255, 255, 255] : [0, 0, 0],
                                i = u.invertColors1 ? [0, 0, 0] : [255, 255, 255];
                            for (let t = 0; t < r[3]; t++)
                                for (let e = 0; e < r[2]; e++) {
                                    var o = e + r[0] + (t + r[1]) * s;
                                    u.invertColors2 ? (i = f(r, [e, t])) : (n = f(r, [e, t])), (a[o] = (e + t) % 2 == 0 && (t + (e % 6)) % 4 == 0 ? n : i);
                                }
                        },
                    ],
                    o = (e) => {
                        u.randomPattern ? i[Math.floor(fxrand() * i.length)](e) : i[u.patternType](e);
                    };
                t.exports = (r, e) => {
                    if (((u = e), (a = new Array(r[0] * r[1])), a.fill(1), (s = r[0]), u.singlePattern)) o([0, 0, r[0], r[1]]);
                    else for (let t = 0; t < u.rows; t++) for (let e = 0; e < u.columns; e++) o([Math.floor((r[0] / u.columns) * e), Math.floor((r[1] / u.rows) * t), Math.ceil(r[0] / u.columns), Math.ceil(r[1] / u.rows)]);
                    return { pattern: a };
                };
            },
            {},
        ],
        6: [
            function (e, t, r) {
                "use strict";
                var n = "undefined" == typeof WeakMap ? e("weak-map") : WeakMap,
                    i = e("gl-buffer"),
                    o = e("gl-vao"),
                    a = new n();
                t.exports = function (e) {
                    var t = a.get(e),
                        r = t && (t._triangleBuffer.handle || t._triangleBuffer.buffer);
                    (r && e.isBuffer(r)) || ((r = i(e, new Float32Array([-1, -1, -1, 4, 4, -1]))), ((t = o(e, [{ buffer: r, type: e.FLOAT, size: 2 }]))._triangleBuffer = r), a.set(e, t)),
                        t.bind(),
                        e.drawArrays(e.TRIANGLES, 0, 3),
                        t.unbind();
                };
            },
            { "gl-buffer": 22, "gl-vao": 40, "weak-map": 69 },
        ],
        7: [
            function (e, t, r) {
                var a = e("pad-left");
                t.exports = function (e, n, i) {
                    (n = "number" == typeof n ? n : 1), (i = i || ": ");
                    var e = e.split(/\r?\n/),
                        o = String(e.length + n - 1).length;
                    return e
                        .map(function (e, t) {
                            var r = t + n,
                                t = String(r).length;
                            return a(r, o - t) + i + e;
                        })
                        .join("\n");
                };
            },
            { "pad-left": 8 },
        ],
        8: [
            function (e, t, r) {
                "use strict";
                var n = e("repeat-string");
                t.exports = function (e, t, r) {
                    return n((r = void 0 !== r ? r + "" : " "), t) + e;
                };
            },
            { "repeat-string": 62 },
        ],
        9: [
            function (e, t, r) {
                t.exports = function (e) {
                    return atob(e);
                };
            },
            {},
        ],
        10: [
            function (e, t, r) {
                "use strict";
                (r.byteLength = function (e) {
                    var t = l(e),
                        e = t[0],
                        t = t[1];
                    return (3 * (e + t)) / 4 - t;
                }),
                    (r.toByteArray = function (e) {
                        var t,
                            r,
                            n = l(e),
                            i = n[0],
                            n = n[1],
                            o = new f(
                                (function (e, t) {
                                    return (3 * (e + t)) / 4 - t;
                                })(i, n)
                            ),
                            a = 0,
                            s = 0 < n ? i - 4 : i;
                        for (r = 0; r < s; r += 4)
                            (t = (u[e.charCodeAt(r)] << 18) | (u[e.charCodeAt(r + 1)] << 12) | (u[e.charCodeAt(r + 2)] << 6) | u[e.charCodeAt(r + 3)]), (o[a++] = (t >> 16) & 255), (o[a++] = (t >> 8) & 255), (o[a++] = 255 & t);
                        2 === n && ((t = (u[e.charCodeAt(r)] << 2) | (u[e.charCodeAt(r + 1)] >> 4)), (o[a++] = 255 & t));
                        1 === n && ((t = (u[e.charCodeAt(r)] << 10) | (u[e.charCodeAt(r + 1)] << 4) | (u[e.charCodeAt(r + 2)] >> 2)), (o[a++] = (t >> 8) & 255), (o[a++] = 255 & t));
                        return o;
                    }),
                    (r.fromByteArray = function (e) {
                        for (var t, r = e.length, n = r % 3, i = [], o = 0, a = r - n; o < a; o += 16383)
                            i.push(
                                (function (e, t, r) {
                                    for (var n, i = [], o = t; o < r; o += 3)
                                        (n = ((e[o] << 16) & 16711680) + ((e[o + 1] << 8) & 65280) + (255 & e[o + 2])),
                                            i.push(
                                                (function (e) {
                                                    return s[(e >> 18) & 63] + s[(e >> 12) & 63] + s[(e >> 6) & 63] + s[63 & e];
                                                })(n)
                                            );
                                    return i.join("");
                                })(e, o, a < o + 16383 ? a : o + 16383)
                            );
                        1 == n ? ((t = e[r - 1]), i.push(s[t >> 2] + s[(t << 4) & 63] + "==")) : 2 == n && ((t = (e[r - 2] << 8) + e[r - 1]), i.push(s[t >> 10] + s[(t >> 4) & 63] + s[(t << 2) & 63] + "="));
                        return i.join("");
                    });
                for (var s = [], u = [], f = "undefined" != typeof Uint8Array ? Uint8Array : Array, n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, o = n.length; i < o; ++i)
                    (s[i] = n[i]), (u[n.charCodeAt(i)] = i);
                function l(e) {
                    var t = e.length;
                    if (0 < t % 4) throw new Error("Invalid string. Length must be a multiple of 4");
                    e = e.indexOf("=");
                    return [(e = -1 === e ? t : e), e === t ? 0 : 4 - (e % 4)];
                }
                (u["-".charCodeAt(0)] = 62), (u["_".charCodeAt(0)] = 63);
            },
            {},
        ],
        11: [
            function (e, t, r) {
                "use strict";
                function n(e) {
                    var t = 32;
                    return (e &= -e) && t--, 65535 & e && (t -= 16), 16711935 & e && (t -= 8), 252645135 & e && (t -= 4), 858993459 & e && (t -= 2), 1431655765 & e && --t, t;
                }
                (r.INT_BITS = 32),
                    (r.INT_MAX = 2147483647),
                    (r.INT_MIN = -1 << 31),
                    (r.sign = function (e) {
                        return (0 < e) - (e < 0);
                    }),
                    (r.abs = function (e) {
                        var t = e >> 31;
                        return (e ^ t) - t;
                    }),
                    (r.min = function (e, t) {
                        return t ^ ((e ^ t) & -(e < t));
                    }),
                    (r.max = function (e, t) {
                        return e ^ ((e ^ t) & -(e < t));
                    }),
                    (r.isPow2 = function (e) {
                        return !(e & (e - 1) || !e);
                    }),
                    (r.log2 = function (e) {
                        var t,
                            r = (65535 < e) << 4;
                        return (r |= t = (255 < (e >>>= r)) << 3), (r |= t = (15 < (e >>>= t)) << 2), (r |= t = (3 < (e >>>= t)) << 1) | ((e >>>= t) >> 1);
                    }),
                    (r.log10 = function (e) {
                        return 1e9 <= e ? 9 : 1e8 <= e ? 8 : 1e7 <= e ? 7 : 1e6 <= e ? 6 : 1e5 <= e ? 5 : 1e4 <= e ? 4 : 1e3 <= e ? 3 : 100 <= e ? 2 : 10 <= e ? 1 : 0;
                    }),
                    (r.popCount = function (e) {
                        return (16843009 * (((e = (858993459 & (e -= (e >>> 1) & 1431655765)) + ((e >>> 2) & 858993459)) + (e >>> 4)) & 252645135)) >>> 24;
                    }),
                    (r.countTrailingZeros = n),
                    (r.nextPow2 = function (e) {
                        return (e += 0 === e), --e, (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16) + 1;
                    }),
                    (r.prevPow2 = function (e) {
                        return (e |= e >>> 1), (e |= e >>> 2), (e |= e >>> 4), (e |= e >>> 8), (e |= e >>> 16) - (e >>> 1);
                    }),
                    (r.parity = function (e) {
                        return (e ^= e >>> 16), (e ^= e >>> 8), (e ^= e >>> 4), (27030 >>> (e &= 15)) & 1;
                    });
                var i = new Array(256);
                !(function (e) {
                    for (var t = 0; t < 256; ++t) {
                        var r = t,
                            n = t,
                            i = 7;
                        for (r >>>= 1; r; r >>>= 1) (n <<= 1), (n |= 1 & r), --i;
                        e[t] = (n << i) & 255;
                    }
                })(i),
                    (r.reverse = function (e) {
                        return (i[255 & e] << 24) | (i[(e >>> 8) & 255] << 16) | (i[(e >>> 16) & 255] << 8) | i[(e >>> 24) & 255];
                    }),
                    (r.interleave2 = function (e, t) {
                        return (
                            (e = 1431655765 & ((e = 858993459 & ((e = 252645135 & ((e = 16711935 & ((e &= 65535) | (e << 8))) | (e << 4))) | (e << 2))) | (e << 1))) |
                            ((t = 1431655765 & ((t = 858993459 & ((t = 252645135 & ((t = 16711935 & ((t &= 65535) | (t << 8))) | (t << 4))) | (t << 2))) | (t << 1))) << 1)
                        );
                    }),
                    (r.deinterleave2 = function (e, t) {
                        return ((e = 65535 & ((e = 16711935 & ((e = 252645135 & ((e = 858993459 & ((e = (e >>> t) & 1431655765) | (e >>> 1))) | (e >>> 2))) | (e >>> 4))) | (e >>> 16))) << 16) >> 16;
                    }),
                    (r.interleave3 = function (e, t, r) {
                        return (
                            (e = 1227133513 & ((e = 3272356035 & ((e = 251719695 & ((e = 4278190335 & ((e &= 1023) | (e << 16))) | (e << 8))) | (e << 4))) | (e << 2))),
                            (e |= (t = 1227133513 & ((t = 3272356035 & ((t = 251719695 & ((t = 4278190335 & ((t &= 1023) | (t << 16))) | (t << 8))) | (t << 4))) | (t << 2))) << 1) |
                                ((r = 1227133513 & ((r = 3272356035 & ((r = 251719695 & ((r = 4278190335 & ((r &= 1023) | (r << 16))) | (r << 8))) | (r << 4))) | (r << 2))) << 2)
                        );
                    }),
                    (r.deinterleave3 = function (e, t) {
                        return ((e = 1023 & ((e = 4278190335 & ((e = 251719695 & ((e = 3272356035 & ((e = (e >>> t) & 1227133513) | (e >>> 2))) | (e >>> 4))) | (e >>> 8))) | (e >>> 16))) << 22) >> 22;
                    }),
                    (r.nextCombination = function (e) {
                        var t = e | (e - 1);
                        return (1 + t) | (((~t & -~t) - 1) >>> (n(e) + 1));
                    });
            },
            {},
        ],
        12: [
            function (U, e, L) {
                !function (e) {
                    !function () {
                        "use strict";
                        var s = U("base64-js"),
                            o = U("ieee754");
                        (L.Buffer = h),
                            (L.SlowBuffer = function (e) {
                                +e != e && (e = 0);
                                return h.alloc(+e);
                            }),
                            (L.INSPECT_MAX_BYTES = 50);
                        var t = 2147483647;
                        function i(e) {
                            if (t < e) throw new RangeError('The value "' + e + '" is invalid for option "size"');
                            e = new Uint8Array(e);
                            return (e.__proto__ = h.prototype), e;
                        }
                        function h(e, t, r) {
                            if ("number" != typeof e) return n(e, t, r);
                            if ("string" == typeof t) throw new TypeError('The "string" argument must be of type string. Received type number');
                            return u(e);
                        }
                        function n(e, t, r) {
                            if ("string" == typeof e)
                                return (function (e, t) {
                                    ("string" == typeof t && "" !== t) || (t = "utf8");
                                    if (!h.isEncoding(t)) throw new TypeError("Unknown encoding: " + t);
                                    var r = 0 | c(e, t),
                                        n = i(r),
                                        t = n.write(e, t);
                                    t !== r && (n = n.slice(0, t));
                                    return n;
                                })(e, t);
                            if (ArrayBuffer.isView(e)) return f(e);
                            if (null == e) throw TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e);
                            if (S(e, ArrayBuffer) || (e && S(e.buffer, ArrayBuffer)))
                                return (function (e, t, r) {
                                    if (t < 0 || e.byteLength < t) throw new RangeError('"offset" is outside of buffer bounds');
                                    if (e.byteLength < t + (r || 0)) throw new RangeError('"length" is outside of buffer bounds');
                                    r = void 0 === t && void 0 === r ? new Uint8Array(e) : void 0 === r ? new Uint8Array(e, t) : new Uint8Array(e, t, r);
                                    return (r.__proto__ = h.prototype), r;
                                })(e, t, r);
                            if ("number" == typeof e) throw new TypeError('The "value" argument must not be of type number. Received type number');
                            var n = e.valueOf && e.valueOf();
                            if (null != n && n !== e) return h.from(n, t, r);
                            n = (function (e) {
                                if (h.isBuffer(e)) {
                                    var t = 0 | l(e.length),
                                        r = i(t);
                                    return 0 === r.length ? r : (e.copy(r, 0, 0, t), r);
                                }
                                if (void 0 !== e.length) return "number" != typeof e.length || M(e.length) ? i(0) : f(e);
                                if ("Buffer" === e.type && Array.isArray(e.data)) return f(e.data);
                            })(e);
                            if (n) return n;
                            if ("undefined" != typeof Symbol && null != Symbol.toPrimitive && "function" == typeof e[Symbol.toPrimitive]) return h.from(e[Symbol.toPrimitive]("string"), t, r);
                            throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e);
                        }
                        function a(e) {
                            if ("number" != typeof e) throw new TypeError('"size" argument must be of type number');
                            if (e < 0) throw new RangeError('The value "' + e + '" is invalid for option "size"');
                        }
                        function u(e) {
                            return a(e), i(e < 0 ? 0 : 0 | l(e));
                        }
                        function f(e) {
                            for (var t = e.length < 0 ? 0 : 0 | l(e.length), r = i(t), n = 0; n < t; n += 1) r[n] = 255 & e[n];
                            return r;
                        }
                        function l(e) {
                            if (t <= e) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + t.toString(16) + " bytes");
                            return 0 | e;
                        }
                        function c(e, t) {
                            if (h.isBuffer(e)) return e.length;
                            if (ArrayBuffer.isView(e) || S(e, ArrayBuffer)) return e.byteLength;
                            if ("string" != typeof e) throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e);
                            var r = e.length,
                                n = 2 < arguments.length && !0 === arguments[2];
                            if (!n && 0 === r) return 0;
                            for (var i = !1; ; )
                                switch (t) {
                                    case "ascii":
                                    case "latin1":
                                    case "binary":
                                        return r;
                                    case "utf8":
                                    case "utf-8":
                                        return x(e).length;
                                    case "ucs2":
                                    case "ucs-2":
                                    case "utf16le":
                                    case "utf-16le":
                                        return 2 * r;
                                    case "hex":
                                        return r >>> 1;
                                    case "base64":
                                        return I(e).length;
                                    default:
                                        if (i) return n ? -1 : x(e).length;
                                        (t = ("" + t).toLowerCase()), (i = !0);
                                }
                        }
                        function r(e, t, r) {
                            var n,
                                i,
                                o,
                                a = !1;
                            if ((t = void 0 === t || t < 0 ? 0 : t) > this.length) return "";
                            if ((r = void 0 === r || r > this.length ? this.length : r) <= 0) return "";
                            if ((r >>>= 0) <= (t >>>= 0)) return "";
                            for (e = e || "utf8"; ; )
                                switch (e) {
                                    case "hex":
                                        return (function (e, t, r) {
                                            var n = e.length;
                                            (!t || t < 0) && (t = 0);
                                            (!r || r < 0 || n < r) && (r = n);
                                            for (var i = "", o = t; o < r; ++o)
                                                i += (function (e) {
                                                    return e < 16 ? "0" + e.toString(16) : e.toString(16);
                                                })(e[o]);
                                            return i;
                                        })(this, t, r);
                                    case "utf8":
                                    case "utf-8":
                                        return y(this, t, r);
                                    case "ascii":
                                        return (function (e, t, r) {
                                            var n = "";
                                            r = Math.min(e.length, r);
                                            for (var i = t; i < r; ++i) n += String.fromCharCode(127 & e[i]);
                                            return n;
                                        })(this, t, r);
                                    case "latin1":
                                    case "binary":
                                        return (function (e, t, r) {
                                            var n = "";
                                            r = Math.min(e.length, r);
                                            for (var i = t; i < r; ++i) n += String.fromCharCode(e[i]);
                                            return n;
                                        })(this, t, r);
                                    case "base64":
                                        return (n = this), (o = r), 0 === (i = t) && o === n.length ? s.fromByteArray(n) : s.fromByteArray(n.slice(i, o));
                                    case "ucs2":
                                    case "ucs-2":
                                    case "utf16le":
                                    case "utf-16le":
                                        return (function (e, t, r) {
                                            for (var n = e.slice(t, r), i = "", o = 0; o < n.length; o += 2) i += String.fromCharCode(n[o] + 256 * n[o + 1]);
                                            return i;
                                        })(this, t, r);
                                    default:
                                        if (a) throw new TypeError("Unknown encoding: " + e);
                                        (e = (e + "").toLowerCase()), (a = !0);
                                }
                        }
                        function p(e, t, r) {
                            var n = e[t];
                            (e[t] = e[r]), (e[r] = n);
                        }
                        function d(e, t, r, n, i) {
                            if (0 === e.length) return -1;
                            if (
                                ("string" == typeof r ? ((n = r), (r = 0)) : 2147483647 < r ? (r = 2147483647) : r < -2147483648 && (r = -2147483648), (r = (r = M((r = +r)) ? (i ? 0 : e.length - 1) : r) < 0 ? e.length + r : r) >= e.length)
                            ) {
                                if (i) return -1;
                                r = e.length - 1;
                            } else if (r < 0) {
                                if (!i) return -1;
                                r = 0;
                            }
                            if (("string" == typeof t && (t = h.from(t, n)), h.isBuffer(t))) return 0 === t.length ? -1 : g(e, t, r, n, i);
                            if ("number" == typeof t) return (t &= 255), "function" == typeof Uint8Array.prototype.indexOf ? (i ? Uint8Array.prototype.indexOf : Uint8Array.prototype.lastIndexOf).call(e, t, r) : g(e, [t], r, n, i);
                            throw new TypeError("val must be string, number or Buffer");
                        }
                        function g(e, t, r, n, i) {
                            var o = 1,
                                a = e.length,
                                s = t.length;
                            if (void 0 !== n && ("ucs2" === (n = String(n).toLowerCase()) || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
                                if (e.length < 2 || t.length < 2) return -1;
                                (a /= o = 2), (s /= 2), (r /= 2);
                            }
                            function u(e, t) {
                                return 1 === o ? e[t] : e.readUInt16BE(t * o);
                            }
                            if (i)
                                for (var f = -1, l = r; l < a; l++)
                                    if (u(e, l) === u(t, -1 === f ? 0 : l - f)) {
                                        if (l - (f = -1 === f ? l : f) + 1 === s) return f * o;
                                    } else -1 !== f && (l -= l - f), (f = -1);
                            else
                                for (l = r = a < r + s ? a - s : r; 0 <= l; l--) {
                                    for (var h = !0, c = 0; c < s; c++)
                                        if (u(e, l + c) !== u(t, c)) {
                                            h = !1;
                                            break;
                                        }
                                    if (h) return l;
                                }
                            return -1;
                        }
                        function _(e, t, r, n) {
                            return N(
                                (function (e) {
                                    for (var t = [], r = 0; r < e.length; ++r) t.push(255 & e.charCodeAt(r));
                                    return t;
                                })(t),
                                e,
                                r,
                                n
                            );
                        }
                        function E(e, t, r, n) {
                            return N(
                                (function (e, t) {
                                    for (var r, n, i = [], o = 0; o < e.length && !((t -= 2) < 0); ++o) (n = e.charCodeAt(o)), (r = n >> 8), (n = n % 256), i.push(n), i.push(r);
                                    return i;
                                })(t, e.length - r),
                                e,
                                r,
                                n
                            );
                        }
                        function y(e, t, r) {
                            r = Math.min(e.length, r);
                            for (var n = [], i = t; i < r; ) {
                                var o,
                                    a,
                                    s,
                                    u,
                                    f = e[i],
                                    l = null,
                                    h = 239 < f ? 4 : 223 < f ? 3 : 191 < f ? 2 : 1;
                                if (i + h <= r)
                                    switch (h) {
                                        case 1:
                                            f < 128 && (l = f);
                                            break;
                                        case 2:
                                            128 == (192 & (o = e[i + 1])) && 127 < (u = ((31 & f) << 6) | (63 & o)) && (l = u);
                                            break;
                                        case 3:
                                            (o = e[i + 1]), (a = e[i + 2]), 128 == (192 & o) && 128 == (192 & a) && 2047 < (u = ((15 & f) << 12) | ((63 & o) << 6) | (63 & a)) && (u < 55296 || 57343 < u) && (l = u);
                                            break;
                                        case 4:
                                            (o = e[i + 1]),
                                                (a = e[i + 2]),
                                                (s = e[i + 3]),
                                                128 == (192 & o) && 128 == (192 & a) && 128 == (192 & s) && 65535 < (u = ((15 & f) << 18) | ((63 & o) << 12) | ((63 & a) << 6) | (63 & s)) && u < 1114112 && (l = u);
                                    }
                                null === l ? ((l = 65533), (h = 1)) : 65535 < l && ((l -= 65536), n.push(((l >>> 10) & 1023) | 55296), (l = 56320 | (1023 & l))), n.push(l), (i += h);
                            }
                            return (function (e) {
                                var t = e.length;
                                if (t <= m) return String.fromCharCode.apply(String, e);
                                var r = "",
                                    n = 0;
                                for (; n < t; ) r += String.fromCharCode.apply(String, e.slice(n, (n += m)));
                                return r;
                            })(n);
                        }
                        (L.kMaxLength = t),
                            (h.TYPED_ARRAY_SUPPORT = (function () {
                                try {
                                    var e = new Uint8Array(1);
                                    return (
                                        (e.__proto__ = {
                                            __proto__: Uint8Array.prototype,
                                            foo: function () {
                                                return 42;
                                            },
                                        }),
                                        42 === e.foo()
                                    );
                                } catch (e) {
                                    return !1;
                                }
                            })()) ||
                                "undefined" == typeof console ||
                                "function" != typeof console.error ||
                                console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."),
                            Object.defineProperty(h.prototype, "parent", {
                                enumerable: !0,
                                get: function () {
                                    if (h.isBuffer(this)) return this.buffer;
                                },
                            }),
                            Object.defineProperty(h.prototype, "offset", {
                                enumerable: !0,
                                get: function () {
                                    if (h.isBuffer(this)) return this.byteOffset;
                                },
                            }),
                            "undefined" != typeof Symbol && null != Symbol.species && h[Symbol.species] === h && Object.defineProperty(h, Symbol.species, { value: null, configurable: !0, enumerable: !1, writable: !1 }),
                            (h.poolSize = 8192),
                            (h.from = n),
                            (h.prototype.__proto__ = Uint8Array.prototype),
                            (h.__proto__ = Uint8Array),
                            (h.alloc = function (e, t, r) {
                                return (t = t), (r = r), a((e = e)), !(e <= 0) && void 0 !== t ? ("string" == typeof r ? i(e).fill(t, r) : i(e).fill(t)) : i(e);
                            }),
                            (h.allocUnsafe = u),
                            (h.allocUnsafeSlow = u),
                            (h.isBuffer = function (e) {
                                return null != e && !0 === e._isBuffer && e !== h.prototype;
                            }),
                            (h.compare = function (e, t) {
                                if ((S(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), S(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t)))
                                    throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
                                if (e === t) return 0;
                                for (var r = e.length, n = t.length, i = 0, o = Math.min(r, n); i < o; ++i)
                                    if (e[i] !== t[i]) {
                                        (r = e[i]), (n = t[i]);
                                        break;
                                    }
                                return r < n ? -1 : n < r ? 1 : 0;
                            }),
                            (h.isEncoding = function (e) {
                                switch (String(e).toLowerCase()) {
                                    case "hex":
                                    case "utf8":
                                    case "utf-8":
                                    case "ascii":
                                    case "latin1":
                                    case "binary":
                                    case "base64":
                                    case "ucs2":
                                    case "ucs-2":
                                    case "utf16le":
                                    case "utf-16le":
                                        return !0;
                                    default:
                                        return !1;
                                }
                            }),
                            (h.concat = function (e, t) {
                                if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
                                if (0 === e.length) return h.alloc(0);
                                if (void 0 === t) for (i = t = 0; i < e.length; ++i) t += e[i].length;
                                for (var r = h.allocUnsafe(t), n = 0, i = 0; i < e.length; ++i) {
                                    var o = e[i];
                                    if ((S(o, Uint8Array) && (o = h.from(o)), !h.isBuffer(o))) throw new TypeError('"list" argument must be an Array of Buffers');
                                    o.copy(r, n), (n += o.length);
                                }
                                return r;
                            }),
                            (h.byteLength = c),
                            (h.prototype._isBuffer = !0),
                            (h.prototype.swap16 = function () {
                                var e = this.length;
                                if (e % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
                                for (var t = 0; t < e; t += 2) p(this, t, t + 1);
                                return this;
                            }),
                            (h.prototype.swap32 = function () {
                                var e = this.length;
                                if (e % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
                                for (var t = 0; t < e; t += 4) p(this, t, t + 3), p(this, t + 1, t + 2);
                                return this;
                            }),
                            (h.prototype.swap64 = function () {
                                var e = this.length;
                                if (e % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
                                for (var t = 0; t < e; t += 8) p(this, t, t + 7), p(this, t + 1, t + 6), p(this, t + 2, t + 5), p(this, t + 3, t + 4);
                                return this;
                            }),
                            (h.prototype.toLocaleString = h.prototype.toString = function () {
                                var e = this.length;
                                return 0 === e ? "" : 0 === arguments.length ? y(this, 0, e) : r.apply(this, arguments);
                            }),
                            (h.prototype.equals = function (e) {
                                if (!h.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                                return this === e || 0 === h.compare(this, e);
                            }),
                            (h.prototype.inspect = function () {
                                var e = "",
                                    t = L.INSPECT_MAX_BYTES,
                                    e = this.toString("hex", 0, t)
                                        .replace(/(.{2})/g, "$1 ")
                                        .trim();
                                return this.length > t && (e += " ... "), "<Buffer " + e + ">";
                            }),
                            (h.prototype.compare = function (e, t, r, n, i) {
                                if ((S(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e))) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
                                if ((void 0 === r && (r = e ? e.length : 0), void 0 === n && (n = 0), void 0 === i && (i = this.length), (t = void 0 === t ? 0 : t) < 0 || r > e.length || n < 0 || i > this.length))
                                    throw new RangeError("out of range index");
                                if (i <= n && r <= t) return 0;
                                if (i <= n) return -1;
                                if (r <= t) return 1;
                                if (this === e) return 0;
                                for (var o = (i >>>= 0) - (n >>>= 0), a = (r >>>= 0) - (t >>>= 0), s = Math.min(o, a), u = this.slice(n, i), f = e.slice(t, r), l = 0; l < s; ++l)
                                    if (u[l] !== f[l]) {
                                        (o = u[l]), (a = f[l]);
                                        break;
                                    }
                                return o < a ? -1 : a < o ? 1 : 0;
                            }),
                            (h.prototype.includes = function (e, t, r) {
                                return -1 !== this.indexOf(e, t, r);
                            }),
                            (h.prototype.indexOf = function (e, t, r) {
                                return d(this, e, t, r, !0);
                            }),
                            (h.prototype.lastIndexOf = function (e, t, r) {
                                return d(this, e, t, r, !1);
                            }),
                            (h.prototype.write = function (e, t, r, n) {
                                if (void 0 === t) (n = "utf8"), (r = this.length), (t = 0);
                                else if (void 0 === r && "string" == typeof t) (n = t), (r = this.length), (t = 0);
                                else {
                                    if (!isFinite(t)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                                    (t >>>= 0), isFinite(r) ? ((r >>>= 0), void 0 === n && (n = "utf8")) : ((n = r), (r = void 0));
                                }
                                var i = this.length - t;
                                if (((void 0 === r || i < r) && (r = i), (0 < e.length && (r < 0 || t < 0)) || t > this.length)) throw new RangeError("Attempt to write outside buffer bounds");
                                n = n || "utf8";
                                for (var o, a, s, u = !1; ; )
                                    switch (n) {
                                        case "hex":
                                            return (function (e, t, r, n) {
                                                r = Number(r) || 0;
                                                var i = e.length - r;
                                                (!n || i < (n = Number(n))) && (n = i), (i = t.length) / 2 < n && (n = i / 2);
                                                for (var o = 0; o < n; ++o) {
                                                    var a = parseInt(t.substr(2 * o, 2), 16);
                                                    if (M(a)) return o;
                                                    e[r + o] = a;
                                                }
                                                return o;
                                            })(this, e, t, r);
                                        case "utf8":
                                        case "utf-8":
                                            return (a = t), (s = r), N(x(e, (o = this).length - a), o, a, s);
                                        case "ascii":
                                            return _(this, e, t, r);
                                        case "latin1":
                                        case "binary":
                                            return _(this, e, t, r);
                                        case "base64":
                                            return (o = this), (a = t), (s = r), N(I(e), o, a, s);
                                        case "ucs2":
                                        case "ucs-2":
                                        case "utf16le":
                                        case "utf-16le":
                                            return E(this, e, t, r);
                                        default:
                                            if (u) throw new TypeError("Unknown encoding: " + n);
                                            (n = ("" + n).toLowerCase()), (u = !0);
                                    }
                            }),
                            (h.prototype.toJSON = function () {
                                return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
                            });
                        var m = 4096;
                        function v(e, t, r) {
                            if (e % 1 != 0 || e < 0) throw new RangeError("offset is not uint");
                            if (r < e + t) throw new RangeError("Trying to access beyond buffer length");
                        }
                        function b(e, t, r, n, i, o) {
                            if (!h.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
                            if (i < t || t < o) throw new RangeError('"value" argument is out of bounds');
                            if (r + n > e.length) throw new RangeError("Index out of range");
                        }
                        function T(e, t, r, n) {
                            if (r + n > e.length) throw new RangeError("Index out of range");
                            if (r < 0) throw new RangeError("Index out of range");
                        }
                        function A(e, t, r, n, i) {
                            return (t = +t), (r >>>= 0), i || T(e, 0, r, 4), o.write(e, t, r, n, 23, 4), r + 4;
                        }
                        function w(e, t, r, n, i) {
                            return (t = +t), (r >>>= 0), i || T(e, 0, r, 8), o.write(e, t, r, n, 52, 8), r + 8;
                        }
                        (h.prototype.slice = function (e, t) {
                            var r = this.length;
                            (e = ~~e) < 0 ? (e += r) < 0 && (e = 0) : r < e && (e = r), (t = void 0 === t ? r : ~~t) < 0 ? (t += r) < 0 && (t = 0) : r < t && (t = r), t < e && (t = e);
                            t = this.subarray(e, t);
                            return (t.__proto__ = h.prototype), t;
                        }),
                            (h.prototype.readUIntLE = function (e, t, r) {
                                (e >>>= 0), (t >>>= 0), r || v(e, t, this.length);
                                for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256); ) n += this[e + o] * i;
                                return n;
                            }),
                            (h.prototype.readUIntBE = function (e, t, r) {
                                (e >>>= 0), (t >>>= 0), r || v(e, t, this.length);
                                for (var n = this[e + --t], i = 1; 0 < t && (i *= 256); ) n += this[e + --t] * i;
                                return n;
                            }),
                            (h.prototype.readUInt8 = function (e, t) {
                                return (e >>>= 0), t || v(e, 1, this.length), this[e];
                            }),
                            (h.prototype.readUInt16LE = function (e, t) {
                                return (e >>>= 0), t || v(e, 2, this.length), this[e] | (this[e + 1] << 8);
                            }),
                            (h.prototype.readUInt16BE = function (e, t) {
                                return (e >>>= 0), t || v(e, 2, this.length), (this[e] << 8) | this[e + 1];
                            }),
                            (h.prototype.readUInt32LE = function (e, t) {
                                return (e >>>= 0), t || v(e, 4, this.length), (this[e] | (this[e + 1] << 8) | (this[e + 2] << 16)) + 16777216 * this[e + 3];
                            }),
                            (h.prototype.readUInt32BE = function (e, t) {
                                return (e >>>= 0), t || v(e, 4, this.length), 16777216 * this[e] + ((this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3]);
                            }),
                            (h.prototype.readIntLE = function (e, t, r) {
                                (e >>>= 0), (t >>>= 0), r || v(e, t, this.length);
                                for (var n = this[e], i = 1, o = 0; ++o < t && (i *= 256); ) n += this[e + o] * i;
                                return (i *= 128) <= n && (n -= Math.pow(2, 8 * t)), n;
                            }),
                            (h.prototype.readIntBE = function (e, t, r) {
                                (e >>>= 0), (t >>>= 0), r || v(e, t, this.length);
                                for (var n = t, i = 1, o = this[e + --n]; 0 < n && (i *= 256); ) o += this[e + --n] * i;
                                return (i *= 128) <= o && (o -= Math.pow(2, 8 * t)), o;
                            }),
                            (h.prototype.readInt8 = function (e, t) {
                                return (e >>>= 0), t || v(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e];
                            }),
                            (h.prototype.readInt16LE = function (e, t) {
                                (e >>>= 0), t || v(e, 2, this.length);
                                e = this[e] | (this[e + 1] << 8);
                                return 32768 & e ? 4294901760 | e : e;
                            }),
                            (h.prototype.readInt16BE = function (e, t) {
                                (e >>>= 0), t || v(e, 2, this.length);
                                e = this[e + 1] | (this[e] << 8);
                                return 32768 & e ? 4294901760 | e : e;
                            }),
                            (h.prototype.readInt32LE = function (e, t) {
                                return (e >>>= 0), t || v(e, 4, this.length), this[e] | (this[e + 1] << 8) | (this[e + 2] << 16) | (this[e + 3] << 24);
                            }),
                            (h.prototype.readInt32BE = function (e, t) {
                                return (e >>>= 0), t || v(e, 4, this.length), (this[e] << 24) | (this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3];
                            }),
                            (h.prototype.readFloatLE = function (e, t) {
                                return (e >>>= 0), t || v(e, 4, this.length), o.read(this, e, !0, 23, 4);
                            }),
                            (h.prototype.readFloatBE = function (e, t) {
                                return (e >>>= 0), t || v(e, 4, this.length), o.read(this, e, !1, 23, 4);
                            }),
                            (h.prototype.readDoubleLE = function (e, t) {
                                return (e >>>= 0), t || v(e, 8, this.length), o.read(this, e, !0, 52, 8);
                            }),
                            (h.prototype.readDoubleBE = function (e, t) {
                                return (e >>>= 0), t || v(e, 8, this.length), o.read(this, e, !1, 52, 8);
                            }),
                            (h.prototype.writeUIntLE = function (e, t, r, n) {
                                (e = +e), (t >>>= 0), (r >>>= 0), n || b(this, e, t, r, Math.pow(2, 8 * r) - 1, 0);
                                var i = 1,
                                    o = 0;
                                for (this[t] = 255 & e; ++o < r && (i *= 256); ) this[t + o] = (e / i) & 255;
                                return t + r;
                            }),
                            (h.prototype.writeUIntBE = function (e, t, r, n) {
                                (e = +e), (t >>>= 0), (r >>>= 0), n || b(this, e, t, r, Math.pow(2, 8 * r) - 1, 0);
                                var i = r - 1,
                                    o = 1;
                                for (this[t + i] = 255 & e; 0 <= --i && (o *= 256); ) this[t + i] = (e / o) & 255;
                                return t + r;
                            }),
                            (h.prototype.writeUInt8 = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 1, 255, 0), (this[t] = 255 & e), t + 1;
                            }),
                            (h.prototype.writeUInt16LE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 2, 65535, 0), (this[t] = 255 & e), (this[t + 1] = e >>> 8), t + 2;
                            }),
                            (h.prototype.writeUInt16BE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 2, 65535, 0), (this[t] = e >>> 8), (this[t + 1] = 255 & e), t + 2;
                            }),
                            (h.prototype.writeUInt32LE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 4, 4294967295, 0), (this[t + 3] = e >>> 24), (this[t + 2] = e >>> 16), (this[t + 1] = e >>> 8), (this[t] = 255 & e), t + 4;
                            }),
                            (h.prototype.writeUInt32BE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 4, 4294967295, 0), (this[t] = e >>> 24), (this[t + 1] = e >>> 16), (this[t + 2] = e >>> 8), (this[t + 3] = 255 & e), t + 4;
                            }),
                            (h.prototype.writeIntLE = function (e, t, r, n) {
                                (e = +e), (t >>>= 0), n || b(this, e, t, r, (n = Math.pow(2, 8 * r - 1)) - 1, -n);
                                var i = 0,
                                    o = 1,
                                    a = 0;
                                for (this[t] = 255 & e; ++i < r && (o *= 256); ) e < 0 && 0 === a && 0 !== this[t + i - 1] && (a = 1), (this[t + i] = (((e / o) >> 0) - a) & 255);
                                return t + r;
                            }),
                            (h.prototype.writeIntBE = function (e, t, r, n) {
                                (e = +e), (t >>>= 0), n || b(this, e, t, r, (n = Math.pow(2, 8 * r - 1)) - 1, -n);
                                var i = r - 1,
                                    o = 1,
                                    a = 0;
                                for (this[t + i] = 255 & e; 0 <= --i && (o *= 256); ) e < 0 && 0 === a && 0 !== this[t + i + 1] && (a = 1), (this[t + i] = (((e / o) >> 0) - a) & 255);
                                return t + r;
                            }),
                            (h.prototype.writeInt8 = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 1, 127, -128), (this[t] = 255 & (e = e < 0 ? 255 + e + 1 : e)), t + 1;
                            }),
                            (h.prototype.writeInt16LE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 2, 32767, -32768), (this[t] = 255 & e), (this[t + 1] = e >>> 8), t + 2;
                            }),
                            (h.prototype.writeInt16BE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 2, 32767, -32768), (this[t] = e >>> 8), (this[t + 1] = 255 & e), t + 2;
                            }),
                            (h.prototype.writeInt32LE = function (e, t, r) {
                                return (e = +e), (t >>>= 0), r || b(this, e, t, 4, 2147483647, -2147483648), (this[t] = 255 & e), (this[t + 1] = e >>> 8), (this[t + 2] = e >>> 16), (this[t + 3] = e >>> 24), t + 4;
                            }),
                            (h.prototype.writeInt32BE = function (e, t, r) {
                                return (
                                    (e = +e),
                                    (t >>>= 0),
                                    r || b(this, e, t, 4, 2147483647, -2147483648),
                                    (this[t] = (e = e < 0 ? 4294967295 + e + 1 : e) >>> 24),
                                    (this[t + 1] = e >>> 16),
                                    (this[t + 2] = e >>> 8),
                                    (this[t + 3] = 255 & e),
                                    t + 4
                                );
                            }),
                            (h.prototype.writeFloatLE = function (e, t, r) {
                                return A(this, e, t, !0, r);
                            }),
                            (h.prototype.writeFloatBE = function (e, t, r) {
                                return A(this, e, t, !1, r);
                            }),
                            (h.prototype.writeDoubleLE = function (e, t, r) {
                                return w(this, e, t, !0, r);
                            }),
                            (h.prototype.writeDoubleBE = function (e, t, r) {
                                return w(this, e, t, !1, r);
                            }),
                            (h.prototype.copy = function (e, t, r, n) {
                                if (!h.isBuffer(e)) throw new TypeError("argument should be a Buffer");
                                if (((r = r || 0), n || 0 === n || (n = this.length), t >= e.length && (t = e.length), (n = 0 < n && n < r ? r : n) === r)) return 0;
                                if (0 === e.length || 0 === this.length) return 0;
                                if ((t = t || 0) < 0) throw new RangeError("targetStart out of bounds");
                                if (r < 0 || r >= this.length) throw new RangeError("Index out of range");
                                if (n < 0) throw new RangeError("sourceEnd out of bounds");
                                n > this.length && (n = this.length);
                                var i = (n = e.length - t < n - r ? e.length - t + r : n) - r;
                                if (this === e && "function" == typeof Uint8Array.prototype.copyWithin) this.copyWithin(t, r, n);
                                else if (this === e && r < t && t < n) for (var o = i - 1; 0 <= o; --o) e[o + t] = this[o + r];
                                else Uint8Array.prototype.set.call(e, this.subarray(r, n), t);
                                return i;
                            }),
                            (h.prototype.fill = function (e, t, r, n) {
                                if ("string" == typeof e) {
                                    if (("string" == typeof t ? ((n = t), (t = 0), (r = this.length)) : "string" == typeof r && ((n = r), (r = this.length)), void 0 !== n && "string" != typeof n))
                                        throw new TypeError("encoding must be a string");
                                    if ("string" == typeof n && !h.isEncoding(n)) throw new TypeError("Unknown encoding: " + n);
                                    var i;
                                    1 === e.length && ((i = e.charCodeAt(0)), (("utf8" === n && i < 128) || "latin1" === n) && (e = i));
                                } else "number" == typeof e && (e &= 255);
                                if (t < 0 || this.length < t || this.length < r) throw new RangeError("Out of range index");
                                if (r <= t) return this;
                                var o;
                                if (((t >>>= 0), (r = void 0 === r ? this.length : r >>> 0), "number" == typeof (e = e || 0))) for (o = t; o < r; ++o) this[o] = e;
                                else {
                                    var a = h.isBuffer(e) ? e : h.from(e, n),
                                        s = a.length;
                                    if (0 === s) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
                                    for (o = 0; o < r - t; ++o) this[o + t] = a[o % s];
                                }
                                return this;
                            });
                        var R = /[^+/0-9A-Za-z-_]/g;
                        function x(e, t) {
                            var r;
                            t = t || 1 / 0;
                            for (var n = e.length, i = null, o = [], a = 0; a < n; ++a) {
                                if (55295 < (r = e.charCodeAt(a)) && r < 57344) {
                                    if (!i) {
                                        if (56319 < r) {
                                            -1 < (t -= 3) && o.push(239, 191, 189);
                                            continue;
                                        }
                                        if (a + 1 === n) {
                                            -1 < (t -= 3) && o.push(239, 191, 189);
                                            continue;
                                        }
                                        i = r;
                                        continue;
                                    }
                                    if (r < 56320) {
                                        -1 < (t -= 3) && o.push(239, 191, 189), (i = r);
                                        continue;
                                    }
                                    r = 65536 + (((i - 55296) << 10) | (r - 56320));
                                } else i && -1 < (t -= 3) && o.push(239, 191, 189);
                                if (((i = null), r < 128)) {
                                    if (--t < 0) break;
                                    o.push(r);
                                } else if (r < 2048) {
                                    if ((t -= 2) < 0) break;
                                    o.push((r >> 6) | 192, (63 & r) | 128);
                                } else if (r < 65536) {
                                    if ((t -= 3) < 0) break;
                                    o.push((r >> 12) | 224, ((r >> 6) & 63) | 128, (63 & r) | 128);
                                } else {
                                    if (!(r < 1114112)) throw new Error("Invalid code point");
                                    if ((t -= 4) < 0) break;
                                    o.push((r >> 18) | 240, ((r >> 12) & 63) | 128, ((r >> 6) & 63) | 128, (63 & r) | 128);
                                }
                            }
                            return o;
                        }
                        function I(e) {
                            return s.toByteArray(
                                (function (e) {
                                    if ((e = (e = e.split("=")[0]).trim().replace(R, "")).length < 2) return "";
                                    for (; e.length % 4 != 0; ) e += "=";
                                    return e;
                                })(e)
                            );
                        }
                        function N(e, t, r, n) {
                            for (var i = 0; i < n && !(i + r >= t.length || i >= e.length); ++i) t[i + r] = e[i];
                            return i;
                        }
                        function S(e, t) {
                            return e instanceof t || (null != e && null != e.constructor && null != e.constructor.name && e.constructor.name === t.name);
                        }
                        function M(e) {
                            return e != e;
                        }
                    }.call(this);
                }.call(this, U("buffer").Buffer);
            },
            { "base64-js": 10, buffer: 12, ieee754: 50 },
        ],
        13: [
            function (e, t, r) {
                var s = e("element-size");
                t.exports = function (i, e, t) {
                    var o = "SVG" === i.nodeName.toUpperCase();
                    return (i.style.position = i.style.position || "absolute"), (i.style.top = 0), (i.style.left = 0), (a.scale = parseFloat(t || 1)), (a.parent = e), a();
                    function a() {
                        var e,
                            t,
                            r,
                            n = a.parent || i.parentNode;
                        return (
                            (r = "function" == typeof n ? ((t = (e = n(u) || u)[0]), e[1]) : n && n !== document.body ? ((t = 0 | (r = s(n))[0]), 0 | r[1]) : ((t = window.innerWidth), window.innerHeight)),
                            o ? (i.setAttribute("width", t * a.scale + "px"), i.setAttribute("height", r * a.scale + "px")) : ((i.width = t * a.scale), (i.height = r * a.scale)),
                            (i.style.width = t + "px"),
                            (i.style.height = r + "px"),
                            a
                        );
                    }
                };
                var u = new Float32Array(2);
            },
            { "element-size": 19 },
        ],
        14: [
            function (e, t, r) {
                "use strict";
                var o = e("./lib/thunk.js");
                function a() {
                    (this.argTypes = []),
                        (this.shimArgs = []),
                        (this.arrayArgs = []),
                        (this.arrayBlockIndices = []),
                        (this.scalarArgs = []),
                        (this.offsetArgs = []),
                        (this.offsetArgIndex = []),
                        (this.indexArgs = []),
                        (this.shapeArgs = []),
                        (this.funcName = ""),
                        (this.pre = null),
                        (this.body = null),
                        (this.post = null),
                        (this.debug = !1);
                }
                t.exports = function (e) {
                    var t = new a();
                    (t.pre = e.pre), (t.body = e.body), (t.post = e.post);
                    var r = e.args.slice(0);
                    t.argTypes = r;
                    for (var n = 0; n < r.length; ++n) {
                        var i = r[n];
                        if ("array" === i || ("object" == typeof i && i.blockIndices)) {
                            if (((t.argTypes[n] = "array"), t.arrayArgs.push(n), t.arrayBlockIndices.push(i.blockIndices || 0), t.shimArgs.push("array" + n), n < t.pre.args.length && 0 < t.pre.args[n].count))
                                throw new Error("cwise: pre() block may not reference array args");
                            if (n < t.post.args.length && 0 < t.post.args[n].count) throw new Error("cwise: post() block may not reference array args");
                        } else if ("scalar" === i) t.scalarArgs.push(n), t.shimArgs.push("scalar" + n);
                        else if ("index" === i) {
                            if ((t.indexArgs.push(n), n < t.pre.args.length && 0 < t.pre.args[n].count)) throw new Error("cwise: pre() block may not reference array index");
                            if (n < t.body.args.length && t.body.args[n].lvalue) throw new Error("cwise: body() block may not write to array index");
                            if (n < t.post.args.length && 0 < t.post.args[n].count) throw new Error("cwise: post() block may not reference array index");
                        } else if ("shape" === i) {
                            if ((t.shapeArgs.push(n), n < t.pre.args.length && t.pre.args[n].lvalue)) throw new Error("cwise: pre() block may not write to array shape");
                            if (n < t.body.args.length && t.body.args[n].lvalue) throw new Error("cwise: body() block may not write to array shape");
                            if (n < t.post.args.length && t.post.args[n].lvalue) throw new Error("cwise: post() block may not write to array shape");
                        } else {
                            if ("object" != typeof i || !i.offset) throw new Error("cwise: Unknown argument type " + r[n]);
                            (t.argTypes[n] = "offset"), t.offsetArgs.push({ array: i.array, offset: i.offset }), t.offsetArgIndex.push(n);
                        }
                    }
                    if (t.arrayArgs.length <= 0) throw new Error("cwise: No array arguments specified");
                    if (t.pre.args.length > r.length) throw new Error("cwise: Too many arguments in pre() block");
                    if (t.body.args.length > r.length) throw new Error("cwise: Too many arguments in body() block");
                    if (t.post.args.length > r.length) throw new Error("cwise: Too many arguments in post() block");
                    return (t.debug = !!e.printCode || !!e.debug), (t.funcName = e.funcName || "cwise"), (t.blockSize = e.blockSize || 64), o(t);
                };
            },
            { "./lib/thunk.js": 16 },
        ],
        15: [
            function (e, t, r) {
                "use strict";
                var b = e("uniq");
                function T(e, t, r) {
                    for (var n, i = e.length, o = t.arrayArgs.length, a = 0 < t.indexArgs.length, s = [], u = [], f = 0, l = 0, h = 0; h < i; ++h) u.push(["i", h, "=0"].join(""));
                    for (n = 0; n < o; ++n) for (h = 0; h < i; ++h) (l = f), (f = e[h]), 0 === h ? u.push(["d", n, "s", h, "=t", n, "p", f].join("")) : u.push(["d", n, "s", h, "=(t", n, "p", f, "-s", l, "*t", n, "p", l, ")"].join(""));
                    for (0 < u.length && s.push("var " + u.join(",")), h = i - 1; 0 <= h; --h) (f = e[h]), s.push(["for(i", h, "=0;i", h, "<s", f, ";++i", h, "){"].join(""));
                    for (s.push(r), h = 0; h < i; ++h) {
                        for (l = f, f = e[h], n = 0; n < o; ++n) s.push(["p", n, "+=d", n, "s", h].join(""));
                        a && (0 < h && s.push(["index[", l, "]-=s", l].join("")), s.push(["++index[", f, "]"].join(""))), s.push("}");
                    }
                    return s.join("\n");
                }
                function A(e, t, r) {
                    for (var n = e.body, i = [], o = [], a = 0; a < e.args.length; ++a) {
                        var s = e.args[a];
                        if (!(s.count <= 0)) {
                            var u = new RegExp(s.name, "g"),
                                f = "",
                                l = t.arrayArgs.indexOf(a);
                            switch (t.argTypes[a]) {
                                case "offset":
                                    var h = t.offsetArgIndex.indexOf(a),
                                        l = t.offsetArgs[h].array,
                                        f = "+q" + h;
                                case "array":
                                    f = "p" + l + f;
                                    var c = "l" + a,
                                        h = "a" + l;
                                    if (0 === t.arrayBlockIndices[l])
                                        1 === s.count
                                            ? "generic" === r[l]
                                                ? s.lvalue
                                                    ? (i.push(["var ", c, "=", h, ".get(", f, ")"].join("")), (n = n.replace(u, c)), o.push([h, ".set(", f, ",", c, ")"].join("")))
                                                    : (n = n.replace(u, [h, ".get(", f, ")"].join("")))
                                                : (n = n.replace(u, [h, "[", f, "]"].join("")))
                                            : "generic" === r[l]
                                            ? (i.push(["var ", c, "=", h, ".get(", f, ")"].join("")), (n = n.replace(u, c)), s.lvalue && o.push([h, ".set(", f, ",", c, ")"].join("")))
                                            : (i.push(["var ", c, "=", h, "[", f, "]"].join("")), (n = n.replace(u, c)), s.lvalue && o.push([h, "[", f, "]=", c].join("")));
                                    else {
                                        for (var p = [s.name], d = [f], g = 0; g < Math.abs(t.arrayBlockIndices[l]); g++) p.push("\\s*\\[([^\\]]+)\\]"), d.push("$" + (g + 1) + "*t" + l + "b" + g);
                                        if (((u = new RegExp(p.join(""), "g")), (f = d.join("+")), "generic" === r[l])) throw new Error("cwise: Generic arrays not supported in combination with blocks!");
                                        n = n.replace(u, [h, "[", f, "]"].join(""));
                                    }
                                    break;
                                case "scalar":
                                    n = n.replace(u, "Y" + t.scalarArgs.indexOf(a));
                                    break;
                                case "index":
                                    n = n.replace(u, "index");
                                    break;
                                case "shape":
                                    n = n.replace(u, "shape");
                            }
                        }
                    }
                    return [i.join("\n"), n, o.join("\n")].join("\n").trim();
                }
                t.exports = function (e, t) {
                    for (var r = (t[1].length - Math.abs(e.arrayBlockIndices[0])) | 0, n = new Array(e.arrayArgs.length), i = new Array(e.arrayArgs.length), o = 0; o < e.arrayArgs.length; ++o) (i[o] = t[2 * o]), (n[o] = t[2 * o + 1]);
                    for (var a = [], s = [], u = [], f = [], l = [], o = 0; o < e.arrayArgs.length; ++o) {
                        e.arrayBlockIndices[o] < 0 ? (u.push(0), f.push(r), a.push(r), s.push(r + e.arrayBlockIndices[o])) : (u.push(e.arrayBlockIndices[o]), f.push(e.arrayBlockIndices[o] + r), a.push(0), s.push(e.arrayBlockIndices[o]));
                        for (var h = [], c = 0; c < n[o].length; c++) u[o] <= n[o][c] && n[o][c] < f[o] && h.push(n[o][c] - u[o]);
                        l.push(h);
                    }
                    for (var p = ["SS"], d = ["'use strict'"], g = [], c = 0; c < r; ++c) g.push(["s", c, "=SS[", c, "]"].join(""));
                    for (o = 0; o < e.arrayArgs.length; ++o) {
                        p.push("a" + o), p.push("t" + o), p.push("p" + o);
                        for (c = 0; c < r; ++c) g.push(["t", o, "p", c, "=t", o, "[", u[o] + c, "]"].join(""));
                        for (c = 0; c < Math.abs(e.arrayBlockIndices[o]); ++c) g.push(["t", o, "b", c, "=t", o, "[", a[o] + c, "]"].join(""));
                    }
                    for (o = 0; o < e.scalarArgs.length; ++o) p.push("Y" + o);
                    if ((0 < e.shapeArgs.length && g.push("shape=SS.slice(0)"), 0 < e.indexArgs.length)) {
                        for (var _ = new Array(r), o = 0; o < r; ++o) _[o] = "0";
                        g.push(["index=[", _.join(","), "]"].join(""));
                    }
                    for (o = 0; o < e.offsetArgs.length; ++o) {
                        for (var E = e.offsetArgs[o], y = [], c = 0; c < E.offset.length; ++c) 0 !== E.offset[c] && (1 === E.offset[c] ? y.push(["t", E.array, "p", c].join("")) : y.push([E.offset[c], "*t", E.array, "p", c].join("")));
                        0 === y.length ? g.push("q" + o + "=0") : g.push(["q", o, "=", y.join("+")].join(""));
                    }
                    var m = b([].concat(e.pre.thisVars).concat(e.body.thisVars).concat(e.post.thisVars));
                    for (0 < (g = g.concat(m)).length && d.push("var " + g.join(",")), o = 0; o < e.arrayArgs.length; ++o) d.push("p" + o + "|=0");
                    3 < e.pre.body.length && d.push(A(e.pre, e, i));
                    var v = A(e.body, e, i);
                    return (
                        (m = (function (e) {
                            for (var t = 0, r = e[0].length; t < r; ) {
                                for (var n = 1; n < e.length; ++n) if (e[n][t] !== e[0][t]) return t;
                                ++t;
                            }
                            return t;
                        })(l)) < r
                            ? d.push(
                                  (function (e, t, r, n) {
                                      for (var i = t.length, o = r.arrayArgs.length, a = r.blockSize, s = 0 < r.indexArgs.length, u = [], f = 0; f < o; ++f) u.push(["var offset", f, "=p", f].join(""));
                                      for (f = e; f < i; ++f)
                                          u.push(["for(var j" + f + "=SS[", t[f], "]|0;j", f, ">0;){"].join("")),
                                              u.push(["if(j", f, "<", a, "){"].join("")),
                                              u.push(["s", t[f], "=j", f].join("")),
                                              u.push(["j", f, "=0"].join("")),
                                              u.push(["}else{s", t[f], "=", a].join("")),
                                              u.push(["j", f, "-=", a, "}"].join("")),
                                              s && u.push(["index[", t[f], "]=j", f].join(""));
                                      for (f = 0; f < o; ++f) {
                                          for (var l = ["offset" + f], h = e; h < i; ++h) l.push(["j", h, "*t", f, "p", t[h]].join(""));
                                          u.push(["p", f, "=(", l.join("+"), ")"].join(""));
                                      }
                                      for (u.push(T(t, r, n)), f = e; f < i; ++f) u.push("}");
                                      return u.join("\n");
                                  })(m, l[0], e, v)
                              )
                            : d.push(T(l[0], e, v)),
                        3 < e.post.body.length && d.push(A(e.post, e, i)),
                        e.debug && console.log("-----Generated cwise routine for ", t, ":\n" + d.join("\n") + "\n----------"),
                        (m = [
                            e.funcName || "unnamed",
                            "_cwise_loop_",
                            n[0].join("s"),
                            "m",
                            m,
                            (function (e) {
                                for (var t = new Array(e.length), r = !0, n = 0; n < e.length; ++n) {
                                    var i = e[n],
                                        o = (o = i.match(/\d+/)) ? o[0] : "";
                                    0 === i.charAt(0) ? (t[n] = "u" + i.charAt(1) + o) : (t[n] = i.charAt(0) + o), 0 < n && (r = r && t[n] === t[n - 1]);
                                }
                                return r ? t[0] : t.join("");
                            })(i),
                        ].join("")),
                        new Function(["function ", m, "(", p.join(","), "){", d.join("\n"), "} return ", m].join(""))()
                    );
                };
            },
            { uniq: 68 },
        ],
        16: [
            function (e, t, r) {
                "use strict";
                var h = e("./compile.js");
                t.exports = function (e) {
                    var t = ["'use strict'", "var CACHED={}"],
                        r = [],
                        n = e.funcName + "_cwise_thunk";
                    t.push(["return function ", n, "(", e.shimArgs.join(","), "){"].join(""));
                    for (
                        var i = [], o = [], a = [["array", e.arrayArgs[0], ".shape.slice(", Math.max(0, e.arrayBlockIndices[0]), e.arrayBlockIndices[0] < 0 ? "," + e.arrayBlockIndices[0] + ")" : ")"].join("")], s = [], u = [], f = 0;
                        f < e.arrayArgs.length;
                        ++f
                    ) {
                        var l = e.arrayArgs[f];
                        r.push(["t", l, "=array", l, ".dtype,", "r", l, "=array", l, ".order"].join("")),
                            i.push("t" + l),
                            i.push("r" + l),
                            o.push("t" + l),
                            o.push("r" + l + ".join()"),
                            a.push("array" + l + ".data"),
                            a.push("array" + l + ".stride"),
                            a.push("array" + l + ".offset|0"),
                            0 < f &&
                                (s.push("array" + e.arrayArgs[0] + ".shape.length===array" + l + ".shape.length+" + (Math.abs(e.arrayBlockIndices[0]) - Math.abs(e.arrayBlockIndices[f]))),
                                u.push("array" + e.arrayArgs[0] + ".shape[shapeIndex+" + Math.max(0, e.arrayBlockIndices[0]) + "]===array" + l + ".shape[shapeIndex+" + Math.max(0, e.arrayBlockIndices[f]) + "]"));
                    }
                    for (
                        1 < e.arrayArgs.length &&
                            (t.push("if (!(" + s.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same dimensionality!')"),
                            t.push("for(var shapeIndex=array" + e.arrayArgs[0] + ".shape.length-" + Math.abs(e.arrayBlockIndices[0]) + "; shapeIndex--\x3e0;) {"),
                            t.push("if (!(" + u.join(" && ") + ")) throw new Error('cwise: Arrays do not all have the same shape!')"),
                            t.push("}")),
                            f = 0;
                        f < e.scalarArgs.length;
                        ++f
                    )
                        a.push("scalar" + e.scalarArgs[f]);
                    return (
                        r.push(["type=[", o.join(","), "].join()"].join("")),
                        r.push("proc=CACHED[type]"),
                        t.push("var " + r.join(",")),
                        t.push(["if(!proc){", "CACHED[type]=proc=compile([", i.join(","), "])}", "return proc(", a.join(","), ")}"].join("")),
                        e.debug && console.log("-----Generated thunk:\n" + t.join("\n") + "\n----------"),
                        new Function("compile", t.join("\n"))(h.bind(void 0, e))
                    );
                };
            },
            { "./compile.js": 15 },
        ],
        17: [
            function (e, t, r) {
                t.exports = e("cwise-compiler");
            },
            { "cwise-compiler": 14 },
        ],
        18: [
            function (e, t, r) {
                "use strict";
                t.exports = function (e, t) {
                    switch ((void 0 === t && (t = 0), typeof e)) {
                        case "number":
                            if (0 < e)
                                return (function (e, t) {
                                    for (var r = new Array(e), n = 0; n < e; ++n) r[n] = t;
                                    return r;
                                })(0 | e, t);
                            break;
                        case "object":
                            if ("number" == typeof e.length)
                                return (function e(t, r, n) {
                                    var i = 0 | t[n];
                                    if (i <= 0) return [];
                                    var o,
                                        a = new Array(i);
                                    if (n === t.length - 1) for (o = 0; o < i; ++o) a[o] = r;
                                    else for (o = 0; o < i; ++o) a[o] = e(t, r, n + 1);
                                    return a;
                                })(e, t, 0);
                    }
                    return [];
                };
            },
            {},
        ],
        19: [
            function (e, t, r) {
                function o(e) {
                    return parseFloat(e) || 0;
                }
                t.exports = function (e) {
                    if (e === window || e === document.body) return [window.innerWidth, window.innerHeight];
                    {
                        var t;
                        e.parentNode || ((t = !0), document.body.appendChild(e));
                    }
                    var r = e.getBoundingClientRect(),
                        n = getComputedStyle(e),
                        i = (0 | r.height) + o(n.getPropertyValue("margin-top")) + o(n.getPropertyValue("margin-bottom")),
                        n = (0 | r.width) + o(n.getPropertyValue("margin-left")) + o(n.getPropertyValue("margin-right"));
                    t && document.body.removeChild(e);
                    return [n, i];
                };
            },
            {},
        ],
        20: [
            function (e, t, r) {
                "use strict";
                var n = "object" == typeof Reflect ? Reflect : null,
                    u =
                        n && "function" == typeof n.apply
                            ? n.apply
                            : function (e, t, r) {
                                  return Function.prototype.apply.call(e, t, r);
                              };
                var i =
                        n && "function" == typeof n.ownKeys
                            ? n.ownKeys
                            : Object.getOwnPropertySymbols
                            ? function (e) {
                                  return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
                              }
                            : function (e) {
                                  return Object.getOwnPropertyNames(e);
                              },
                    o =
                        Number.isNaN ||
                        function (e) {
                            return e != e;
                        };
                function a() {
                    a.init.call(this);
                }
                (t.exports = a),
                    (t.exports.once = function (s, u) {
                        return new Promise(function (e, t) {
                            function r(e) {
                                s.removeListener(u, n), t(e);
                            }
                            function n() {
                                "function" == typeof s.removeListener && s.removeListener("error", r), e([].slice.call(arguments));
                            }
                            var i, o, a;
                            _(s, u, n, { once: !0 }), "error" !== u && ((o = r), (a = { once: !0 }), "function" == typeof (i = s).on && _(i, "error", o, a));
                        });
                    }),
                    ((a.EventEmitter = a).prototype._events = void 0),
                    (a.prototype._eventsCount = 0),
                    (a.prototype._maxListeners = void 0);
                var s = 10;
                function f(e) {
                    if ("function" != typeof e) throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e);
                }
                function l(e) {
                    return void 0 === e._maxListeners ? a.defaultMaxListeners : e._maxListeners;
                }
                function h(e, t, r, n) {
                    var i, o;
                    return (
                        f(r),
                        void 0 === (i = e._events) ? ((i = e._events = Object.create(null)), (e._eventsCount = 0)) : (void 0 !== i.newListener && (e.emit("newListener", t, r.listener || r), (i = e._events)), (o = i[t])),
                        void 0 === o
                            ? ((o = i[t] = r), ++e._eventsCount)
                            : ("function" == typeof o ? (o = i[t] = n ? [r, o] : [o, r]) : n ? o.unshift(r) : o.push(r),
                              0 < (r = l(e)) &&
                                  o.length > r &&
                                  !o.warned &&
                                  ((o.warned = !0),
                                  ((r = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(t) + " listeners added. Use emitter.setMaxListeners() to increase limit")).name = "MaxListenersExceededWarning"),
                                  (r.emitter = e),
                                  (r.type = t),
                                  (r.count = o.length),
                                  (r = r),
                                  console && console.warn && console.warn(r))),
                        e
                    );
                }
                function c(e, t, r) {
                    (e = { fired: !1, wrapFn: void 0, target: e, type: t, listener: r }),
                        (t = function () {
                            if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), (this.fired = !0), 0 === arguments.length ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
                        }.bind(e));
                    return (t.listener = r), (e.wrapFn = t);
                }
                function p(e, t, r) {
                    e = e._events;
                    if (void 0 === e) return [];
                    t = e[t];
                    return void 0 === t
                        ? []
                        : "function" == typeof t
                        ? r
                            ? [t.listener || t]
                            : [t]
                        : r
                        ? (function (e) {
                              for (var t = new Array(e.length), r = 0; r < t.length; ++r) t[r] = e[r].listener || e[r];
                              return t;
                          })(t)
                        : g(t, t.length);
                }
                function d(e) {
                    var t = this._events;
                    if (void 0 !== t) {
                        e = t[e];
                        if ("function" == typeof e) return 1;
                        if (void 0 !== e) return e.length;
                    }
                    return 0;
                }
                function g(e, t) {
                    for (var r = new Array(t), n = 0; n < t; ++n) r[n] = e[n];
                    return r;
                }
                function _(r, n, i, o) {
                    if ("function" == typeof r.on) o.once ? r.once(n, i) : r.on(n, i);
                    else {
                        if ("function" != typeof r.addEventListener) throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
                        r.addEventListener(n, function e(t) {
                            o.once && r.removeEventListener(n, e), i(t);
                        });
                    }
                }
                Object.defineProperty(a, "defaultMaxListeners", {
                    enumerable: !0,
                    get: function () {
                        return s;
                    },
                    set: function (e) {
                        if ("number" != typeof e || e < 0 || o(e)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e + ".");
                        s = e;
                    },
                }),
                    (a.init = function () {
                        (void 0 !== this._events && this._events !== Object.getPrototypeOf(this)._events) || ((this._events = Object.create(null)), (this._eventsCount = 0)), (this._maxListeners = this._maxListeners || void 0);
                    }),
                    (a.prototype.setMaxListeners = function (e) {
                        if ("number" != typeof e || e < 0 || o(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
                        return (this._maxListeners = e), this;
                    }),
                    (a.prototype.getMaxListeners = function () {
                        return l(this);
                    }),
                    (a.prototype.emit = function (e) {
                        for (var t = [], r = 1; r < arguments.length; r++) t.push(arguments[r]);
                        var n,
                            i = "error" === e,
                            o = this._events;
                        if (void 0 !== o) i = i && void 0 === o.error;
                        else if (!i) return !1;
                        if (i) {
                            if ((n = 0 < t.length ? t[0] : n) instanceof Error) throw n;
                            i = new Error("Unhandled error." + (n ? " (" + n.message + ")" : ""));
                            throw ((i.context = n), i);
                        }
                        e = o[e];
                        if (void 0 === e) return !1;
                        if ("function" == typeof e) u(e, this, t);
                        else for (var a = e.length, s = g(e, a), r = 0; r < a; ++r) u(s[r], this, t);
                        return !0;
                    }),
                    (a.prototype.on = a.prototype.addListener = function (e, t) {
                        return h(this, e, t, !1);
                    }),
                    (a.prototype.prependListener = function (e, t) {
                        return h(this, e, t, !0);
                    }),
                    (a.prototype.once = function (e, t) {
                        return f(t), this.on(e, c(this, e, t)), this;
                    }),
                    (a.prototype.prependOnceListener = function (e, t) {
                        return f(t), this.prependListener(e, c(this, e, t)), this;
                    }),
                    (a.prototype.removeListener = function (e, t) {
                        var r, n, i, o, a;
                        if ((f(t), void 0 === (n = this._events))) return this;
                        if (void 0 === (r = n[e])) return this;
                        if (r === t || r.listener === t) 0 == --this._eventsCount ? (this._events = Object.create(null)) : (delete n[e], n.removeListener && this.emit("removeListener", e, r.listener || t));
                        else if ("function" != typeof r) {
                            for (i = -1, o = r.length - 1; 0 <= o; o--)
                                if (r[o] === t || r[o].listener === t) {
                                    (a = r[o].listener), (i = o);
                                    break;
                                }
                            if (i < 0) return this;
                            0 === i
                                ? r.shift()
                                : (function (e, t) {
                                      for (; t + 1 < e.length; t++) e[t] = e[t + 1];
                                      e.pop();
                                  })(r, i),
                                1 === r.length && (n[e] = r[0]),
                                void 0 !== n.removeListener && this.emit("removeListener", e, a || t);
                        }
                        return this;
                    }),
                    (a.prototype.off = a.prototype.removeListener),
                    (a.prototype.removeAllListeners = function (e) {
                        var t,
                            r = this._events;
                        if (void 0 === r) return this;
                        if (void 0 === r.removeListener)
                            return 0 === arguments.length ? ((this._events = Object.create(null)), (this._eventsCount = 0)) : void 0 !== r[e] && (0 == --this._eventsCount ? (this._events = Object.create(null)) : delete r[e]), this;
                        if (0 === arguments.length) {
                            for (var n, i = Object.keys(r), o = 0; o < i.length; ++o) "removeListener" !== (n = i[o]) && this.removeAllListeners(n);
                            return this.removeAllListeners("removeListener"), (this._events = Object.create(null)), (this._eventsCount = 0), this;
                        }
                        if ("function" == typeof (t = r[e])) this.removeListener(e, t);
                        else if (void 0 !== t) for (o = t.length - 1; 0 <= o; o--) this.removeListener(e, t[o]);
                        return this;
                    }),
                    (a.prototype.listeners = function (e) {
                        return p(this, e, !0);
                    }),
                    (a.prototype.rawListeners = function (e) {
                        return p(this, e, !1);
                    }),
                    (a.listenerCount = function (e, t) {
                        return "function" == typeof e.listenerCount ? e.listenerCount(t) : d.call(e, t);
                    }),
                    (a.prototype.listenerCount = d),
                    (a.prototype.eventNames = function () {
                        return 0 < this._eventsCount ? i(this._events) : [];
                    });
            },
            {},
        ],
        21: [
            function (e, t, r) {
                t.exports = function (e, t) {
                    if ("string" != typeof e) throw new TypeError("must specify type string");
                    if (((t = t || {}), "undefined" == typeof document && !t.canvas)) return null;
                    var r = t.canvas || document.createElement("canvas");
                    "number" == typeof t.width && (r.width = t.width);
                    "number" == typeof t.height && (r.height = t.height);
                    var n,
                        i = t;
                    try {
                        var o = [e];
                        0 === e.indexOf("webgl") && o.push("experimental-" + e);
                        for (var a = 0; a < o.length; a++) if ((n = r.getContext(o[a], i))) return n;
                    } catch (e) {
                        n = null;
                    }
                    return n || null;
                };
            },
            {},
        ],
        22: [
            function (e, t, r) {
                "use strict";
                var o = e("typedarray-pool"),
                    i = e("ndarray-ops"),
                    a = e("ndarray"),
                    s = ["uint8", "uint8_clamped", "uint16", "uint32", "int8", "int16", "int32", "float32"];
                function u(e, t, r, n, i) {
                    (this.gl = e), (this.type = t), (this.handle = r), (this.length = n), (this.usage = i);
                }
                e = u.prototype;
                function f(e, t, r, n, i, o) {
                    var a = i.length * i.BYTES_PER_ELEMENT;
                    if (o < 0) return e.bufferData(t, i, n), a;
                    if (r < a + o) throw new Error("gl-buffer: If resizing buffer, must not specify offset");
                    return e.bufferSubData(t, o, i), r;
                }
                function l(e, t) {
                    for (var r = o.malloc(e.length, t), n = e.length, i = 0; i < n; ++i) r[i] = e[i];
                    return r;
                }
                (e.bind = function () {
                    this.gl.bindBuffer(this.type, this.handle);
                }),
                    (e.unbind = function () {
                        this.gl.bindBuffer(this.type, null);
                    }),
                    (e.dispose = function () {
                        this.gl.deleteBuffer(this.handle);
                    }),
                    (e.update = function (e, t) {
                        if (("number" != typeof t && (t = -1), this.bind(), "object" == typeof e && void 0 !== e.shape)) {
                            var r = e.dtype;
                            s.indexOf(r) < 0 && (r = "float32"),
                                (r = this.type === this.gl.ELEMENT_ARRAY_BUFFER ? (gl.getExtension("OES_element_index_uint") && "uint16" !== r ? "uint32" : "uint16") : r) === e.dtype &&
                                (function (e, t) {
                                    for (var r = 1, n = t.length - 1; 0 <= n; --n) {
                                        if (t[n] !== r) return;
                                        r *= e[n];
                                    }
                                    return 1;
                                })(e.shape, e.stride)
                                    ? 0 === e.offset && e.data.length === e.shape[0]
                                        ? (this.length = f(this.gl, this.type, this.length, this.usage, e.data, t))
                                        : (this.length = f(this.gl, this.type, this.length, this.usage, e.data.subarray(e.offset, e.shape[0]), t))
                                    : ((n = o.malloc(e.size, r)), (r = a(n, e.shape)), i.assign(r, e), (this.length = f(this.gl, this.type, this.length, this.usage, t < 0 ? n : n.subarray(0, e.size), t)), o.free(n));
                        } else if (Array.isArray(e)) {
                            var n = this.type === this.gl.ELEMENT_ARRAY_BUFFER ? l(e, "uint16") : l(e, "float32");
                            (this.length = f(this.gl, this.type, this.length, this.usage, t < 0 ? n : n.subarray(0, e.length), t)), o.free(n);
                        } else if ("object" == typeof e && "number" == typeof e.length) this.length = f(this.gl, this.type, this.length, this.usage, e, t);
                        else {
                            if ("number" != typeof e && void 0 !== e) throw new Error("gl-buffer: Invalid data type");
                            if (0 <= t) throw new Error("gl-buffer: Cannot specify offset when resizing buffer");
                            this.gl.bufferData(this.type, 0 | (e = (e |= 0) <= 0 ? 1 : e), this.usage), (this.length = e);
                        }
                    }),
                    (t.exports = function (e, t, r, n) {
                        if (((r = r || e.ARRAY_BUFFER), (n = n || e.DYNAMIC_DRAW), r !== e.ARRAY_BUFFER && r !== e.ELEMENT_ARRAY_BUFFER))
                            throw new Error("gl-buffer: Invalid type for webgl buffer, must be either gl.ARRAY_BUFFER or gl.ELEMENT_ARRAY_BUFFER");
                        if (n !== e.DYNAMIC_DRAW && n !== e.STATIC_DRAW && n !== e.STREAM_DRAW) throw new Error("gl-buffer: Invalid usage for buffer, must be either gl.DYNAMIC_DRAW, gl.STATIC_DRAW or gl.STREAM_DRAW");
                        var i = e.createBuffer();
                        return (n = new u(e, r, i, 0, n)).update(t), n;
                    });
            },
            { ndarray: 56, "ndarray-ops": 55, "typedarray-pool": 67 },
        ],
        23: [
            function (e, t, r) {
                t.exports = {
                    0: "NONE",
                    1: "ONE",
                    2: "LINE_LOOP",
                    3: "LINE_STRIP",
                    4: "TRIANGLES",
                    5: "TRIANGLE_STRIP",
                    6: "TRIANGLE_FAN",
                    256: "DEPTH_BUFFER_BIT",
                    512: "NEVER",
                    513: "LESS",
                    514: "EQUAL",
                    515: "LEQUAL",
                    516: "GREATER",
                    517: "NOTEQUAL",
                    518: "GEQUAL",
                    519: "ALWAYS",
                    768: "SRC_COLOR",
                    769: "ONE_MINUS_SRC_COLOR",
                    770: "SRC_ALPHA",
                    771: "ONE_MINUS_SRC_ALPHA",
                    772: "DST_ALPHA",
                    773: "ONE_MINUS_DST_ALPHA",
                    774: "DST_COLOR",
                    775: "ONE_MINUS_DST_COLOR",
                    776: "SRC_ALPHA_SATURATE",
                    1024: "STENCIL_BUFFER_BIT",
                    1028: "FRONT",
                    1029: "BACK",
                    1032: "FRONT_AND_BACK",
                    1280: "INVALID_ENUM",
                    1281: "INVALID_VALUE",
                    1282: "INVALID_OPERATION",
                    1285: "OUT_OF_MEMORY",
                    1286: "INVALID_FRAMEBUFFER_OPERATION",
                    2304: "CW",
                    2305: "CCW",
                    2849: "LINE_WIDTH",
                    2884: "CULL_FACE",
                    2885: "CULL_FACE_MODE",
                    2886: "FRONT_FACE",
                    2928: "DEPTH_RANGE",
                    2929: "DEPTH_TEST",
                    2930: "DEPTH_WRITEMASK",
                    2931: "DEPTH_CLEAR_VALUE",
                    2932: "DEPTH_FUNC",
                    2960: "STENCIL_TEST",
                    2961: "STENCIL_CLEAR_VALUE",
                    2962: "STENCIL_FUNC",
                    2963: "STENCIL_VALUE_MASK",
                    2964: "STENCIL_FAIL",
                    2965: "STENCIL_PASS_DEPTH_FAIL",
                    2966: "STENCIL_PASS_DEPTH_PASS",
                    2967: "STENCIL_REF",
                    2968: "STENCIL_WRITEMASK",
                    2978: "VIEWPORT",
                    3024: "DITHER",
                    3042: "BLEND",
                    3088: "SCISSOR_BOX",
                    3089: "SCISSOR_TEST",
                    3106: "COLOR_CLEAR_VALUE",
                    3107: "COLOR_WRITEMASK",
                    3317: "UNPACK_ALIGNMENT",
                    3333: "PACK_ALIGNMENT",
                    3379: "MAX_TEXTURE_SIZE",
                    3386: "MAX_VIEWPORT_DIMS",
                    3408: "SUBPIXEL_BITS",
                    3410: "RED_BITS",
                    3411: "GREEN_BITS",
                    3412: "BLUE_BITS",
                    3413: "ALPHA_BITS",
                    3414: "DEPTH_BITS",
                    3415: "STENCIL_BITS",
                    3553: "TEXTURE_2D",
                    4352: "DONT_CARE",
                    4353: "FASTEST",
                    4354: "NICEST",
                    5120: "BYTE",
                    5121: "UNSIGNED_BYTE",
                    5122: "SHORT",
                    5123: "UNSIGNED_SHORT",
                    5124: "INT",
                    5125: "UNSIGNED_INT",
                    5126: "FLOAT",
                    5386: "INVERT",
                    5890: "TEXTURE",
                    6401: "STENCIL_INDEX",
                    6402: "DEPTH_COMPONENT",
                    6406: "ALPHA",
                    6407: "RGB",
                    6408: "RGBA",
                    6409: "LUMINANCE",
                    6410: "LUMINANCE_ALPHA",
                    7680: "KEEP",
                    7681: "REPLACE",
                    7682: "INCR",
                    7683: "DECR",
                    7936: "VENDOR",
                    7937: "RENDERER",
                    7938: "VERSION",
                    9728: "NEAREST",
                    9729: "LINEAR",
                    9984: "NEAREST_MIPMAP_NEAREST",
                    9985: "LINEAR_MIPMAP_NEAREST",
                    9986: "NEAREST_MIPMAP_LINEAR",
                    9987: "LINEAR_MIPMAP_LINEAR",
                    10240: "TEXTURE_MAG_FILTER",
                    10241: "TEXTURE_MIN_FILTER",
                    10242: "TEXTURE_WRAP_S",
                    10243: "TEXTURE_WRAP_T",
                    10497: "REPEAT",
                    10752: "POLYGON_OFFSET_UNITS",
                    16384: "COLOR_BUFFER_BIT",
                    32769: "CONSTANT_COLOR",
                    32770: "ONE_MINUS_CONSTANT_COLOR",
                    32771: "CONSTANT_ALPHA",
                    32772: "ONE_MINUS_CONSTANT_ALPHA",
                    32773: "BLEND_COLOR",
                    32774: "FUNC_ADD",
                    32777: "BLEND_EQUATION_RGB",
                    32778: "FUNC_SUBTRACT",
                    32779: "FUNC_REVERSE_SUBTRACT",
                    32819: "UNSIGNED_SHORT_4_4_4_4",
                    32820: "UNSIGNED_SHORT_5_5_5_1",
                    32823: "POLYGON_OFFSET_FILL",
                    32824: "POLYGON_OFFSET_FACTOR",
                    32854: "RGBA4",
                    32855: "RGB5_A1",
                    32873: "TEXTURE_BINDING_2D",
                    32926: "SAMPLE_ALPHA_TO_COVERAGE",
                    32928: "SAMPLE_COVERAGE",
                    32936: "SAMPLE_BUFFERS",
                    32937: "SAMPLES",
                    32938: "SAMPLE_COVERAGE_VALUE",
                    32939: "SAMPLE_COVERAGE_INVERT",
                    32968: "BLEND_DST_RGB",
                    32969: "BLEND_SRC_RGB",
                    32970: "BLEND_DST_ALPHA",
                    32971: "BLEND_SRC_ALPHA",
                    33071: "CLAMP_TO_EDGE",
                    33170: "GENERATE_MIPMAP_HINT",
                    33189: "DEPTH_COMPONENT16",
                    33306: "DEPTH_STENCIL_ATTACHMENT",
                    33635: "UNSIGNED_SHORT_5_6_5",
                    33648: "MIRRORED_REPEAT",
                    33901: "ALIASED_POINT_SIZE_RANGE",
                    33902: "ALIASED_LINE_WIDTH_RANGE",
                    33984: "TEXTURE0",
                    33985: "TEXTURE1",
                    33986: "TEXTURE2",
                    33987: "TEXTURE3",
                    33988: "TEXTURE4",
                    33989: "TEXTURE5",
                    33990: "TEXTURE6",
                    33991: "TEXTURE7",
                    33992: "TEXTURE8",
                    33993: "TEXTURE9",
                    33994: "TEXTURE10",
                    33995: "TEXTURE11",
                    33996: "TEXTURE12",
                    33997: "TEXTURE13",
                    33998: "TEXTURE14",
                    33999: "TEXTURE15",
                    34e3: "TEXTURE16",
                    34001: "TEXTURE17",
                    34002: "TEXTURE18",
                    34003: "TEXTURE19",
                    34004: "TEXTURE20",
                    34005: "TEXTURE21",
                    34006: "TEXTURE22",
                    34007: "TEXTURE23",
                    34008: "TEXTURE24",
                    34009: "TEXTURE25",
                    34010: "TEXTURE26",
                    34011: "TEXTURE27",
                    34012: "TEXTURE28",
                    34013: "TEXTURE29",
                    34014: "TEXTURE30",
                    34015: "TEXTURE31",
                    34016: "ACTIVE_TEXTURE",
                    34024: "MAX_RENDERBUFFER_SIZE",
                    34041: "DEPTH_STENCIL",
                    34055: "INCR_WRAP",
                    34056: "DECR_WRAP",
                    34067: "TEXTURE_CUBE_MAP",
                    34068: "TEXTURE_BINDING_CUBE_MAP",
                    34069: "TEXTURE_CUBE_MAP_POSITIVE_X",
                    34070: "TEXTURE_CUBE_MAP_NEGATIVE_X",
                    34071: "TEXTURE_CUBE_MAP_POSITIVE_Y",
                    34072: "TEXTURE_CUBE_MAP_NEGATIVE_Y",
                    34073: "TEXTURE_CUBE_MAP_POSITIVE_Z",
                    34074: "TEXTURE_CUBE_MAP_NEGATIVE_Z",
                    34076: "MAX_CUBE_MAP_TEXTURE_SIZE",
                    34338: "VERTEX_ATTRIB_ARRAY_ENABLED",
                    34339: "VERTEX_ATTRIB_ARRAY_SIZE",
                    34340: "VERTEX_ATTRIB_ARRAY_STRIDE",
                    34341: "VERTEX_ATTRIB_ARRAY_TYPE",
                    34342: "CURRENT_VERTEX_ATTRIB",
                    34373: "VERTEX_ATTRIB_ARRAY_POINTER",
                    34466: "NUM_COMPRESSED_TEXTURE_FORMATS",
                    34467: "COMPRESSED_TEXTURE_FORMATS",
                    34660: "BUFFER_SIZE",
                    34661: "BUFFER_USAGE",
                    34816: "STENCIL_BACK_FUNC",
                    34817: "STENCIL_BACK_FAIL",
                    34818: "STENCIL_BACK_PASS_DEPTH_FAIL",
                    34819: "STENCIL_BACK_PASS_DEPTH_PASS",
                    34877: "BLEND_EQUATION_ALPHA",
                    34921: "MAX_VERTEX_ATTRIBS",
                    34922: "VERTEX_ATTRIB_ARRAY_NORMALIZED",
                    34930: "MAX_TEXTURE_IMAGE_UNITS",
                    34962: "ARRAY_BUFFER",
                    34963: "ELEMENT_ARRAY_BUFFER",
                    34964: "ARRAY_BUFFER_BINDING",
                    34965: "ELEMENT_ARRAY_BUFFER_BINDING",
                    34975: "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING",
                    35040: "STREAM_DRAW",
                    35044: "STATIC_DRAW",
                    35048: "DYNAMIC_DRAW",
                    35632: "FRAGMENT_SHADER",
                    35633: "VERTEX_SHADER",
                    35660: "MAX_VERTEX_TEXTURE_IMAGE_UNITS",
                    35661: "MAX_COMBINED_TEXTURE_IMAGE_UNITS",
                    35663: "SHADER_TYPE",
                    35664: "FLOAT_VEC2",
                    35665: "FLOAT_VEC3",
                    35666: "FLOAT_VEC4",
                    35667: "INT_VEC2",
                    35668: "INT_VEC3",
                    35669: "INT_VEC4",
                    35670: "BOOL",
                    35671: "BOOL_VEC2",
                    35672: "BOOL_VEC3",
                    35673: "BOOL_VEC4",
                    35674: "FLOAT_MAT2",
                    35675: "FLOAT_MAT3",
                    35676: "FLOAT_MAT4",
                    35678: "SAMPLER_2D",
                    35680: "SAMPLER_CUBE",
                    35712: "DELETE_STATUS",
                    35713: "COMPILE_STATUS",
                    35714: "LINK_STATUS",
                    35715: "VALIDATE_STATUS",
                    35716: "INFO_LOG_LENGTH",
                    35717: "ATTACHED_SHADERS",
                    35718: "ACTIVE_UNIFORMS",
                    35719: "ACTIVE_UNIFORM_MAX_LENGTH",
                    35720: "SHADER_SOURCE_LENGTH",
                    35721: "ACTIVE_ATTRIBUTES",
                    35722: "ACTIVE_ATTRIBUTE_MAX_LENGTH",
                    35724: "SHADING_LANGUAGE_VERSION",
                    35725: "CURRENT_PROGRAM",
                    36003: "STENCIL_BACK_REF",
                    36004: "STENCIL_BACK_VALUE_MASK",
                    36005: "STENCIL_BACK_WRITEMASK",
                    36006: "FRAMEBUFFER_BINDING",
                    36007: "RENDERBUFFER_BINDING",
                    36048: "FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE",
                    36049: "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME",
                    36050: "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL",
                    36051: "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE",
                    36053: "FRAMEBUFFER_COMPLETE",
                    36054: "FRAMEBUFFER_INCOMPLETE_ATTACHMENT",
                    36055: "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT",
                    36057: "FRAMEBUFFER_INCOMPLETE_DIMENSIONS",
                    36061: "FRAMEBUFFER_UNSUPPORTED",
                    36064: "COLOR_ATTACHMENT0",
                    36096: "DEPTH_ATTACHMENT",
                    36128: "STENCIL_ATTACHMENT",
                    36160: "FRAMEBUFFER",
                    36161: "RENDERBUFFER",
                    36162: "RENDERBUFFER_WIDTH",
                    36163: "RENDERBUFFER_HEIGHT",
                    36164: "RENDERBUFFER_INTERNAL_FORMAT",
                    36168: "STENCIL_INDEX8",
                    36176: "RENDERBUFFER_RED_SIZE",
                    36177: "RENDERBUFFER_GREEN_SIZE",
                    36178: "RENDERBUFFER_BLUE_SIZE",
                    36179: "RENDERBUFFER_ALPHA_SIZE",
                    36180: "RENDERBUFFER_DEPTH_SIZE",
                    36181: "RENDERBUFFER_STENCIL_SIZE",
                    36194: "RGB565",
                    36336: "LOW_FLOAT",
                    36337: "MEDIUM_FLOAT",
                    36338: "HIGH_FLOAT",
                    36339: "LOW_INT",
                    36340: "MEDIUM_INT",
                    36341: "HIGH_INT",
                    36346: "SHADER_COMPILER",
                    36347: "MAX_VERTEX_UNIFORM_VECTORS",
                    36348: "MAX_VARYING_VECTORS",
                    36349: "MAX_FRAGMENT_UNIFORM_VECTORS",
                    37440: "UNPACK_FLIP_Y_WEBGL",
                    37441: "UNPACK_PREMULTIPLY_ALPHA_WEBGL",
                    37442: "CONTEXT_LOST_WEBGL",
                    37443: "UNPACK_COLORSPACE_CONVERSION_WEBGL",
                    37444: "BROWSER_DEFAULT_WEBGL",
                };
            },
            {},
        ],
        24: [
            function (e, t, r) {
                var n = e("./1.0/numbers");
                t.exports = function (e) {
                    return n[e];
                };
            },
            { "./1.0/numbers": 23 },
        ],
        25: [
            function (e, t, r) {
                "use strict";
                var a = e("gl-texture2d");
                t.exports = function (e, t, r, n) {
                    f || ((f = e.FRAMEBUFFER_UNSUPPORTED), (l = e.FRAMEBUFFER_INCOMPLETE_ATTACHMENT), (h = e.FRAMEBUFFER_INCOMPLETE_DIMENSIONS), (c = e.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT));
                    var i = e.getExtension("WEBGL_draw_buffers");
                    !p &&
                        i &&
                        (function (e, t) {
                            var r = e.getParameter(t.MAX_COLOR_ATTACHMENTS_WEBGL);
                            p = new Array(r + 1);
                            for (var n = 0; n <= r; ++n) {
                                for (var i = new Array(r), o = 0; o < n; ++o) i[o] = e.COLOR_ATTACHMENT0 + o;
                                for (o = n; o < r; ++o) i[o] = e.NONE;
                                p[n] = i;
                            }
                        })(e, i);
                    Array.isArray(t) && ((n = r), (r = 0 | t[1]), (t = 0 | t[0]));
                    if ("number" != typeof t) throw new Error("gl-fbo: Missing shape parameter");
                    var o = e.getParameter(e.MAX_RENDERBUFFER_SIZE);
                    if (t < 0 || o < t || r < 0 || o < r) throw new Error("gl-fbo: Parameters are too large for FBO");
                    var a = 1;
                    if ("color" in (n = n || {})) {
                        if ((a = Math.max(0 | n.color, 0)) < 0) throw new Error("gl-fbo: Must specify a nonnegative number of colors");
                        if (1 < a) {
                            if (!i) throw new Error("gl-fbo: Multiple draw buffer extension not supported");
                            if (a > e.getParameter(i.MAX_COLOR_ATTACHMENTS_WEBGL)) throw new Error("gl-fbo: Context does not support " + a + " draw buffers");
                        }
                    }
                    var s = e.UNSIGNED_BYTE,
                        u = e.getExtension("OES_texture_float");
                    if (n.float && 0 < a) {
                        if (!u) throw new Error("gl-fbo: Context does not support floating point textures");
                        s = e.FLOAT;
                    } else n.preferFloat && 0 < a && u && (s = e.FLOAT);
                    o = !0;
                    "depth" in n && (o = !!n.depth);
                    u = !1;
                    "stencil" in n && (u = !!n.stencil);
                    return new m(e, t, r, s, a, o, u, i);
                };
                var f,
                    l,
                    h,
                    c,
                    p = null;
                function d(e) {
                    return [e.getParameter(e.FRAMEBUFFER_BINDING), e.getParameter(e.RENDERBUFFER_BINDING), e.getParameter(e.TEXTURE_BINDING_2D)];
                }
                function g(e, t) {
                    e.bindFramebuffer(e.FRAMEBUFFER, t[0]), e.bindRenderbuffer(e.RENDERBUFFER, t[1]), e.bindTexture(e.TEXTURE_2D, t[2]);
                }
                function _(e) {
                    switch (e) {
                        case f:
                            throw new Error("gl-fbo: Framebuffer unsupported");
                        case l:
                            throw new Error("gl-fbo: Framebuffer incomplete attachment");
                        case h:
                            throw new Error("gl-fbo: Framebuffer incomplete dimensions");
                        case c:
                            throw new Error("gl-fbo: Framebuffer incomplete missing attachment");
                        default:
                            throw new Error("gl-fbo: Framebuffer failed for unspecified reason");
                    }
                }
                function E(e, t, r, n, i, o) {
                    if (!n) return null;
                    n = a(e, t, r, i, n);
                    return (n.magFilter = e.NEAREST), (n.minFilter = e.NEAREST), (n.mipSamples = 1), n.bind(), e.framebufferTexture2D(e.FRAMEBUFFER, o, e.TEXTURE_2D, n.handle, 0), n;
                }
                function y(e, t, r, n, i) {
                    var o = e.createRenderbuffer();
                    return e.bindRenderbuffer(e.RENDERBUFFER, o), e.renderbufferStorage(e.RENDERBUFFER, n, t, r), e.framebufferRenderbuffer(e.FRAMEBUFFER, i, e.RENDERBUFFER, o), o;
                }
                function m(e, t, r, n, i, o, a, s) {
                    (this.gl = e), (this._shape = [0 | t, 0 | r]), (this._destroyed = !1), (this._ext = s), (this.color = new Array(i));
                    for (var u = 0; u < i; ++u) this.color[u] = null;
                    (this._color_rb = null), (this.depth = null), (this._depth_rb = null), (this._colorType = n), (this._useDepth = o), (this._useStencil = a);
                    var f = this,
                        r = [0 | t, 0 | r];
                    Object.defineProperties(r, {
                        0: {
                            get: function () {
                                return f._shape[0];
                            },
                            set: function (e) {
                                return (f.width = e);
                            },
                        },
                        1: {
                            get: function () {
                                return f._shape[1];
                            },
                            set: function (e) {
                                return (f.height = e);
                            },
                        },
                    }),
                        (this._shapeVector = r),
                        (function (e) {
                            var t = d(e.gl),
                                r = e.gl,
                                n = (e.handle = r.createFramebuffer()),
                                i = e._shape[0],
                                o = e._shape[1],
                                a = e.color.length,
                                s = e._ext,
                                u = e._useStencil,
                                f = e._useDepth,
                                l = e._colorType;
                            r.bindFramebuffer(r.FRAMEBUFFER, n);
                            for (var h = 0; h < a; ++h) e.color[h] = E(r, i, o, l, r.RGBA, r.COLOR_ATTACHMENT0 + h);
                            if (
                                (0 === a ? ((e._color_rb = y(r, i, o, r.RGBA4, r.COLOR_ATTACHMENT0)), s && s.drawBuffersWEBGL(p[0])) : 1 < a && s.drawBuffersWEBGL(p[a]),
                                (s = r.getExtension("WEBGL_depth_texture"))
                                    ? u
                                        ? (e.depth = E(r, i, o, s.UNSIGNED_INT_24_8_WEBGL, r.DEPTH_STENCIL, r.DEPTH_STENCIL_ATTACHMENT))
                                        : f && (e.depth = E(r, i, o, r.UNSIGNED_SHORT, r.DEPTH_COMPONENT, r.DEPTH_ATTACHMENT))
                                    : f && u
                                    ? (e._depth_rb = y(r, i, o, r.DEPTH_STENCIL, r.DEPTH_STENCIL_ATTACHMENT))
                                    : f
                                    ? (e._depth_rb = y(r, i, o, r.DEPTH_COMPONENT16, r.DEPTH_ATTACHMENT))
                                    : u && (e._depth_rb = y(r, i, o, r.STENCIL_INDEX, r.STENCIL_ATTACHMENT)),
                                (u = r.checkFramebufferStatus(r.FRAMEBUFFER)) !== r.FRAMEBUFFER_COMPLETE)
                            ) {
                                (e._destroyed = !0),
                                    r.bindFramebuffer(r.FRAMEBUFFER, null),
                                    r.deleteFramebuffer(e.handle),
                                    (e.handle = null),
                                    e.depth && (e.depth.dispose(), (e.depth = null)),
                                    e._depth_rb && (r.deleteRenderbuffer(e._depth_rb), (e._depth_rb = null));
                                for (h = 0; h < e.color.length; ++h) e.color[h].dispose(), (e.color[h] = null);
                                e._color_rb && (r.deleteRenderbuffer(e._color_rb), (e._color_rb = null)), g(r, t), _(u);
                            }
                            g(r, t);
                        })(this);
                }
                t = m.prototype;
                function n(e, t, r) {
                    if (e._destroyed) throw new Error("gl-fbo: Can't resize destroyed FBO");
                    if (e._shape[0] !== t || e._shape[1] !== r) {
                        var n = e.gl,
                            i = n.getParameter(n.MAX_RENDERBUFFER_SIZE);
                        if (t < 0 || i < t || r < 0 || i < r) throw new Error("gl-fbo: Can't resize FBO, invalid dimensions");
                        (e._shape[0] = t), (e._shape[1] = r);
                        for (var t = d(n), o = 0; o < e.color.length; ++o) e.color[o].shape = e._shape;
                        e._color_rb && (n.bindRenderbuffer(n.RENDERBUFFER, e._color_rb), n.renderbufferStorage(n.RENDERBUFFER, n.RGBA4, e._shape[0], e._shape[1])),
                            e.depth && (e.depth.shape = e._shape),
                            e._depth_rb &&
                                (n.bindRenderbuffer(n.RENDERBUFFER, e._depth_rb),
                                e._useDepth && e._useStencil
                                    ? n.renderbufferStorage(n.RENDERBUFFER, n.DEPTH_STENCIL, e._shape[0], e._shape[1])
                                    : e._useDepth
                                    ? n.renderbufferStorage(n.RENDERBUFFER, n.DEPTH_COMPONENT16, e._shape[0], e._shape[1])
                                    : e._useStencil && n.renderbufferStorage(n.RENDERBUFFER, n.STENCIL_INDEX, e._shape[0], e._shape[1])),
                            n.bindFramebuffer(n.FRAMEBUFFER, e.handle);
                        r = n.checkFramebufferStatus(n.FRAMEBUFFER);
                        r !== n.FRAMEBUFFER_COMPLETE && (e.dispose(), g(n, t), _(r)), g(n, t);
                    }
                }
                Object.defineProperties(t, {
                    shape: {
                        get: function () {
                            return this._destroyed ? [0, 0] : this._shapeVector;
                        },
                        set: function (e) {
                            if (2 !== (e = !Array.isArray(e) ? [0 | e, 0 | e] : e).length) throw new Error("gl-fbo: Shape vector must be length 2");
                            var t = 0 | e[0],
                                e = 0 | e[1];
                            return n(this, t, e), [t, e];
                        },
                        enumerable: !1,
                    },
                    width: {
                        get: function () {
                            return this._destroyed ? 0 : this._shape[0];
                        },
                        set: function (e) {
                            return n(this, (e |= 0), this._shape[1]), e;
                        },
                        enumerable: !1,
                    },
                    height: {
                        get: function () {
                            return this._destroyed ? 0 : this._shape[1];
                        },
                        set: function (e) {
                            return n(this, this._shape[0], (e |= 0)), e;
                        },
                        enumerable: !1,
                    },
                }),
                    (t.bind = function () {
                        var e;
                        this._destroyed || ((e = this.gl).bindFramebuffer(e.FRAMEBUFFER, this.handle), e.viewport(0, 0, this._shape[0], this._shape[1]));
                    }),
                    (t.dispose = function () {
                        if (!this._destroyed) {
                            this._destroyed = !0;
                            var e = this.gl;
                            e.deleteFramebuffer(this.handle), (this.handle = null), this.depth && (this.depth.dispose(), (this.depth = null)), this._depth_rb && (e.deleteRenderbuffer(this._depth_rb), (this._depth_rb = null));
                            for (var t = 0; t < this.color.length; ++t) this.color[t].dispose(), (this.color[t] = null);
                            this._color_rb && (e.deleteRenderbuffer(this._color_rb), (this._color_rb = null));
                        }
                    });
            },
            { "gl-texture2d": 36 },
        ],
        26: [
            function (e, t, r) {
                var p = e("sprintf-js").sprintf,
                    d = e("gl-constants/lookup"),
                    g = e("glsl-shader-name"),
                    _ = e("add-line-numbers");
                t.exports = function (e, t, r) {
                    "use strict";
                    var n = g(t) || "of unknown name (see npm glsl-shader-name)",
                        i = "unknown type";
                    void 0 !== r && (i = r === d.FRAGMENT_SHADER ? "fragment" : "vertex");
                    for (var o = p("Error compiling %s shader %s:\n", i, n), n = p("%s%s", o, e), a = e.split("\n"), s = {}, u = 0; u < a.length; u++) {
                        var f = a[u];
                        if ("" !== f && "\0" !== f) {
                            var l = parseInt(f.split(":")[2]);
                            if (isNaN(l)) throw new Error(p("Could not parse error: %s", f));
                            s[l] = f;
                        }
                    }
                    for (var h = _(t).split("\n"), u = 0; u < h.length; u++) {
                        var c;
                        (s[u + 3] || s[u + 2] || s[u + 1]) && ((c = h[u]), (o += c + "\n"), s[u + 1] && ((c = (c = s[u + 1]).substr(c.split(":", 3).join(":").length + 1).trim()), (o += p("^^^ %s\n\n", c))));
                    }
                    return { long: o.trim(), short: n.trim() };
                };
            },
            { "add-line-numbers": 7, "gl-constants/lookup": 24, "glsl-shader-name": 41, "sprintf-js": 66 },
        ],
        27: [
            function (e, t, r) {
                var n = e("./state");
                (t.exports = function (i) {
                    var e = ["Buffer", "Framebuffer", "Renderbuffer", "Program", "Shader", "Texture"].map(function (e) {
                        var t = "delete" + e,
                            e = "create" + e,
                            r = i[e],
                            n = [];
                        return (
                            (i[e] = function () {
                                var e = r.apply(this, arguments);
                                return n.push(e), e;
                            }),
                            { remove: t, handles: n }
                        );
                    });
                    return function () {
                        return (
                            e.forEach(function (e) {
                                for (var t = 0; t < e.handles.length; t++) i[e.remove].call(i, e.handles[t]);
                            }),
                            n(i),
                            i
                        );
                    };
                }),
                    (t.exports.state = n);
            },
            { "./state": 28 },
        ],
        28: [
            function (e, t, r) {
                t.exports = function (e) {
                    var t = e.getParameter(e.MAX_VERTEX_ATTRIBS),
                        r = e.createBuffer();
                    e.bindBuffer(e.ARRAY_BUFFER, r);
                    for (var n = 0; n < t; ++n) e.disableVertexAttribArray(n), e.vertexAttribPointer(n, 4, e.FLOAT, !1, 0, 0), e.vertexAttrib1f(n, 0);
                    e.deleteBuffer(r);
                    for (var i = e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS), n = 0; n < i; ++n) e.activeTexture(e.TEXTURE0 + n), e.bindTexture(e.TEXTURE_CUBE_MAP, null), e.bindTexture(e.TEXTURE_2D, null);
                    return (
                        e.activeTexture(e.TEXTURE0),
                        e.useProgram(null),
                        e.bindBuffer(e.ARRAY_BUFFER, null),
                        e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null),
                        e.bindFramebuffer(e.FRAMEBUFFER, null),
                        e.bindRenderbuffer(e.RENDERBUFFER, null),
                        e.disable(e.BLEND),
                        e.disable(e.CULL_FACE),
                        e.disable(e.DEPTH_TEST),
                        e.disable(e.DITHER),
                        e.disable(e.SCISSOR_TEST),
                        e.blendColor(0, 0, 0, 0),
                        e.blendEquation(e.FUNC_ADD),
                        e.blendFunc(e.ONE, e.ZERO),
                        e.clearColor(0, 0, 0, 0),
                        e.clearDepth(1),
                        e.clearStencil(-1),
                        e.colorMask(!0, !0, !0, !0),
                        e.cullFace(e.BACK),
                        e.depthFunc(e.LESS),
                        e.depthMask(!0),
                        e.depthRange(0, 1),
                        e.frontFace(e.CCW),
                        e.hint(e.GENERATE_MIPMAP_HINT, e.DONT_CARE),
                        e.lineWidth(1),
                        e.pixelStorei(e.PACK_ALIGNMENT, 4),
                        e.pixelStorei(e.UNPACK_ALIGNMENT, 4),
                        e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !1),
                        e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1),
                        e.polygonOffset(0, 0),
                        e.sampleCoverage(1, !1),
                        e.scissor(0, 0, e.canvas.width, e.canvas.height),
                        e.stencilFunc(e.ALWAYS, 0, 4294967295),
                        e.stencilMask(4294967295),
                        e.stencilOp(e.KEEP, e.KEEP, e.KEEP),
                        e.viewport(0, 0, e.canvas.width, e.canvas.height),
                        e.clear(e.COLOR_BUFFER_BIT | e.DEPTH_BUFFER_BIT | e.STENCIL_BUFFER_BIT),
                        e
                    );
                };
            },
            {},
        ],
        29: [
            function (e, t, r) {
                "use strict";
                var y = e("./lib/create-uniforms"),
                    m = e("./lib/create-attributes"),
                    v = e("./lib/reflect"),
                    b = e("./lib/shader-cache"),
                    T = e("./lib/runtime-reflect"),
                    A = e("./lib/GLError");
                function o(e) {
                    (this.gl = e), (this.gl.lastAttribCount = 0), (this._vref = this._fref = this._relink = this.vertShader = this.fragShader = this.program = this.attributes = this.uniforms = this.types = null);
                }
                e = o.prototype;
                function w(e, t) {
                    return e.name < t.name ? -1 : 1;
                }
                (e.bind = function () {
                    var e;
                    this.program || this._relink();
                    var t = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES),
                        r = this.gl.lastAttribCount;
                    if (r < t) for (e = r; e < t; e++) this.gl.enableVertexAttribArray(e);
                    else if (t < r) for (e = t; e < r; e++) this.gl.disableVertexAttribArray(e);
                    (this.gl.lastAttribCount = t), this.gl.useProgram(this.program);
                }),
                    (e.dispose = function () {
                        for (var e = this.gl.lastAttribCount, t = 0; t < e; t++) this.gl.disableVertexAttribArray(t);
                        (this.gl.lastAttribCount = 0),
                            this._fref && this._fref.dispose(),
                            this._vref && this._vref.dispose(),
                            (this.attributes = this.types = this.vertShader = this.fragShader = this.program = this._relink = this._fref = this._vref = null);
                    }),
                    (e.update = function (e, t, r, n) {
                        (t && 1 !== arguments.length) || ((e = (a = e).vertex), (t = a.fragment), (r = a.uniforms), (n = a.attributes));
                        var i = this,
                            o = i.gl,
                            a = i._vref;
                        (i._vref = b.shader(o, o.VERTEX_SHADER, e)), a && a.dispose(), (i.vertShader = i._vref.shader);
                        a = this._fref;
                        if (((i._fref = b.shader(o, o.FRAGMENT_SHADER, t)), a && a.dispose(), (i.fragShader = i._fref.shader), !r || !n)) {
                            t = o.createProgram();
                            if ((o.attachShader(t, i.fragShader), o.attachShader(t, i.vertShader), o.linkProgram(t), !o.getProgramParameter(t, o.LINK_STATUS))) {
                                a = o.getProgramInfoLog(t);
                                throw new A(a, "Error linking program:" + a);
                            }
                            (r = r || T.uniforms(o, t)), (n = n || T.attributes(o, t)), o.deleteProgram(t);
                        }
                        (n = n.slice()).sort(w);
                        for (var s = [], u = [], f = [], l = 0; l < n.length; ++l) {
                            var h = n[l];
                            if (0 <= h.type.indexOf("mat")) {
                                for (var c = 0 | h.type.charAt(h.type.length - 1), p = new Array(c), d = 0; d < c; ++d)
                                    (p[d] = f.length),
                                        u.push(h.name + "[" + d + "]"),
                                        "number" == typeof h.location ? f.push(h.location + d) : Array.isArray(h.location) && h.location.length === c && "number" == typeof h.location[d] ? f.push(0 | h.location[d]) : f.push(-1);
                                s.push({ name: h.name, type: h.type, locations: p });
                            } else s.push({ name: h.name, type: h.type, locations: [f.length] }), u.push(h.name), "number" == typeof h.location ? f.push(0 | h.location) : f.push(-1);
                        }
                        var g = 0;
                        for (l = 0; l < f.length; ++l)
                            if (f[l] < 0) {
                                for (; 0 <= f.indexOf(g); ) g += 1;
                                f[l] = g;
                            }
                        var _ = new Array(r.length);
                        function E() {
                            i.program = b.program(o, i._vref, i._fref, u, f);
                            for (var e = 0; e < r.length; ++e) _[e] = o.getUniformLocation(i.program, r[e].name);
                        }
                        E(), (i._relink = E), (i.types = { uniforms: v(r), attributes: v(n) }), (i.attributes = m(o, i, s, f)), Object.defineProperty(i, "uniforms", y(o, i, r, _));
                    }),
                    (t.exports = function (e, t, r, n, i) {
                        return (e = new o(e)).update(t, r, n, i), e;
                    });
            },
            { "./lib/GLError": 30, "./lib/create-attributes": 31, "./lib/create-uniforms": 32, "./lib/reflect": 33, "./lib/runtime-reflect": 34, "./lib/shader-cache": 35 },
        ],
        30: [
            function (e, t, r) {
                function n(e, t, r) {
                    (this.shortMessage = t || ""), (this.longMessage = r || ""), (this.rawError = e || ""), (this.message = "gl-shader: " + (t || e || "") + (r ? "\n" + r : "")), (this.stack = new Error().stack);
                }
                ((n.prototype = new Error()).name = "GLError"), (t.exports = n.prototype.constructor = n);
            },
            {},
        ],
        31: [
            function (e, t, r) {
                "use strict";
                t.exports = function (e, t, r, n) {
                    for (var i = {}, o = 0, a = r.length; o < a; ++o) {
                        var s,
                            u = r[o],
                            f = u.name,
                            l = u.type,
                            h = u.locations;
                        switch (l) {
                            case "bool":
                            case "int":
                            case "float":
                                p(e, t, h[0], n, 1, i, f);
                                break;
                            default:
                                if (0 <= l.indexOf("vec")) {
                                    if ((s = l.charCodeAt(l.length - 1) - 48) < 2 || 4 < s) throw new c("", "Invalid data type for attribute " + f + ": " + l);
                                    p(e, t, h[0], n, s, i, f);
                                } else {
                                    if (!(0 <= l.indexOf("mat"))) throw new c("", "Unknown data type for attribute " + f + ": " + l);
                                    if ((s = l.charCodeAt(l.length - 1) - 48) < 2 || 4 < s) throw new c("", "Invalid data type for attribute " + f + ": " + l);
                                    !(function (a, e, s, u, f, t, r) {
                                        for (var n = new Array(f), i = new Array(f), o = 0; o < f; ++o) p(a, e, s[o], u, f, n, o), (i[o] = n[o]);
                                        Object.defineProperty(n, "location", {
                                            set: function (e) {
                                                if (Array.isArray(e)) for (var t = 0; t < f; ++t) i[t].location = e[t];
                                                else for (t = 0; t < f; ++t) i[t].location = e + t;
                                                return e;
                                            },
                                            get: function () {
                                                for (var e = new Array(f), t = 0; t < f; ++t) e[t] = u[s[t]];
                                                return e;
                                            },
                                            enumerable: !0,
                                        }),
                                            (n.pointer = function (e, t, r, n) {
                                                (e = e || a.FLOAT), (t = !!t), (r = r || f * f), (n = n || 0);
                                                for (var i = 0; i < f; ++i) {
                                                    var o = u[s[i]];
                                                    a.vertexAttribPointer(o, f, e, t, r, n + i * f), a.enableVertexAttribArray(o);
                                                }
                                            });
                                        var l = new Array(f),
                                            h = a["vertexAttrib" + f + "fv"];
                                        Object.defineProperty(t, r, {
                                            set: function (e) {
                                                for (var t = 0; t < f; ++t) {
                                                    var r = u[s[t]];
                                                    if ((a.disableVertexAttribArray(r), Array.isArray(e[0]))) h.call(a, r, e[t]);
                                                    else {
                                                        for (var n = 0; n < f; ++n) l[n] = e[f * t + n];
                                                        h.call(a, r, l);
                                                    }
                                                }
                                                return e;
                                            },
                                            get: function () {
                                                return n;
                                            },
                                            enumerable: !0,
                                        });
                                    })(e, t, h, n, s, i, f);
                                }
                        }
                    }
                    return i;
                };
                var c = e("./GLError");
                function f(e, t, r, n, i, o) {
                    (this._gl = e), (this._wrapper = t), (this._index = r), (this._locations = n), (this._dimension = i), (this._constFunc = o);
                }
                e = f.prototype;
                (e.pointer = function (e, t, r, n) {
                    var i = this._gl,
                        o = this._locations[this._index];
                    i.vertexAttribPointer(o, this._dimension, e || i.FLOAT, !!t, r || 0, n || 0), i.enableVertexAttribArray(o);
                }),
                    (e.set = function (e, t, r, n) {
                        return this._constFunc(this._locations[this._index], e, t, r, n);
                    }),
                    Object.defineProperty(e, "location", {
                        get: function () {
                            return this._locations[this._index];
                        },
                        set: function (e) {
                            return e !== this._locations[this._index] && ((this._locations[this._index] = 0 | e), (this._wrapper.program = null)), 0 | e;
                        },
                    });
                var l = [
                    function (e, t, r) {
                        return void 0 === r.length ? e.vertexAttrib1f(t, r) : e.vertexAttrib1fv(t, r);
                    },
                    function (e, t, r, n) {
                        return void 0 === r.length ? e.vertexAttrib2f(t, r, n) : e.vertexAttrib2fv(t, r);
                    },
                    function (e, t, r, n, i) {
                        return void 0 === r.length ? e.vertexAttrib3f(t, r, n, i) : e.vertexAttrib3fv(t, r);
                    },
                    function (e, t, r, n, i, o) {
                        return void 0 === r.length ? e.vertexAttrib4f(t, r, n, i, o) : e.vertexAttrib4fv(t, r);
                    },
                ];
                function p(t, e, r, n, i, o, a) {
                    var s = l[i],
                        u = new f(t, e, r, n, i, s);
                    Object.defineProperty(o, a, {
                        set: function (e) {
                            return t.disableVertexAttribArray(n[r]), s(t, n[r], e), e;
                        },
                        get: function () {
                            return u;
                        },
                        enumerable: !0,
                    });
                }
            },
            { "./GLError": 30 },
        ],
        32: [
            function (e, t, r) {
                "use strict";
                var n = e("./reflect"),
                    g = e("./GLError");
                function s(e) {
                    return function () {
                        return e;
                    };
                }
                function u(e, t) {
                    for (var r = new Array(e), n = 0; n < e; ++n) r[n] = t;
                    return r;
                }
                t.exports = function (c, e, p, d) {
                    function o(h) {
                        return function (e) {
                            for (
                                var t = (function e(t, r) {
                                        if ("object" != typeof r) return [[t, r]];
                                        var n = [];
                                        for (var i in r) {
                                            var o = r[i],
                                                a = t;
                                            parseInt(i) + "" === i ? (a += "[" + i + "]") : (a += "." + i), "object" == typeof o ? n.push.apply(n, e(a, o)) : n.push([a, o]);
                                        }
                                        return n;
                                    })("", h),
                                    r = 0;
                                r < t.length;
                                ++r
                            ) {
                                var n = t[r],
                                    i = n[0],
                                    o = n[1];
                                if (d[o]) {
                                    var a,
                                        s = e;
                                    "string" != typeof i ||
                                        (0 !== i.indexOf(".") && 0 !== i.indexOf("[")) ||
                                        (s = (a = 0 === (a = i).indexOf(".") ? i.slice(1) : a).indexOf("]") === a.length - 1 ? ((n = a.indexOf("[")), (i = a.slice(0, n)), (n = a.slice(n + 1, a.length - 1)), (i ? e[i] : e)[n]) : e[a]);
                                    var u,
                                        f = p[o].type;
                                    switch (f) {
                                        case "bool":
                                        case "int":
                                        case "sampler2D":
                                        case "samplerCube":
                                            c.uniform1i(d[o], s);
                                            break;
                                        case "float":
                                            c.uniform1f(d[o], s);
                                            break;
                                        default:
                                            var l = f.indexOf("vec");
                                            if (!(0 <= l && l <= 1 && f.length === 4 + l)) {
                                                if (0 !== f.indexOf("mat") || 4 !== f.length) throw new g("", "Unknown uniform data type for " + name + ": " + f);
                                                if ((u = f.charCodeAt(f.length - 1) - 48) < 2 || 4 < u) throw new g("", "Invalid uniform dimension type for matrix " + name + ": " + f);
                                                c["uniformMatrix" + u + "fv"](d[o], !1, s);
                                                break;
                                            }
                                            if ((u = f.charCodeAt(f.length - 1) - 48) < 2 || 4 < u) throw new g("", "Invalid data type");
                                            switch (f.charAt(0)) {
                                                case "b":
                                                case "i":
                                                    c["uniform" + u + "iv"](d[o], s);
                                                    break;
                                                case "v":
                                                    c["uniform" + u + "fv"](d[o], s);
                                                    break;
                                                default:
                                                    throw new g("", "Unrecognized data type for vector " + name + ": " + f);
                                            }
                                    }
                                }
                            }
                        };
                    }
                    function i(e, t, r) {
                        var n, i;
                        "object" == typeof r
                            ? ((n = a(r)), Object.defineProperty(e, t, { get: s(n), set: o(r), enumerable: !0, configurable: !1 }))
                            : d[r]
                            ? Object.defineProperty(e, t, {
                                  get: function (e, t, r) {
                                      return e.getUniform(t.program, r[i]);
                                  },
                                  set: o((i = r)),
                                  enumerable: !0,
                                  configurable: !1,
                              })
                            : (e[t] = (function (e) {
                                  switch (e) {
                                      case "bool":
                                          return !1;
                                      case "int":
                                      case "sampler2D":
                                      case "samplerCube":
                                      case "float":
                                          return 0;
                                      default:
                                          var t,
                                              r = e.indexOf("vec");
                                          if (0 <= r && r <= 1 && e.length === 4 + r) {
                                              if ((t = e.charCodeAt(e.length - 1) - 48) < 2 || 4 < t) throw new g("", "Invalid data type");
                                              return "b" === e.charAt(0) ? u(t, !1) : u(t, 0);
                                          }
                                          if (0 !== e.indexOf("mat") || 4 !== e.length) throw new g("", "Unknown uniform data type for " + name + ": " + e);
                                          if ((t = e.charCodeAt(e.length - 1) - 48) < 2 || 4 < t) throw new g("", "Invalid uniform dimension type for matrix " + name + ": " + e);
                                          return u(t * t, 0);
                                  }
                              })(p[r].type));
                    }
                    function a(e) {
                        if (Array.isArray(e)) for (var t = new Array(e.length), r = 0; r < e.length; ++r) i(t, r, e[r]);
                        else for (var n in ((t = {}), e)) i(t, n, e[n]);
                        return t;
                    }
                    var t = n(p, !0);
                    return { get: s(a(t)), set: o(t), enumerable: !0, configurable: !0 };
                };
            },
            { "./GLError": 30, "./reflect": 33 },
        ],
        33: [
            function (e, t, r) {
                "use strict";
                t.exports = function (e, t) {
                    for (var r = {}, n = 0; n < e.length; ++n)
                        for (var i = e[n].name.split("."), o = r, a = 0; a < i.length; ++a) {
                            var s = i[a].split("[");
                            if (1 < s.length) {
                                s[0] in o || (o[s[0]] = []), (o = o[s[0]]);
                                for (var u = 1; u < s.length; ++u) {
                                    var f = parseInt(s[u]);
                                    u < s.length - 1 || a < i.length - 1 ? (f in o || (u < s.length - 1 ? (o[f] = []) : (o[f] = {})), (o = o[f])) : (o[f] = t ? n : e[n].type);
                                }
                            } else a < i.length - 1 ? (s[0] in o || (o[s[0]] = {}), (o = o[s[0]])) : (o[s[0]] = t ? n : e[n].type);
                        }
                    return r;
                };
            },
            {},
        ],
        34: [
            function (e, t, r) {
                "use strict";
                (r.uniforms = function (e, t) {
                    for (var r = e.getProgramParameter(t, e.ACTIVE_UNIFORMS), n = [], i = 0; i < r; ++i) {
                        var o = e.getActiveUniform(t, i);
                        if (o) {
                            var a = u(e, o.type);
                            if (1 < o.size) for (var s = 0; s < o.size; ++s) n.push({ name: o.name.replace("[0]", "[" + s + "]"), type: a });
                            else n.push({ name: o.name, type: a });
                        }
                    }
                    return n;
                }),
                    (r.attributes = function (e, t) {
                        for (var r = e.getProgramParameter(t, e.ACTIVE_ATTRIBUTES), n = [], i = 0; i < r; ++i) {
                            var o = e.getActiveAttrib(t, i);
                            o && n.push({ name: o.name, type: u(e, o.type) });
                        }
                        return n;
                    });
                var o = {
                        FLOAT: "float",
                        FLOAT_VEC2: "vec2",
                        FLOAT_VEC3: "vec3",
                        FLOAT_VEC4: "vec4",
                        INT: "int",
                        INT_VEC2: "ivec2",
                        INT_VEC3: "ivec3",
                        INT_VEC4: "ivec4",
                        BOOL: "bool",
                        BOOL_VEC2: "bvec2",
                        BOOL_VEC3: "bvec3",
                        BOOL_VEC4: "bvec4",
                        FLOAT_MAT2: "mat2",
                        FLOAT_MAT3: "mat3",
                        FLOAT_MAT4: "mat4",
                        SAMPLER_2D: "sampler2D",
                        SAMPLER_CUBE: "samplerCube",
                    },
                    a = null;
                function u(e, t) {
                    if (!a) {
                        var r = Object.keys(o);
                        a = {};
                        for (var n = 0; n < r.length; ++n) {
                            var i = r[n];
                            a[e[i]] = o[i];
                        }
                    }
                    return a[t];
                }
            },
            {},
        ],
        35: [
            function (e, t, r) {
                "use strict";
                (r.shader = function (e, t, r) {
                    return f(e).getShaderReference(t, r);
                }),
                    (r.program = function (e, t, r, n, i) {
                        return f(e).getProgram(t, r, n, i);
                    });
                var s = e("./GLError"),
                    o = e("gl-format-compiler-error"),
                    n = new ("undefined" == typeof WeakMap ? e("weakmap-shim") : WeakMap)(),
                    a = 0;
                function u(e, t, r, n, i, o, a) {
                    (this.id = e), (this.src = t), (this.type = r), (this.shader = n), (this.count = o), (this.programs = []), (this.cache = a);
                }
                function i(e) {
                    (this.gl = e), (this.shaders = [{}, {}]), (this.programs = {});
                }
                u.prototype.dispose = function () {
                    if (0 == --this.count) {
                        for (var e = this.cache, t = e.gl, r = this.programs, n = 0, i = r.length; n < i; ++n) {
                            var o = e.programs[r[n]];
                            o && (delete e.programs[n], t.deleteProgram(o));
                        }
                        t.deleteShader(this.shader), delete e.shaders[(this.type === t.FRAGMENT_SHADER) | 0][this.src];
                    }
                };
                e = i.prototype;
                function f(e) {
                    var t = n.get(e);
                    return t || ((t = new i(e)), n.set(e, t)), t;
                }
                (e.getShaderReference = function (e, t) {
                    var r = this.gl,
                        n = this.shaders[(e === r.FRAGMENT_SHADER) | 0],
                        i = n[t];
                    return (
                        i && r.isShader(i.shader)
                            ? (i.count += 1)
                            : ((r = (function (e, t, r) {
                                  var n = e.createShader(t);
                                  if ((e.shaderSource(n, r), e.compileShader(n), e.getShaderParameter(n, e.COMPILE_STATUS))) return n;
                                  n = e.getShaderInfoLog(n);
                                  try {
                                      var i = o(n, r, t);
                                  } catch (e) {
                                      throw (console.warn("Failed to format compiler error: " + e), new s(n, "Error compiling shader:\n" + n));
                                  }
                                  throw new s(n, i.short, i.long);
                              })(r, e, t)),
                              (i = n[t] = new u(a++, t, e, r, 0, 1, this))),
                        i
                    );
                }),
                    (e.getProgram = function (e, t, r, n) {
                        var i = [e.id, t.id, r.join(":"), n.join(":")].join("@"),
                            o = this.programs[i];
                        return (
                            (o && this.gl.isProgram(o)) ||
                                ((this.programs[i] = o = (function (e, t, r, n, i) {
                                    var o = e.createProgram();
                                    e.attachShader(o, t), e.attachShader(o, r);
                                    for (var a = 0; a < n.length; ++a) e.bindAttribLocation(o, i[a], n[a]);
                                    if ((e.linkProgram(o), e.getProgramParameter(o, e.LINK_STATUS))) return o;
                                    throw ((r = e.getProgramInfoLog(o)), new s(r, "Error linking program: " + r));
                                })(this.gl, e.shader, t.shader, r, n)),
                                e.programs.push(i),
                                t.programs.push(i)),
                            o
                        );
                    });
            },
            { "./GLError": 30, "gl-format-compiler-error": 26, "weakmap-shim": 72 },
        ],
        36: [
            function (e, t, r) {
                "use strict";
                var p = e("ndarray"),
                    d = e("ndarray-ops"),
                    g = e("typedarray-pool");
                t.exports = function (e) {
                    if (arguments.length <= 1) throw new Error("gl-texture2d: Missing arguments for texture2d constructor");
                    n ||
                        (function (e) {
                            (n = [e.LINEAR, e.NEAREST_MIPMAP_LINEAR, e.LINEAR_MIPMAP_NEAREST, e.LINEAR_MIPMAP_NEAREST]),
                                (i = [e.NEAREST, e.LINEAR, e.NEAREST_MIPMAP_NEAREST, e.NEAREST_MIPMAP_LINEAR, e.LINEAR_MIPMAP_NEAREST, e.LINEAR_MIPMAP_LINEAR]),
                                (o = [e.REPEAT, e.CLAMP_TO_EDGE, e.MIRRORED_REPEAT]);
                        })(e);
                    if ("number" == typeof arguments[1]) return u(e, arguments[1], arguments[2], arguments[3] || e.RGBA, arguments[4] || e.UNSIGNED_BYTE);
                    if (Array.isArray(arguments[1])) return u(e, 0 | arguments[1][0], 0 | arguments[1][1], arguments[2] || e.RGBA, arguments[3] || e.UNSIGNED_BYTE);
                    if ("object" == typeof arguments[1]) {
                        var t = arguments[1],
                            r = a(t) ? t : t.raw;
                        if (r)
                            return (function (e, t, r, n, i, o) {
                                var a = h(e);
                                return e.texImage2D(e.TEXTURE_2D, 0, i, i, o, t), new l(e, a, r, n, i, o);
                            })(e, r, 0 | t.width, 0 | t.height, arguments[2] || e.RGBA, arguments[3] || e.UNSIGNED_BYTE);
                        if (t.shape && t.data && t.stride)
                            return (function (e, t) {
                                var r = t.dtype,
                                    n = t.shape.slice(),
                                    i = e.getParameter(e.MAX_TEXTURE_SIZE);
                                if (n[0] < 0 || n[0] > i || n[1] < 0 || n[1] > i) throw new Error("gl-texture2d: Invalid texture size");
                                var o = E(n, t.stride.slice()),
                                    a = 0;
                                "float32" === r ? (a = e.FLOAT) : "float64" === r ? ((a = e.FLOAT), (o = !1), (r = "float32")) : "uint8" === r ? (a = e.UNSIGNED_BYTE) : ((a = e.UNSIGNED_BYTE), (o = !1), (r = "uint8"));
                                var s,
                                    u = 0;
                                if (2 === n.length) (u = e.LUMINANCE), (n = [n[0], n[1], 1]), (t = p(t.data, n, [t.stride[0], t.stride[1], 1], t.offset));
                                else {
                                    if (3 !== n.length) throw new Error("gl-texture2d: Invalid shape for texture");
                                    if (1 === n[2]) u = e.ALPHA;
                                    else if (2 === n[2]) u = e.LUMINANCE_ALPHA;
                                    else if (3 === n[2]) u = e.RGB;
                                    else {
                                        if (4 !== n[2]) throw new Error("gl-texture2d: Invalid shape for pixel coords");
                                        u = e.RGBA;
                                    }
                                }
                                a !== e.FLOAT || e.getExtension("OES_texture_float") || ((a = e.UNSIGNED_BYTE), (o = !1));
                                var f = t.size;
                                t = o
                                    ? 0 === t.offset && t.data.length === f
                                        ? t.data
                                        : t.data.subarray(t.offset, t.offset + f)
                                    : ((i = [n[2], n[2] * n[0], 1]), (s = g.malloc(f, r)), (i = p(s, n, i, 0)), ("float32" !== r && "float64" !== r) || a !== e.UNSIGNED_BYTE ? d.assign(i, t) : _(i, t), s.subarray(0, f));
                                f = h(e);
                                e.texImage2D(e.TEXTURE_2D, 0, u, n[0], n[1], 0, u, a, t), o || g.free(s);
                                return new l(e, f, n[0], n[1], u, a);
                            })(e, t);
                    }
                    throw new Error("gl-texture2d: Invalid arguments for texture2d constructor");
                };
                var n = null,
                    i = null,
                    o = null;
                function a(e) {
                    return (
                        ("undefined" != typeof HTMLCanvasElement && e instanceof HTMLCanvasElement) ||
                        ("undefined" != typeof HTMLImageElement && e instanceof HTMLImageElement) ||
                        ("undefined" != typeof HTMLVideoElement && e instanceof HTMLVideoElement) ||
                        ("undefined" != typeof ImageData && e instanceof ImageData)
                    );
                }
                var _ = function (e, t) {
                    d.muls(e, t, 255);
                };
                function s(e, t, r) {
                    var n = e.gl,
                        i = n.getParameter(n.MAX_TEXTURE_SIZE);
                    if (t < 0 || i < t || r < 0 || i < r) throw new Error("gl-texture2d: Invalid texture size");
                    return (e._shape = [t, r]), e.bind(), n.texImage2D(n.TEXTURE_2D, 0, e.format, t, r, 0, e.format, e.type, null), (e._mipLevels = [0]), e;
                }
                function l(e, t, r, n, i, o) {
                    (this.gl = e),
                        (this.handle = t),
                        (this.format = i),
                        (this.type = o),
                        (this._shape = [r, n]),
                        (this._mipLevels = [0]),
                        (this._magFilter = e.NEAREST),
                        (this._minFilter = e.NEAREST),
                        (this._wrapS = e.CLAMP_TO_EDGE),
                        (this._wrapT = e.CLAMP_TO_EDGE),
                        (this._anisoSamples = 1);
                    var a = this,
                        e = [this._wrapS, this._wrapT];
                    Object.defineProperties(e, [
                        {
                            get: function () {
                                return a._wrapS;
                            },
                            set: function (e) {
                                return (a.wrapS = e);
                            },
                        },
                        {
                            get: function () {
                                return a._wrapT;
                            },
                            set: function (e) {
                                return (a.wrapT = e);
                            },
                        },
                    ]),
                        (this._wrapVector = e);
                    e = [this._shape[0], this._shape[1]];
                    Object.defineProperties(e, [
                        {
                            get: function () {
                                return a._shape[0];
                            },
                            set: function (e) {
                                return (a.width = e);
                            },
                        },
                        {
                            get: function () {
                                return a._shape[1];
                            },
                            set: function (e) {
                                return (a.height = e);
                            },
                        },
                    ]),
                        (this._shapeVector = e);
                }
                t = l.prototype;
                function E(e, t) {
                    return 3 === e.length ? 1 === t[2] && t[1] === e[0] * e[2] && t[0] === e[2] : 1 === t[0] && t[1] === e[0];
                }
                function h(e) {
                    var t = e.createTexture();
                    return (
                        e.bindTexture(e.TEXTURE_2D, t),
                        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST),
                        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST),
                        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE),
                        e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE),
                        t
                    );
                }
                function u(e, t, r, n, i) {
                    var o = e.getParameter(e.MAX_TEXTURE_SIZE);
                    if (t < 0 || o < t || r < 0 || o < r) throw new Error("gl-texture2d: Invalid texture shape");
                    if (i === e.FLOAT && !e.getExtension("OES_texture_float")) throw new Error("gl-texture2d: Floating point textures not supported on this platform");
                    o = h(e);
                    return e.texImage2D(e.TEXTURE_2D, 0, n, t, r, 0, n, i, null), new l(e, o, t, r, n, i);
                }
                Object.defineProperties(t, {
                    minFilter: {
                        get: function () {
                            return this._minFilter;
                        },
                        set: function (e) {
                            this.bind();
                            var t = this.gl;
                            if ((this.type === t.FLOAT && 0 <= n.indexOf(e) && (t.getExtension("OES_texture_float_linear") || (e = t.NEAREST)), i.indexOf(e) < 0)) throw new Error("gl-texture2d: Unknown filter mode " + e);
                            return t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, e), (this._minFilter = e);
                        },
                    },
                    magFilter: {
                        get: function () {
                            return this._magFilter;
                        },
                        set: function (e) {
                            this.bind();
                            var t = this.gl;
                            if ((this.type === t.FLOAT && 0 <= n.indexOf(e) && (t.getExtension("OES_texture_float_linear") || (e = t.NEAREST)), i.indexOf(e) < 0)) throw new Error("gl-texture2d: Unknown filter mode " + e);
                            return t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, e), (this._magFilter = e);
                        },
                    },
                    mipSamples: {
                        get: function () {
                            return this._anisoSamples;
                        },
                        set: function (e) {
                            var t = this._anisoSamples;
                            return (
                                (this._anisoSamples = 0 | Math.max(e, 1)),
                                t === this._anisoSamples || ((t = this.gl.getExtension("EXT_texture_filter_anisotropic")) && this.gl.texParameterf(this.gl.TEXTURE_2D, t.TEXTURE_MAX_ANISOTROPY_EXT, this._anisoSamples)),
                                this._anisoSamples
                            );
                        },
                    },
                    wrapS: {
                        get: function () {
                            return this._wrapS;
                        },
                        set: function (e) {
                            if ((this.bind(), o.indexOf(e) < 0)) throw new Error("gl-texture2d: Unknown wrap mode " + e);
                            return this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, e), (this._wrapS = e);
                        },
                    },
                    wrapT: {
                        get: function () {
                            return this._wrapT;
                        },
                        set: function (e) {
                            if ((this.bind(), o.indexOf(e) < 0)) throw new Error("gl-texture2d: Unknown wrap mode " + e);
                            return this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, e), (this._wrapT = e);
                        },
                    },
                    wrap: {
                        get: function () {
                            return this._wrapVector;
                        },
                        set: function (e) {
                            if (2 !== (e = !Array.isArray(e) ? [e, e] : e).length) throw new Error("gl-texture2d: Must specify wrap mode for rows and columns");
                            for (var t = 0; t < 2; ++t) if (o.indexOf(e[t]) < 0) throw new Error("gl-texture2d: Unknown wrap mode " + e);
                            (this._wrapS = e[0]), (this._wrapT = e[1]);
                            var r = this.gl;
                            return this.bind(), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_S, this._wrapS), r.texParameteri(r.TEXTURE_2D, r.TEXTURE_WRAP_T, this._wrapT), e;
                        },
                    },
                    shape: {
                        get: function () {
                            return this._shapeVector;
                        },
                        set: function (e) {
                            if (Array.isArray(e)) {
                                if (2 !== e.length) throw new Error("gl-texture2d: Invalid texture shape");
                            } else e = [0 | e, 0 | e];
                            return s(this, 0 | e[0], 0 | e[1]), [0 | e[0], 0 | e[1]];
                        },
                    },
                    width: {
                        get: function () {
                            return this._shape[0];
                        },
                        set: function (e) {
                            return s(this, (e |= 0), this._shape[1]), e;
                        },
                    },
                    height: {
                        get: function () {
                            return this._shape[1];
                        },
                        set: function (e) {
                            return s(this, this._shape[0], (e |= 0)), e;
                        },
                    },
                }),
                    (t.bind = function (e) {
                        var t = this.gl;
                        return void 0 !== e && t.activeTexture(t.TEXTURE0 + (0 | e)), t.bindTexture(t.TEXTURE_2D, this.handle), void 0 !== e ? 0 | e : t.getParameter(t.ACTIVE_TEXTURE) - t.TEXTURE0;
                    }),
                    (t.dispose = function () {
                        this.gl.deleteTexture(this.handle);
                    }),
                    (t.generateMipmap = function () {
                        this.bind(), this.gl.generateMipmap(this.gl.TEXTURE_2D);
                        for (var e = Math.min(this._shape[0], this._shape[1]), t = 0; 0 < e; ++t, e >>>= 1) this._mipLevels.indexOf(t) < 0 && this._mipLevels.push(t);
                    }),
                    (t.setPixels = function (e, t, r, n) {
                        var i = this.gl;
                        this.bind(), Array.isArray(t) ? ((n = r), (r = 0 | t[1]), (t = 0 | t[0])) : ((t = t || 0), (r = r || 0)), (n = n || 0);
                        var o = a(e) ? e : e.raw;
                        if (o) this._mipLevels.indexOf(n) < 0 ? (i.texImage2D(i.TEXTURE_2D, 0, this.format, this.format, this.type, o), this._mipLevels.push(n)) : i.texSubImage2D(i.TEXTURE_2D, n, t, r, this.format, this.type, o);
                        else {
                            if (!(e.shape && e.stride && e.data)) throw new Error("gl-texture2d: Unsupported data type");
                            if (e.shape.length < 2 || t + e.shape[1] > this._shape[1] >>> n || r + e.shape[0] > this._shape[0] >>> n || t < 0 || r < 0) throw new Error("gl-texture2d: Texture dimensions are out of bounds");
                            !(function (e, t, r, n, i, o, a, s) {
                                var u = s.dtype,
                                    f = s.shape.slice();
                                if (f.length < 2 || 3 < f.length) throw new Error("gl-texture2d: Invalid ndarray, must be 2d or 3d");
                                var l = 0,
                                    h = 0,
                                    c = E(f, s.stride.slice());
                                "float32" === u ? (l = e.FLOAT) : "float64" === u ? ((l = e.FLOAT), (c = !1), (u = "float32")) : "uint8" === u ? (l = e.UNSIGNED_BYTE) : ((l = e.UNSIGNED_BYTE), (c = !1), (u = "uint8"));
                                if (2 === f.length) (h = e.LUMINANCE), (f = [f[0], f[1], 1]), (s = p(s.data, f, [s.stride[0], s.stride[1], 1], s.offset));
                                else {
                                    if (3 !== f.length) throw new Error("gl-texture2d: Invalid shape for texture");
                                    if (1 === f[2]) h = e.ALPHA;
                                    else if (2 === f[2]) h = e.LUMINANCE_ALPHA;
                                    else if (3 === f[2]) h = e.RGB;
                                    else {
                                        if (4 !== f[2]) throw new Error("gl-texture2d: Invalid shape for pixel coords");
                                        h = e.RGBA;
                                    }
                                    f[2];
                                }
                                (h !== e.LUMINANCE && h !== e.ALPHA) || (i !== e.LUMINANCE && i !== e.ALPHA) || (h = i);
                                if (h !== i) throw new Error("gl-texture2d: Incompatible texture format for setPixels");
                                (u = s.size), (h = a.indexOf(n) < 0);
                                h && a.push(n);
                                l === o && c
                                    ? 0 === s.offset && s.data.length === u
                                        ? h
                                            ? e.texImage2D(e.TEXTURE_2D, n, i, f[0], f[1], 0, i, o, s.data)
                                            : e.texSubImage2D(e.TEXTURE_2D, n, t, r, f[0], f[1], i, o, s.data)
                                        : h
                                        ? e.texImage2D(e.TEXTURE_2D, n, i, f[0], f[1], 0, i, o, s.data.subarray(s.offset, s.offset + u))
                                        : e.texSubImage2D(e.TEXTURE_2D, n, t, r, f[0], f[1], i, o, s.data.subarray(s.offset, s.offset + u))
                                    : ((a = o === e.FLOAT ? g.mallocFloat32(u) : g.mallocUint8(u)),
                                      (c = p(a, f, [f[2], f[2] * f[0], 1])),
                                      l === e.FLOAT && o === e.UNSIGNED_BYTE ? _(c, s) : d.assign(c, s),
                                      h ? e.texImage2D(e.TEXTURE_2D, n, i, f[0], f[1], 0, i, o, a.subarray(0, u)) : e.texSubImage2D(e.TEXTURE_2D, n, t, r, f[0], f[1], i, o, a.subarray(0, u)),
                                      o === e.FLOAT ? g.freeFloat32(a) : g.freeUint8(a));
                            })(i, t, r, n, this.format, this.type, this._mipLevels, e);
                        }
                    });
            },
            { ndarray: 56, "ndarray-ops": 55, "typedarray-pool": 67 },
        ],
        37: [
            function (e, t, r) {
                "use strict";
                t.exports = function (e, t, r) {
                    t ? t.bind() : e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null);
                    var n = 0 | e.getParameter(e.MAX_VERTEX_ATTRIBS);
                    if (r) {
                        if (r.length > n) throw new Error("gl-vao: Too many vertex attributes");
                        for (var i = 0; i < r.length; ++i) {
                            var o = r[i];
                            if (o.buffer) {
                                var a = o.buffer,
                                    s = o.size || 4,
                                    u = o.type || e.FLOAT,
                                    f = !!o.normalized,
                                    l = o.stride || 0,
                                    h = o.offset || 0;
                                a.bind(), e.enableVertexAttribArray(i), e.vertexAttribPointer(i, s, u, f, l, h);
                            } else {
                                if ("number" == typeof o) e.vertexAttrib1f(i, o);
                                else if (1 === o.length) e.vertexAttrib1f(i, o[0]);
                                else if (2 === o.length) e.vertexAttrib2f(i, o[0], o[1]);
                                else if (3 === o.length) e.vertexAttrib3f(i, o[0], o[1], o[2]);
                                else {
                                    if (4 !== o.length) throw new Error("gl-vao: Invalid vertex attribute");
                                    e.vertexAttrib4f(i, o[0], o[1], o[2], o[3]);
                                }
                                e.disableVertexAttribArray(i);
                            }
                        }
                        for (; i < n; ++i) e.disableVertexAttribArray(i);
                    } else {
                        e.bindBuffer(e.ARRAY_BUFFER, null);
                        for (i = 0; i < n; ++i) e.disableVertexAttribArray(i);
                    }
                };
            },
            {},
        ],
        38: [
            function (e, t, r) {
                "use strict";
                var n = e("./do-bind.js");
                function i(e) {
                    (this.gl = e), (this._elements = null), (this._attributes = null), (this._elementsType = e.UNSIGNED_SHORT);
                }
                (i.prototype.bind = function () {
                    n(this.gl, this._elements, this._attributes);
                }),
                    (i.prototype.update = function (e, t, r) {
                        (this._elements = t), (this._attributes = e), (this._elementsType = r || this.gl.UNSIGNED_SHORT);
                    }),
                    (i.prototype.dispose = function () {}),
                    (i.prototype.unbind = function () {}),
                    (i.prototype.draw = function (e, t, r) {
                        r = r || 0;
                        var n = this.gl;
                        this._elements ? n.drawElements(e, t, this._elementsType, r) : n.drawArrays(e, r, t);
                    }),
                    (t.exports = function (e) {
                        return new i(e);
                    });
            },
            { "./do-bind.js": 37 },
        ],
        39: [
            function (e, t, r) {
                "use strict";
                var o = e("./do-bind.js");
                function a(e, t, r, n, i, o) {
                    (this.location = e), (this.dimension = t), (this.a = r), (this.b = n), (this.c = i), (this.d = o);
                }
                function n(e, t, r) {
                    (this.gl = e), (this._ext = t), (this.handle = r), (this._attribs = []), (this._useElements = !1), (this._elementsType = e.UNSIGNED_SHORT);
                }
                (a.prototype.bind = function (e) {
                    switch (this.dimension) {
                        case 1:
                            e.vertexAttrib1f(this.location, this.a);
                            break;
                        case 2:
                            e.vertexAttrib2f(this.location, this.a, this.b);
                            break;
                        case 3:
                            e.vertexAttrib3f(this.location, this.a, this.b, this.c);
                            break;
                        case 4:
                            e.vertexAttrib4f(this.location, this.a, this.b, this.c, this.d);
                    }
                }),
                    (n.prototype.bind = function () {
                        this._ext.bindVertexArrayOES(this.handle);
                        for (var e = 0; e < this._attribs.length; ++e) this._attribs[e].bind(this.gl);
                    }),
                    (n.prototype.unbind = function () {
                        this._ext.bindVertexArrayOES(null);
                    }),
                    (n.prototype.dispose = function () {
                        this._ext.deleteVertexArrayOES(this.handle);
                    }),
                    (n.prototype.update = function (e, t, r) {
                        if ((this.bind(), o(this.gl, t, e), this.unbind(), (this._attribs.length = 0), e))
                            for (var n = 0; n < e.length; ++n) {
                                var i = e[n];
                                "number" == typeof i ? this._attribs.push(new a(n, 1, i)) : Array.isArray(i) && this._attribs.push(new a(n, i.length, i[0], i[1], i[2], i[3]));
                            }
                        (this._useElements = !!t), (this._elementsType = r || this.gl.UNSIGNED_SHORT);
                    }),
                    (n.prototype.draw = function (e, t, r) {
                        r = r || 0;
                        var n = this.gl;
                        this._useElements ? n.drawElements(e, t, this._elementsType, r) : n.drawArrays(e, r, t);
                    }),
                    (t.exports = function (e, t) {
                        return new n(e, t, t.createVertexArrayOES());
                    });
            },
            { "./do-bind.js": 37 },
        ],
        40: [
            function (e, t, r) {
                "use strict";
                var o = e("./lib/vao-native.js"),
                    a = e("./lib/vao-emulated.js");
                function s(e) {
                    (this.bindVertexArrayOES = e.bindVertexArray.bind(e)), (this.createVertexArrayOES = e.createVertexArray.bind(e)), (this.deleteVertexArrayOES = e.deleteVertexArray.bind(e));
                }
                t.exports = function (e, t, r, n) {
                    var i = e.createVertexArray ? new s(e) : e.getExtension("OES_vertex_array_object");
                    return (e = i ? o(e, i) : a(e)).update(t, r, n), e;
                };
            },
            { "./lib/vao-emulated.js": 38, "./lib/vao-native.js": 39 },
        ],
        41: [
            function (e, t, r) {
                var o = e("glsl-tokenizer"),
                    a = e("atob-lite");
                t.exports = function (e) {
                    for (var t = Array.isArray(e) ? e : o(e), r = 0; r < t.length; r++) {
                        var n = t[r];
                        if ("preprocessor" === n.type) {
                            var i = n.data.match(/\#define\s+SHADER_NAME(_B64)?\s+(.+)$/);
                            if (i && i[2]) {
                                (n = i[1]), (i = i[2]);
                                return (n ? a(i) : i).trim();
                            }
                        }
                    }
                };
            },
            { "atob-lite": 9, "glsl-tokenizer": 48 },
        ],
        42: [
            function (e, t, r) {
                t.exports = function (e) {
                    var r,
                        n,
                        i,
                        o = 0,
                        a = 0,
                        s = I,
                        u = [],
                        f = [],
                        l = 1,
                        h = 0,
                        c = 0,
                        p = !1,
                        d = !1,
                        g = "",
                        t = w,
                        _ = T;
                    "300 es" === (e = e || {}).version && ((t = x), (_ = R));
                    for (var E = {}, y = {}, o = 0; o < t.length; o++) E[t[o]] = !0;
                    for (o = 0; o < _.length; o++) y[_[o]] = !0;
                    return function (e) {
                        return (
                            (f = []),
                            null !== e
                                ? (function (e) {
                                      (o = 0), e.toString && (e = e.toString());
                                      var t;
                                      (g += e.replace(/\r\n/g, "\n")), (i = g.length);
                                      for (; (r = g[o]), o < i; ) {
                                          switch (((t = o), s)) {
                                              case S:
                                                  "/" !== r || "*" !== n ? (u.push(r), (n = r)) : (u.push(r), m(u.join("")), (s = I)), (o += 1);
                                                  break;
                                              case M:
                                              case U:
                                                  o = v();
                                                  break;
                                              case L:
                                                  o = (function () {
                                                      if ("." === n && /\d/.test(r)) return (s = C), o;
                                                      if ("/" === n && "*" === r) return (s = S), o;
                                                      if ("/" === n && "/" === r) return (s = M), o;
                                                      if ("." === r && u.length) {
                                                          for (; b(u); );
                                                          return (s = C), o;
                                                      }
                                                      if (";" === r || ")" === r || "(" === r) {
                                                          if (u.length) for (; b(u); );
                                                          return m(r), (s = I), o + 1;
                                                      }
                                                      var e = 2 === u.length && "=" !== r;
                                                      if (/[\w_\d\s]/.test(r) || e) {
                                                          for (; b(u); );
                                                          return (s = I), o;
                                                      }
                                                      return u.push(r), (n = r), o + 1;
                                                  })();
                                                  break;
                                              case F:
                                                  o = (function () {
                                                      if ("." === r) return u.push(r), (s = C), (n = r), o + 1;
                                                      if (/[eE]/.test(r)) return u.push(r), (s = C), (n = r), o + 1;
                                                      if ("x" === r && 1 === u.length && "0" === u[0]) return (s = V), u.push(r), (n = r), o + 1;
                                                      if (/[^\d]/.test(r)) return m(u.join("")), (s = I), o;
                                                      return u.push(r), (n = r), o + 1;
                                                  })();
                                                  break;
                                              case V:
                                                  o = (function () {
                                                      if (/[^a-fA-F0-9]/.test(r)) return m(u.join("")), (s = I), o;
                                                      return u.push(r), (n = r), o + 1;
                                                  })();
                                                  break;
                                              case C:
                                                  o = (function () {
                                                      "f" === r && (u.push(r), (n = r), (o += 1));
                                                      if (/[eE]/.test(r)) return u.push(r), (n = r), o + 1;
                                                      if (("-" === r || "+" === r) && /[eE]/.test(n)) return u.push(r), (n = r), o + 1;
                                                      if (/[^\d]/.test(r)) return m(u.join("")), (s = I), o;
                                                      return u.push(r), (n = r), o + 1;
                                                  })();
                                                  break;
                                              case N:
                                                  o = (function () {
                                                      if (/[^\d\w_]/.test(r)) {
                                                          var e = u.join("");
                                                          return (s = y[e] ? B : E[e] ? P : O), m(u.join("")), (s = I), o;
                                                      }
                                                      return u.push(r), (n = r), o + 1;
                                                  })();
                                                  break;
                                              case D:
                                                  o = (function () {
                                                      if (/[^\s]/g.test(r)) return m(u.join("")), (s = I), o;
                                                      return u.push(r), (n = r), o + 1;
                                                  })();
                                                  break;
                                              case I:
                                                  o = (function () {
                                                      if (((u = u.length ? [] : u), "/" === n && "*" === r)) return (c = a + o - 1), (s = S), (n = r), o + 1;
                                                      if ("/" === n && "/" === r) return (c = a + o - 1), (s = M), (n = r), o + 1;
                                                      if ("#" === r) return (s = U), (c = a + o), o;
                                                      if (/\s/.test(r)) return (s = D), (c = a + o), o;
                                                      return (p = /\d/.test(r)), (d = /[^\w_]/.test(r)), (c = a + o), (s = p ? F : d ? L : N), o;
                                                  })();
                                          }
                                          t !== o && ("\n" === g[t] ? ((h = 0), ++l) : ++h);
                                      }
                                      return (a += o), (g = g.slice(o)), f;
                                  })(e)
                                : (function () {
                                      u.length && m(u.join(""));
                                      return (s = j), m("(eof)"), f;
                                  })()
                        );
                    };
                    function m(e) {
                        e.length && f.push({ type: k[s], data: e, position: c, line: l, column: h });
                    }
                    function v() {
                        return ("\r" !== r && "\n" !== r) || "\\" === n ? (u.push(r), (n = r), o + 1) : (m(u.join("")), (s = I), o);
                    }
                    function b(e) {
                        var t,
                            r,
                            n = 0;
                        do {
                            if (((t = A.indexOf(e.slice(0, e.length + n).join(""))), (r = A[t]), -1 === t)) {
                                if (0 < n-- + e.length) continue;
                                r = e.slice(0, 1).join("");
                            }
                            return m(r), (c += r.length), (u = u.slice(r.length)).length;
                        } while (1);
                    }
                };
                var T = e("./lib/literals"),
                    A = e("./lib/operators"),
                    w = e("./lib/builtins"),
                    R = e("./lib/literals-300es"),
                    x = e("./lib/builtins-300es"),
                    I = 999,
                    N = 9999,
                    S = 0,
                    M = 1,
                    U = 2,
                    L = 3,
                    F = 4,
                    C = 5,
                    O = 6,
                    P = 7,
                    B = 8,
                    D = 9,
                    j = 10,
                    V = 11,
                    k = ["block-comment", "line-comment", "preprocessor", "operator", "integer", "float", "ident", "builtin", "keyword", "whitespace", "eof", "integer"];
            },
            { "./lib/builtins": 44, "./lib/builtins-300es": 43, "./lib/literals": 46, "./lib/literals-300es": 45, "./lib/operators": 47 },
        ],
        43: [
            function (e, t, r) {
                e = (e = e("./builtins")).slice().filter(function (e) {
                    return !/^(gl\_|texture)/.test(e);
                });
                t.exports = e.concat([
                    "gl_VertexID",
                    "gl_InstanceID",
                    "gl_Position",
                    "gl_PointSize",
                    "gl_FragCoord",
                    "gl_FrontFacing",
                    "gl_FragDepth",
                    "gl_PointCoord",
                    "gl_MaxVertexAttribs",
                    "gl_MaxVertexUniformVectors",
                    "gl_MaxVertexOutputVectors",
                    "gl_MaxFragmentInputVectors",
                    "gl_MaxVertexTextureImageUnits",
                    "gl_MaxCombinedTextureImageUnits",
                    "gl_MaxTextureImageUnits",
                    "gl_MaxFragmentUniformVectors",
                    "gl_MaxDrawBuffers",
                    "gl_MinProgramTexelOffset",
                    "gl_MaxProgramTexelOffset",
                    "gl_DepthRangeParameters",
                    "gl_DepthRange",
                    "trunc",
                    "round",
                    "roundEven",
                    "isnan",
                    "isinf",
                    "floatBitsToInt",
                    "floatBitsToUint",
                    "intBitsToFloat",
                    "uintBitsToFloat",
                    "packSnorm2x16",
                    "unpackSnorm2x16",
                    "packUnorm2x16",
                    "unpackUnorm2x16",
                    "packHalf2x16",
                    "unpackHalf2x16",
                    "outerProduct",
                    "transpose",
                    "determinant",
                    "inverse",
                    "texture",
                    "textureSize",
                    "textureProj",
                    "textureLod",
                    "textureOffset",
                    "texelFetch",
                    "texelFetchOffset",
                    "textureProjOffset",
                    "textureLodOffset",
                    "textureProjLod",
                    "textureProjLodOffset",
                    "textureGrad",
                    "textureGradOffset",
                    "textureProjGrad",
                    "textureProjGradOffset",
                ]);
            },
            { "./builtins": 44 },
        ],
        44: [
            function (e, t, r) {
                t.exports = [
                    "abs",
                    "acos",
                    "all",
                    "any",
                    "asin",
                    "atan",
                    "ceil",
                    "clamp",
                    "cos",
                    "cross",
                    "dFdx",
                    "dFdy",
                    "degrees",
                    "distance",
                    "dot",
                    "equal",
                    "exp",
                    "exp2",
                    "faceforward",
                    "floor",
                    "fract",
                    "gl_BackColor",
                    "gl_BackLightModelProduct",
                    "gl_BackLightProduct",
                    "gl_BackMaterial",
                    "gl_BackSecondaryColor",
                    "gl_ClipPlane",
                    "gl_ClipVertex",
                    "gl_Color",
                    "gl_DepthRange",
                    "gl_DepthRangeParameters",
                    "gl_EyePlaneQ",
                    "gl_EyePlaneR",
                    "gl_EyePlaneS",
                    "gl_EyePlaneT",
                    "gl_Fog",
                    "gl_FogCoord",
                    "gl_FogFragCoord",
                    "gl_FogParameters",
                    "gl_FragColor",
                    "gl_FragCoord",
                    "gl_FragData",
                    "gl_FragDepth",
                    "gl_FragDepthEXT",
                    "gl_FrontColor",
                    "gl_FrontFacing",
                    "gl_FrontLightModelProduct",
                    "gl_FrontLightProduct",
                    "gl_FrontMaterial",
                    "gl_FrontSecondaryColor",
                    "gl_LightModel",
                    "gl_LightModelParameters",
                    "gl_LightModelProducts",
                    "gl_LightProducts",
                    "gl_LightSource",
                    "gl_LightSourceParameters",
                    "gl_MaterialParameters",
                    "gl_MaxClipPlanes",
                    "gl_MaxCombinedTextureImageUnits",
                    "gl_MaxDrawBuffers",
                    "gl_MaxFragmentUniformComponents",
                    "gl_MaxLights",
                    "gl_MaxTextureCoords",
                    "gl_MaxTextureImageUnits",
                    "gl_MaxTextureUnits",
                    "gl_MaxVaryingFloats",
                    "gl_MaxVertexAttribs",
                    "gl_MaxVertexTextureImageUnits",
                    "gl_MaxVertexUniformComponents",
                    "gl_ModelViewMatrix",
                    "gl_ModelViewMatrixInverse",
                    "gl_ModelViewMatrixInverseTranspose",
                    "gl_ModelViewMatrixTranspose",
                    "gl_ModelViewProjectionMatrix",
                    "gl_ModelViewProjectionMatrixInverse",
                    "gl_ModelViewProjectionMatrixInverseTranspose",
                    "gl_ModelViewProjectionMatrixTranspose",
                    "gl_MultiTexCoord0",
                    "gl_MultiTexCoord1",
                    "gl_MultiTexCoord2",
                    "gl_MultiTexCoord3",
                    "gl_MultiTexCoord4",
                    "gl_MultiTexCoord5",
                    "gl_MultiTexCoord6",
                    "gl_MultiTexCoord7",
                    "gl_Normal",
                    "gl_NormalMatrix",
                    "gl_NormalScale",
                    "gl_ObjectPlaneQ",
                    "gl_ObjectPlaneR",
                    "gl_ObjectPlaneS",
                    "gl_ObjectPlaneT",
                    "gl_Point",
                    "gl_PointCoord",
                    "gl_PointParameters",
                    "gl_PointSize",
                    "gl_Position",
                    "gl_ProjectionMatrix",
                    "gl_ProjectionMatrixInverse",
                    "gl_ProjectionMatrixInverseTranspose",
                    "gl_ProjectionMatrixTranspose",
                    "gl_SecondaryColor",
                    "gl_TexCoord",
                    "gl_TextureEnvColor",
                    "gl_TextureMatrix",
                    "gl_TextureMatrixInverse",
                    "gl_TextureMatrixInverseTranspose",
                    "gl_TextureMatrixTranspose",
                    "gl_Vertex",
                    "greaterThan",
                    "greaterThanEqual",
                    "inversesqrt",
                    "length",
                    "lessThan",
                    "lessThanEqual",
                    "log",
                    "log2",
                    "matrixCompMult",
                    "max",
                    "min",
                    "mix",
                    "mod",
                    "normalize",
                    "not",
                    "notEqual",
                    "pow",
                    "radians",
                    "reflect",
                    "refract",
                    "sign",
                    "sin",
                    "smoothstep",
                    "sqrt",
                    "step",
                    "tan",
                    "texture2D",
                    "texture2DLod",
                    "texture2DProj",
                    "texture2DProjLod",
                    "textureCube",
                    "textureCubeLod",
                    "texture2DLodEXT",
                    "texture2DProjLodEXT",
                    "textureCubeLodEXT",
                    "texture2DGradEXT",
                    "texture2DProjGradEXT",
                    "textureCubeGradEXT",
                ];
            },
            {},
        ],
        45: [
            function (e, t, r) {
                e = e("./literals");
                t.exports = e
                    .slice()
                    .concat([
                        "layout",
                        "centroid",
                        "smooth",
                        "case",
                        "mat2x2",
                        "mat2x3",
                        "mat2x4",
                        "mat3x2",
                        "mat3x3",
                        "mat3x4",
                        "mat4x2",
                        "mat4x3",
                        "mat4x4",
                        "uvec2",
                        "uvec3",
                        "uvec4",
                        "samplerCubeShadow",
                        "sampler2DArray",
                        "sampler2DArrayShadow",
                        "isampler2D",
                        "isampler3D",
                        "isamplerCube",
                        "isampler2DArray",
                        "usampler2D",
                        "usampler3D",
                        "usamplerCube",
                        "usampler2DArray",
                        "coherent",
                        "restrict",
                        "readonly",
                        "writeonly",
                        "resource",
                        "atomic_uint",
                        "noperspective",
                        "patch",
                        "sample",
                        "subroutine",
                        "common",
                        "partition",
                        "active",
                        "filter",
                        "image1D",
                        "image2D",
                        "image3D",
                        "imageCube",
                        "iimage1D",
                        "iimage2D",
                        "iimage3D",
                        "iimageCube",
                        "uimage1D",
                        "uimage2D",
                        "uimage3D",
                        "uimageCube",
                        "image1DArray",
                        "image2DArray",
                        "iimage1DArray",
                        "iimage2DArray",
                        "uimage1DArray",
                        "uimage2DArray",
                        "image1DShadow",
                        "image2DShadow",
                        "image1DArrayShadow",
                        "image2DArrayShadow",
                        "imageBuffer",
                        "iimageBuffer",
                        "uimageBuffer",
                        "sampler1DArray",
                        "sampler1DArrayShadow",
                        "isampler1D",
                        "isampler1DArray",
                        "usampler1D",
                        "usampler1DArray",
                        "isampler2DRect",
                        "usampler2DRect",
                        "samplerBuffer",
                        "isamplerBuffer",
                        "usamplerBuffer",
                        "sampler2DMS",
                        "isampler2DMS",
                        "usampler2DMS",
                        "sampler2DMSArray",
                        "isampler2DMSArray",
                        "usampler2DMSArray",
                    ]);
            },
            { "./literals": 46 },
        ],
        46: [
            function (e, t, r) {
                t.exports = [
                    "precision",
                    "highp",
                    "mediump",
                    "lowp",
                    "attribute",
                    "const",
                    "uniform",
                    "varying",
                    "break",
                    "continue",
                    "do",
                    "for",
                    "while",
                    "if",
                    "else",
                    "in",
                    "out",
                    "inout",
                    "float",
                    "int",
                    "uint",
                    "void",
                    "bool",
                    "true",
                    "false",
                    "discard",
                    "return",
                    "mat2",
                    "mat3",
                    "mat4",
                    "vec2",
                    "vec3",
                    "vec4",
                    "ivec2",
                    "ivec3",
                    "ivec4",
                    "bvec2",
                    "bvec3",
                    "bvec4",
                    "sampler1D",
                    "sampler2D",
                    "sampler3D",
                    "samplerCube",
                    "sampler1DShadow",
                    "sampler2DShadow",
                    "struct",
                    "asm",
                    "class",
                    "union",
                    "enum",
                    "typedef",
                    "template",
                    "this",
                    "packed",
                    "goto",
                    "switch",
                    "default",
                    "inline",
                    "noinline",
                    "volatile",
                    "public",
                    "static",
                    "extern",
                    "external",
                    "interface",
                    "long",
                    "short",
                    "double",
                    "half",
                    "fixed",
                    "unsigned",
                    "input",
                    "output",
                    "hvec2",
                    "hvec3",
                    "hvec4",
                    "dvec2",
                    "dvec3",
                    "dvec4",
                    "fvec2",
                    "fvec3",
                    "fvec4",
                    "sampler2DRect",
                    "sampler3DRect",
                    "sampler2DRectShadow",
                    "sizeof",
                    "cast",
                    "namespace",
                    "using",
                ];
            },
            {},
        ],
        47: [
            function (e, t, r) {
                t.exports = [
                    "<<=",
                    ">>=",
                    "++",
                    "--",
                    "<<",
                    ">>",
                    "<=",
                    ">=",
                    "==",
                    "!=",
                    "&&",
                    "||",
                    "+=",
                    "-=",
                    "*=",
                    "/=",
                    "%=",
                    "&=",
                    "^^",
                    "^=",
                    "|=",
                    "(",
                    ")",
                    "[",
                    "]",
                    ".",
                    "!",
                    "~",
                    "*",
                    "/",
                    "%",
                    "+",
                    "-",
                    "<",
                    ">",
                    "&",
                    "^",
                    "|",
                    "?",
                    ":",
                    "=",
                    ",",
                    ";",
                    "{",
                    "}",
                ];
            },
            {},
        ],
        48: [
            function (e, t, r) {
                var n = e("./index");
                t.exports = function (e, t) {
                    var r = n(t),
                        t = [];
                    return (t = (t = t.concat(r(e))).concat(r(null)));
                };
            },
            { "./index": 42 },
        ],
        49: [
            function (e, t, r) {
                t.exports = function (e) {
                    "string" == typeof e && (e = [e]);
                    for (var t = [].slice.call(arguments, 1), r = [], n = 0; n < e.length - 1; n++) r.push(e[n], t[n] || "");
                    return r.push(e[n]), r.join("");
                };
            },
            {},
        ],
        50: [
            function (e, t, r) {
                (r.read = function (e, t, r, n, i) {
                    var o,
                        a,
                        s = 8 * i - n - 1,
                        u = (1 << s) - 1,
                        f = u >> 1,
                        l = -7,
                        h = r ? i - 1 : 0,
                        c = r ? -1 : 1,
                        r = e[t + h];
                    for (h += c, o = r & ((1 << -l) - 1), r >>= -l, l += s; 0 < l; o = 256 * o + e[t + h], h += c, l -= 8);
                    for (a = o & ((1 << -l) - 1), o >>= -l, l += n; 0 < l; a = 256 * a + e[t + h], h += c, l -= 8);
                    if (0 === o) o = 1 - f;
                    else {
                        if (o === u) return a ? NaN : (1 / 0) * (r ? -1 : 1);
                        (a += Math.pow(2, n)), (o -= f);
                    }
                    return (r ? -1 : 1) * a * Math.pow(2, o - n);
                }),
                    (r.write = function (e, t, r, n, i, o) {
                        var a,
                            s,
                            u = 8 * o - i - 1,
                            f = (1 << u) - 1,
                            l = f >> 1,
                            h = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                            c = n ? 0 : o - 1,
                            p = n ? 1 : -1,
                            o = t < 0 || (0 === t && 1 / t < 0) ? 1 : 0;
                        for (
                            t = Math.abs(t),
                                isNaN(t) || t === 1 / 0
                                    ? ((s = isNaN(t) ? 1 : 0), (a = f))
                                    : ((a = Math.floor(Math.log(t) / Math.LN2)),
                                      t * (n = Math.pow(2, -a)) < 1 && (a--, (n *= 2)),
                                      2 <= (t += 1 <= a + l ? h / n : h * Math.pow(2, 1 - l)) * n && (a++, (n /= 2)),
                                      f <= a + l ? ((s = 0), (a = f)) : 1 <= a + l ? ((s = (t * n - 1) * Math.pow(2, i)), (a += l)) : ((s = t * Math.pow(2, l - 1) * Math.pow(2, i)), (a = 0)));
                            8 <= i;
                            e[r + c] = 255 & s, c += p, s /= 256, i -= 8
                        );
                        for (a = (a << i) | s, u += i; 0 < u; e[r + c] = 255 & a, c += p, a /= 256, u -= 8);
                        e[r + c - p] |= 128 * o;
                    });
            },
            {},
        ],
        51: [
            function (e, t, r) {
                "function" == typeof Object.create
                    ? (t.exports = function (e, t) {
                          t && ((e.super_ = t), (e.prototype = Object.create(t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } })));
                      })
                    : (t.exports = function (e, t) {
                          var r;
                          t && ((e.super_ = t), ((r = function () {}).prototype = t.prototype), (e.prototype = new r()), (e.prototype.constructor = e));
                      });
            },
            {},
        ],
        52: [
            function (e, t, r) {
                "use strict";
                t.exports = function (e) {
                    for (var t = new Array(e), r = 0; r < e; ++r) t[r] = r;
                    return t;
                };
            },
            {},
        ],
        53: [
            function (e, t, r) {
                function n(e) {
                    return !!e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e);
                }
                t.exports = function (e) {
                    return null != e && (n(e) || ("function" == typeof (t = e).readFloatLE && "function" == typeof t.slice && n(t.slice(0, 0))) || !!e._isBuffer);
                    var t;
                };
            },
            {},
        ],
        54: [
            function (e, t, r) {
                "use strict";
                var n = e("cwise/lib/wrapper")({
                    args: ["index", "array", "scalar"],
                    pre: { body: "{}", args: [], thisVars: [], localVars: [] },
                    body: {
                        body: "{_inline_1_arg1_=_inline_1_arg2_.apply(void 0,_inline_1_arg0_)}",
                        args: [
                            { name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 1 },
                            { name: "_inline_1_arg1_", lvalue: !0, rvalue: !1, count: 1 },
                            { name: "_inline_1_arg2_", lvalue: !1, rvalue: !0, count: 1 },
                        ],
                        thisVars: [],
                        localVars: [],
                    },
                    post: { body: "{}", args: [], thisVars: [], localVars: [] },
                    debug: !1,
                    funcName: "cwise",
                    blockSize: 64,
                });
                t.exports = function (e, t) {
                    return n(e, t), e;
                };
            },
            { "cwise/lib/wrapper": 17 },
        ],
        55: [
            function (e, t, r) {
                "use strict";
                var i = e("cwise-compiler"),
                    n = { body: "", args: [], thisVars: [], localVars: [] };
                function o(e) {
                    if (!e) return n;
                    for (var t = 0; t < e.args.length; ++t) {
                        var r = e.args[t];
                        e.args[t] = 0 === t ? { name: r, lvalue: !0, rvalue: !!e.rvalue, count: e.count || 1 } : { name: r, lvalue: !1, rvalue: !0, count: 1 };
                    }
                    return e.thisVars || (e.thisVars = []), e.localVars || (e.localVars = []), e;
                }
                function a(e) {
                    for (var t, r = [], n = 0; n < e.args.length; ++n) r.push("a" + n);
                    return new Function("P", ["return function ", e.funcName, "_ndarrayops(", r.join(","), ") {P(", r.join(","), ");return a0}"].join(""))(
                        i({ args: (t = e).args, pre: o(t.pre), body: o(t.body), post: o(t.proc), funcName: t.funcName })
                    );
                }
                var s = { add: "+", sub: "-", mul: "*", div: "/", mod: "%", band: "&", bor: "|", bxor: "^", lshift: "<<", rshift: ">>", rrshift: ">>>" };
                !(function () {
                    for (var e in s) {
                        var t = s[e];
                        (r[e] = a({ args: ["array", "array", "array"], body: { args: ["a", "b", "c"], body: "a=b" + t + "c" }, funcName: e })),
                            (r[e + "eq"] = a({ args: ["array", "array"], body: { args: ["a", "b"], body: "a" + t + "=b" }, rvalue: !0, funcName: e + "eq" })),
                            (r[e + "s"] = a({ args: ["array", "array", "scalar"], body: { args: ["a", "b", "s"], body: "a=b" + t + "s" }, funcName: e + "s" })),
                            (r[e + "seq"] = a({ args: ["array", "scalar"], body: { args: ["a", "s"], body: "a" + t + "=s" }, rvalue: !0, funcName: e + "seq" }));
                    }
                })();
                var u = { not: "!", bnot: "~", neg: "-", recip: "1.0/" };
                !(function () {
                    for (var e in u) {
                        var t = u[e];
                        (r[e] = a({ args: ["array", "array"], body: { args: ["a", "b"], body: "a=" + t + "b" }, funcName: e })),
                            (r[e + "eq"] = a({ args: ["array"], body: { args: ["a"], body: "a=" + t + "a" }, rvalue: !0, count: 2, funcName: e + "eq" }));
                    }
                })();
                var f = { and: "&&", or: "||", eq: "===", neq: "!==", lt: "<", gt: ">", leq: "<=", geq: ">=" };
                !(function () {
                    for (var e in f) {
                        var t = f[e];
                        (r[e] = a({ args: ["array", "array", "array"], body: { args: ["a", "b", "c"], body: "a=b" + t + "c" }, funcName: e })),
                            (r[e + "s"] = a({ args: ["array", "array", "scalar"], body: { args: ["a", "b", "s"], body: "a=b" + t + "s" }, funcName: e + "s" })),
                            (r[e + "eq"] = a({ args: ["array", "array"], body: { args: ["a", "b"], body: "a=a" + t + "b" }, rvalue: !0, count: 2, funcName: e + "eq" })),
                            (r[e + "seq"] = a({ args: ["array", "scalar"], body: { args: ["a", "s"], body: "a=a" + t + "s" }, rvalue: !0, count: 2, funcName: e + "seq" }));
                    }
                })();
                var l = ["abs", "acos", "asin", "atan", "ceil", "cos", "exp", "floor", "log", "round", "sin", "sqrt", "tan"];
                !(function () {
                    for (var e = 0; e < l.length; ++e) {
                        var t = l[e];
                        (r[t] = a({ args: ["array", "array"], pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] }, body: { args: ["a", "b"], body: "a=this_f(b)", thisVars: ["this_f"] }, funcName: t })),
                            (r[t + "eq"] = a({
                                args: ["array"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a"], body: "a=this_f(a)", thisVars: ["this_f"] },
                                rvalue: !0,
                                count: 2,
                                funcName: t + "eq",
                            }));
                    }
                })();
                var h = ["max", "min", "atan2", "pow"];
                !(function () {
                    for (var e = 0; e < h.length; ++e) {
                        var t = h[e];
                        (r[t] = a({ args: ["array", "array", "array"], pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] }, body: { args: ["a", "b", "c"], body: "a=this_f(b,c)", thisVars: ["this_f"] }, funcName: t })),
                            (r[t + "s"] = a({
                                args: ["array", "array", "scalar"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a", "b", "c"], body: "a=this_f(b,c)", thisVars: ["this_f"] },
                                funcName: t + "s",
                            })),
                            (r[t + "eq"] = a({
                                args: ["array", "array"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a", "b"], body: "a=this_f(a,b)", thisVars: ["this_f"] },
                                rvalue: !0,
                                count: 2,
                                funcName: t + "eq",
                            })),
                            (r[t + "seq"] = a({
                                args: ["array", "scalar"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a", "b"], body: "a=this_f(a,b)", thisVars: ["this_f"] },
                                rvalue: !0,
                                count: 2,
                                funcName: t + "seq",
                            }));
                    }
                })();
                var c = ["atan2", "pow"];
                !(function () {
                    for (var e = 0; e < c.length; ++e) {
                        var t = c[e];
                        (r[t + "op"] = a({
                            args: ["array", "array", "array"],
                            pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                            body: { args: ["a", "b", "c"], body: "a=this_f(c,b)", thisVars: ["this_f"] },
                            funcName: t + "op",
                        })),
                            (r[t + "ops"] = a({
                                args: ["array", "array", "scalar"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a", "b", "c"], body: "a=this_f(c,b)", thisVars: ["this_f"] },
                                funcName: t + "ops",
                            })),
                            (r[t + "opeq"] = a({
                                args: ["array", "array"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a", "b"], body: "a=this_f(b,a)", thisVars: ["this_f"] },
                                rvalue: !0,
                                count: 2,
                                funcName: t + "opeq",
                            })),
                            (r[t + "opseq"] = a({
                                args: ["array", "scalar"],
                                pre: { args: [], body: "this_f=Math." + t, thisVars: ["this_f"] },
                                body: { args: ["a", "b"], body: "a=this_f(b,a)", thisVars: ["this_f"] },
                                rvalue: !0,
                                count: 2,
                                funcName: t + "opseq",
                            }));
                    }
                })(),
                    (r.any = i({
                        args: ["array"],
                        pre: n,
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 1 }], body: "if(a){return true}", localVars: [], thisVars: [] },
                        post: { args: [], localVars: [], thisVars: [], body: "return false" },
                        funcName: "any",
                    })),
                    (r.all = i({
                        args: ["array"],
                        pre: n,
                        body: { args: [{ name: "x", lvalue: !1, rvalue: !0, count: 1 }], body: "if(!x){return false}", localVars: [], thisVars: [] },
                        post: { args: [], localVars: [], thisVars: [], body: "return true" },
                        funcName: "all",
                    })),
                    (r.sum = i({
                        args: ["array"],
                        pre: { args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0" },
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 1 }], body: "this_s+=a", localVars: [], thisVars: ["this_s"] },
                        post: { args: [], localVars: [], thisVars: ["this_s"], body: "return this_s" },
                        funcName: "sum",
                    })),
                    (r.prod = i({
                        args: ["array"],
                        pre: { args: [], localVars: [], thisVars: ["this_s"], body: "this_s=1" },
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 1 }], body: "this_s*=a", localVars: [], thisVars: ["this_s"] },
                        post: { args: [], localVars: [], thisVars: ["this_s"], body: "return this_s" },
                        funcName: "prod",
                    })),
                    (r.norm2squared = i({
                        args: ["array"],
                        pre: { args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0" },
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 2 }], body: "this_s+=a*a", localVars: [], thisVars: ["this_s"] },
                        post: { args: [], localVars: [], thisVars: ["this_s"], body: "return this_s" },
                        funcName: "norm2squared",
                    })),
                    (r.norm2 = i({
                        args: ["array"],
                        pre: { args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0" },
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 2 }], body: "this_s+=a*a", localVars: [], thisVars: ["this_s"] },
                        post: { args: [], localVars: [], thisVars: ["this_s"], body: "return Math.sqrt(this_s)" },
                        funcName: "norm2",
                    })),
                    (r.norminf = i({
                        args: ["array"],
                        pre: { args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0" },
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 4 }], body: "if(-a>this_s){this_s=-a}else if(a>this_s){this_s=a}", localVars: [], thisVars: ["this_s"] },
                        post: { args: [], localVars: [], thisVars: ["this_s"], body: "return this_s" },
                        funcName: "norminf",
                    })),
                    (r.norm1 = i({
                        args: ["array"],
                        pre: { args: [], localVars: [], thisVars: ["this_s"], body: "this_s=0" },
                        body: { args: [{ name: "a", lvalue: !1, rvalue: !0, count: 3 }], body: "this_s+=a<0?-a:a", localVars: [], thisVars: ["this_s"] },
                        post: { args: [], localVars: [], thisVars: ["this_s"], body: "return this_s" },
                        funcName: "norm1",
                    })),
                    (r.sup = i({
                        args: ["array"],
                        pre: { body: "this_h=-Infinity", args: [], thisVars: ["this_h"], localVars: [] },
                        body: { body: "if(_inline_1_arg0_>this_h)this_h=_inline_1_arg0_", args: [{ name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2 }], thisVars: ["this_h"], localVars: [] },
                        post: { body: "return this_h", args: [], thisVars: ["this_h"], localVars: [] },
                    })),
                    (r.inf = i({
                        args: ["array"],
                        pre: { body: "this_h=Infinity", args: [], thisVars: ["this_h"], localVars: [] },
                        body: { body: "if(_inline_1_arg0_<this_h)this_h=_inline_1_arg0_", args: [{ name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2 }], thisVars: ["this_h"], localVars: [] },
                        post: { body: "return this_h", args: [], thisVars: ["this_h"], localVars: [] },
                    })),
                    (r.argmin = i({
                        args: ["index", "array", "shape"],
                        pre: {
                            body: "{this_v=Infinity;this_i=_inline_0_arg2_.slice(0)}",
                            args: [
                                { name: "_inline_0_arg0_", lvalue: !1, rvalue: !1, count: 0 },
                                { name: "_inline_0_arg1_", lvalue: !1, rvalue: !1, count: 0 },
                                { name: "_inline_0_arg2_", lvalue: !1, rvalue: !0, count: 1 },
                            ],
                            thisVars: ["this_i", "this_v"],
                            localVars: [],
                        },
                        body: {
                            body: "{if(_inline_1_arg1_<this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
                            args: [
                                { name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2 },
                                { name: "_inline_1_arg1_", lvalue: !1, rvalue: !0, count: 2 },
                            ],
                            thisVars: ["this_i", "this_v"],
                            localVars: ["_inline_1_k"],
                        },
                        post: { body: "{return this_i}", args: [], thisVars: ["this_i"], localVars: [] },
                    })),
                    (r.argmax = i({
                        args: ["index", "array", "shape"],
                        pre: {
                            body: "{this_v=-Infinity;this_i=_inline_0_arg2_.slice(0)}",
                            args: [
                                { name: "_inline_0_arg0_", lvalue: !1, rvalue: !1, count: 0 },
                                { name: "_inline_0_arg1_", lvalue: !1, rvalue: !1, count: 0 },
                                { name: "_inline_0_arg2_", lvalue: !1, rvalue: !0, count: 1 },
                            ],
                            thisVars: ["this_i", "this_v"],
                            localVars: [],
                        },
                        body: {
                            body: "{if(_inline_1_arg1_>this_v){this_v=_inline_1_arg1_;for(var _inline_1_k=0;_inline_1_k<_inline_1_arg0_.length;++_inline_1_k){this_i[_inline_1_k]=_inline_1_arg0_[_inline_1_k]}}}",
                            args: [
                                { name: "_inline_1_arg0_", lvalue: !1, rvalue: !0, count: 2 },
                                { name: "_inline_1_arg1_", lvalue: !1, rvalue: !0, count: 2 },
                            ],
                            thisVars: ["this_i", "this_v"],
                            localVars: ["_inline_1_k"],
                        },
                        post: { body: "{return this_i}", args: [], thisVars: ["this_i"], localVars: [] },
                    })),
                    (r.random = a({ args: ["array"], pre: { args: [], body: "this_f=Math.random", thisVars: ["this_f"] }, body: { args: ["a"], body: "a=this_f()", thisVars: ["this_f"] }, funcName: "random" })),
                    (r.assign = a({ args: ["array", "array"], body: { args: ["a", "b"], body: "a=b" }, funcName: "assign" })),
                    (r.assigns = a({ args: ["array", "scalar"], body: { args: ["a", "b"], body: "a=b" }, funcName: "assigns" })),
                    (r.equals = i({
                        args: ["array", "array"],
                        pre: n,
                        body: {
                            args: [
                                { name: "x", lvalue: !1, rvalue: !0, count: 1 },
                                { name: "y", lvalue: !1, rvalue: !0, count: 1 },
                            ],
                            body: "if(x!==y){return false}",
                            localVars: [],
                            thisVars: [],
                        },
                        post: { args: [], localVars: [], thisVars: [], body: "return true" },
                        funcName: "equals",
                    }));
            },
            { "cwise-compiler": 14 },
        ],
        56: [
            function (e, t, r) {
                var p = e("iota-array"),
                    f = e("is-buffer"),
                    l = "undefined" != typeof Float64Array;
                function i(e, t) {
                    return e[0] - t[0];
                }
                function d() {
                    for (var e = this.stride, t = new Array(e.length), r = 0; r < t.length; ++r) t[r] = [Math.abs(e[r]), r];
                    t.sort(i);
                    var n = new Array(t.length);
                    for (r = 0; r < n.length; ++r) n[r] = t[r][1];
                    return n;
                }
                function h(e, t) {
                    var r = ["View", t, "d", e].join("");
                    t < 0 && (r = "View_Nil" + e);
                    var n = "generic" === e;
                    if (-1 === t) {
                        var i =
                            "function " +
                            r +
                            "(a){this.data=a;};var proto=" +
                            r +
                            ".prototype;proto.dtype='" +
                            e +
                            "';proto.index=function(){return -1};proto.size=0;proto.dimension=-1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function(){return new " +
                            r +
                            "(this.data);};proto.get=proto.set=function(){};proto.pick=function(){return null};return function construct_" +
                            r +
                            "(a){return new " +
                            r +
                            "(a);}";
                        return new Function(i)();
                    }
                    if (0 === t) {
                        i =
                            "function " +
                            r +
                            "(a,d) {this.data = a;this.offset = d};var proto=" +
                            r +
                            ".prototype;proto.dtype='" +
                            e +
                            "';proto.index=function(){return this.offset};proto.dimension=0;proto.size=1;proto.shape=proto.stride=proto.order=[];proto.lo=proto.hi=proto.transpose=proto.step=function " +
                            r +
                            "_copy() {return new " +
                            r +
                            "(this.data,this.offset)};proto.pick=function " +
                            r +
                            "_pick(){return TrivialArray(this.data);};proto.valueOf=proto.get=function " +
                            r +
                            "_get(){return " +
                            (n ? "this.data.get(this.offset)" : "this.data[this.offset]") +
                            "};proto.set=function " +
                            r +
                            "_set(v){return " +
                            (n ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v") +
                            "};return function construct_" +
                            r +
                            "(a,b,c,d){return new " +
                            r +
                            "(a,d)}";
                        return new Function("TrivialArray", i)(g[e][0]);
                    }
                    var i = ["'use strict'"],
                        o = p(t),
                        a = o.map(function (e) {
                            return "i" + e;
                        }),
                        s =
                            "this.offset+" +
                            o
                                .map(function (e) {
                                    return "this.stride[" + e + "]*i" + e;
                                })
                                .join("+"),
                        u = o
                            .map(function (e) {
                                return "b" + e;
                            })
                            .join(","),
                        f = o
                            .map(function (e) {
                                return "c" + e;
                            })
                            .join(",");
                    i.push(
                        "function " + r + "(a," + u + "," + f + ",d){this.data=a",
                        "this.shape=[" + u + "]",
                        "this.stride=[" + f + "]",
                        "this.offset=d|0}",
                        "var proto=" + r + ".prototype",
                        "proto.dtype='" + e + "'",
                        "proto.dimension=" + t
                    ),
                        i.push(
                            "Object.defineProperty(proto,'size',{get:function " +
                                r +
                                "_size(){return " +
                                o
                                    .map(function (e) {
                                        return "this.shape[" + e + "]";
                                    })
                                    .join("*"),
                            "}})"
                        ),
                        1 === t
                            ? i.push("proto.order=[0]")
                            : (i.push("Object.defineProperty(proto,'order',{get:"),
                              t < 4
                                  ? (i.push("function " + r + "_order(){"),
                                    2 === t
                                        ? i.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})")
                                        : 3 === t &&
                                          i.push(
                                              "var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);if(s0>s1){if(s1>s2){return [2,1,0];}else if(s0>s2){return [1,2,0];}else{return [1,0,2];}}else if(s0>s2){return [2,0,1];}else if(s2>s1){return [0,1,2];}else{return [0,2,1];}}})"
                                          ))
                                  : i.push("ORDER})")),
                        i.push("proto.set=function " + r + "_set(" + a.join(",") + ",v){"),
                        n ? i.push("return this.data.set(" + s + ",v)}") : i.push("return this.data[" + s + "]=v}"),
                        i.push("proto.get=function " + r + "_get(" + a.join(",") + "){"),
                        n ? i.push("return this.data.get(" + s + ")}") : i.push("return this.data[" + s + "]}"),
                        i.push("proto.index=function " + r + "_index(", a.join(), "){return " + s + "}"),
                        i.push(
                            "proto.hi=function " +
                                r +
                                "_hi(" +
                                a.join(",") +
                                "){return new " +
                                r +
                                "(this.data," +
                                o
                                    .map(function (e) {
                                        return ["(typeof i", e, "!=='number'||i", e, "<0)?this.shape[", e, "]:i", e, "|0"].join("");
                                    })
                                    .join(",") +
                                "," +
                                o
                                    .map(function (e) {
                                        return "this.stride[" + e + "]";
                                    })
                                    .join(",") +
                                ",this.offset)}"
                        );
                    (n = o.map(function (e) {
                        return "a" + e + "=this.shape[" + e + "]";
                    })),
                        (s = o.map(function (e) {
                            return "c" + e + "=this.stride[" + e + "]";
                        }));
                    i.push("proto.lo=function " + r + "_lo(" + a.join(",") + "){var b=this.offset,d=0," + n.join(",") + "," + s.join(","));
                    for (var l = 0; l < t; ++l) i.push("if(typeof i" + l + "==='number'&&i" + l + ">=0){d=i" + l + "|0;b+=c" + l + "*d;a" + l + "-=d}");
                    i.push(
                        "return new " +
                            r +
                            "(this.data," +
                            o
                                .map(function (e) {
                                    return "a" + e;
                                })
                                .join(",") +
                            "," +
                            o
                                .map(function (e) {
                                    return "c" + e;
                                })
                                .join(",") +
                            ",b)}"
                    ),
                        i.push(
                            "proto.step=function " +
                                r +
                                "_step(" +
                                a.join(",") +
                                "){var " +
                                o
                                    .map(function (e) {
                                        return "a" + e + "=this.shape[" + e + "]";
                                    })
                                    .join(",") +
                                "," +
                                o
                                    .map(function (e) {
                                        return "b" + e + "=this.stride[" + e + "]";
                                    })
                                    .join(",") +
                                ",c=this.offset,d=0,ceil=Math.ceil"
                        );
                    for (l = 0; l < t; ++l) i.push("if(typeof i" + l + "==='number'){d=i" + l + "|0;if(d<0){c+=b" + l + "*(a" + l + "-1);a" + l + "=ceil(-a" + l + "/d)}else{a" + l + "=ceil(a" + l + "/d)}b" + l + "*=d}");
                    i.push(
                        "return new " +
                            r +
                            "(this.data," +
                            o
                                .map(function (e) {
                                    return "a" + e;
                                })
                                .join(",") +
                            "," +
                            o
                                .map(function (e) {
                                    return "b" + e;
                                })
                                .join(",") +
                            ",c)}"
                    );
                    for (var h = new Array(t), c = new Array(t), l = 0; l < t; ++l) (h[l] = "a[i" + l + "]"), (c[l] = "b[i" + l + "]");
                    i.push(
                        "proto.transpose=function " +
                            r +
                            "_transpose(" +
                            a +
                            "){" +
                            a
                                .map(function (e, t) {
                                    return e + "=(" + e + "===undefined?" + t + ":" + e + "|0)";
                                })
                                .join(";"),
                        "var a=this.shape,b=this.stride;return new " + r + "(this.data," + h.join(",") + "," + c.join(",") + ",this.offset)}"
                    ),
                        i.push("proto.pick=function " + r + "_pick(" + a + "){var a=[],b=[],c=this.offset");
                    for (l = 0; l < t; ++l) i.push("if(typeof i" + l + "==='number'&&i" + l + ">=0){c=(c+this.stride[" + l + "]*i" + l + ")|0}else{a.push(this.shape[" + l + "]);b.push(this.stride[" + l + "])}");
                    return (
                        i.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}"),
                        i.push(
                            "return function construct_" +
                                r +
                                "(data,shape,stride,offset){return new " +
                                r +
                                "(data," +
                                o
                                    .map(function (e) {
                                        return "shape[" + e + "]";
                                    })
                                    .join(",") +
                                "," +
                                o
                                    .map(function (e) {
                                        return "stride[" + e + "]";
                                    })
                                    .join(",") +
                                ",offset)}"
                        ),
                        new Function("CTOR_LIST", "ORDER", i.join("\n"))(g[e], d)
                    );
                }
                var g = { float32: [], float64: [], int8: [], int16: [], int32: [], uint8: [], uint16: [], uint32: [], array: [], uint8_clamped: [], bigint64: [], biguint64: [], buffer: [], generic: [] };
                t.exports = function (e, t, r, n) {
                    if (void 0 === e) return (0, g.array[0])([]);
                    "number" == typeof e && (e = [e]);
                    var i = (t = void 0 === t ? [e.length] : t).length;
                    if (void 0 === r) {
                        r = new Array(i);
                        for (var o = i - 1, a = 1; 0 <= o; --o) (r[o] = a), (a *= t[o]);
                    }
                    if (void 0 === n) for (o = n = 0; o < i; ++o) r[o] < 0 && (n -= (t[o] - 1) * r[o]);
                    for (
                        var s = (function (e) {
                                if (f(e)) return "buffer";
                                if (l)
                                    switch (Object.prototype.toString.call(e)) {
                                        case "[object Float64Array]":
                                            return "float64";
                                        case "[object Float32Array]":
                                            return "float32";
                                        case "[object Int8Array]":
                                            return "int8";
                                        case "[object Int16Array]":
                                            return "int16";
                                        case "[object Int32Array]":
                                            return "int32";
                                        case "[object Uint8Array]":
                                            return "uint8";
                                        case "[object Uint16Array]":
                                            return "uint16";
                                        case "[object Uint32Array]":
                                            return "uint32";
                                        case "[object Uint8ClampedArray]":
                                            return "uint8_clamped";
                                        case "[object BigInt64Array]":
                                            return "bigint64";
                                        case "[object BigUint64Array]":
                                            return "biguint64";
                                    }
                                return Array.isArray(e) ? "array" : "generic";
                            })(e),
                            u = g[s];
                        u.length <= i + 1;

                    )
                        u.push(h(s, u.length - 1));
                    return (0, u[i + 1])(e, t, r, n);
                };
            },
            { "iota-array": 52, "is-buffer": 53 },
        ],
        57: [
            function (e, t, r) {
                "use strict";
                var u = Object.getOwnPropertySymbols,
                    f = Object.prototype.hasOwnProperty,
                    l = Object.prototype.propertyIsEnumerable;
                t.exports = (function () {
                    try {
                        if (!Object.assign) return;
                        var e = new String("abc");
                        if (((e[5] = "de"), "5" === Object.getOwnPropertyNames(e)[0])) return;
                        for (var t = {}, r = 0; r < 10; r++) t["_" + String.fromCharCode(r)] = r;
                        if (
                            "0123456789" !==
                            Object.getOwnPropertyNames(t)
                                .map(function (e) {
                                    return t[e];
                                })
                                .join("")
                        )
                            return;
                        var n = {};
                        return (
                            "abcdefghijklmnopqrst".split("").forEach(function (e) {
                                n[e] = e;
                            }),
                            "abcdefghijklmnopqrst" !== Object.keys(Object.assign({}, n)).join("") ? void 0 : 1
                        );
                    } catch (e) {
                        return;
                    }
                })()
                    ? Object.assign
                    : function (e, t) {
                          for (
                              var r,
                                  n = (function (e) {
                                      if (null == e) throw new TypeError("Object.assign cannot be called with null or undefined");
                                      return Object(e);
                                  })(e),
                                  i = 1;
                              i < arguments.length;
                              i++
                          ) {
                              for (var o in (r = Object(arguments[i]))) f.call(r, o) && (n[o] = r[o]);
                              if (u) for (var a = u(r), s = 0; s < a.length; s++) l.call(r, a[s]) && (n[a[s]] = r[a[s]]);
                          }
                          return n;
                      };
            },
            {},
        ],
        58: [
            function (e, s, t) {
                !function (a) {
                    !function () {
                        !function () {
                            var e, t, r, n, i, o;
                            "undefined" != typeof performance && null !== performance && performance.now
                                ? (s.exports = function () {
                                      return performance.now();
                                  })
                                : null != a && a.hrtime
                                ? ((s.exports = function () {
                                      return (e() - i) / 1e6;
                                  }),
                                  (t = a.hrtime),
                                  (n = (e = function () {
                                      var e = t();
                                      return 1e9 * e[0] + e[1];
                                  })()),
                                  (o = 1e9 * a.uptime()),
                                  (i = n - o))
                                : (r = Date.now
                                      ? ((s.exports = function () {
                                            return Date.now() - r;
                                        }),
                                        Date.now())
                                      : ((s.exports = function () {
                                            return new Date().getTime() - r;
                                        }),
                                        new Date().getTime()));
                        }.call(this);
                    }.call(this);
                }.call(this, e("_process"));
            },
            { _process: 59 },
        ],
        59: [
            function (e, t, r) {
                var n,
                    i,
                    t = (t.exports = {});
                function o() {
                    throw new Error("setTimeout has not been defined");
                }
                function a() {
                    throw new Error("clearTimeout has not been defined");
                }
                function s(t) {
                    if (n === setTimeout) return setTimeout(t, 0);
                    if ((n === o || !n) && setTimeout) return (n = setTimeout), setTimeout(t, 0);
                    try {
                        return n(t, 0);
                    } catch (e) {
                        try {
                            return n.call(null, t, 0);
                        } catch (e) {
                            return n.call(this, t, 0);
                        }
                    }
                }
                !(function () {
                    try {
                        n = "function" == typeof setTimeout ? setTimeout : o;
                    } catch (e) {
                        n = o;
                    }
                    try {
                        i = "function" == typeof clearTimeout ? clearTimeout : a;
                    } catch (e) {
                        i = a;
                    }
                })();
                var u,
                    f = [],
                    l = !1,
                    h = -1;
                function c() {
                    l && u && ((l = !1), u.length ? (f = u.concat(f)) : (h = -1), f.length && p());
                }
                function p() {
                    if (!l) {
                        var e = s(c);
                        l = !0;
                        for (var t = f.length; t; ) {
                            for (u = f, f = []; ++h < t; ) u && u[h].run();
                            (h = -1), (t = f.length);
                        }
                        (u = null),
                            (l = !1),
                            (function (t) {
                                if (i === clearTimeout) return clearTimeout(t);
                                if ((i === a || !i) && clearTimeout) return (i = clearTimeout), clearTimeout(t);
                                try {
                                    i(t);
                                } catch (e) {
                                    try {
                                        return i.call(null, t);
                                    } catch (e) {
                                        return i.call(this, t);
                                    }
                                }
                            })(e);
                    }
                }
                function d(e, t) {
                    (this.fun = e), (this.array = t);
                }
                function g() {}
                (t.nextTick = function (e) {
                    var t = new Array(arguments.length - 1);
                    if (1 < arguments.length) for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
                    f.push(new d(e, t)), 1 !== f.length || l || s(p);
                }),
                    (d.prototype.run = function () {
                        this.fun.apply(null, this.array);
                    }),
                    (t.title = "browser"),
                    (t.browser = !0),
                    (t.env = {}),
                    (t.argv = []),
                    (t.version = ""),
                    (t.versions = {}),
                    (t.on = g),
                    (t.addListener = g),
                    (t.once = g),
                    (t.off = g),
                    (t.removeListener = g),
                    (t.removeAllListeners = g),
                    (t.emit = g),
                    (t.prependListener = g),
                    (t.prependOnceListener = g),
                    (t.listeners = function (e) {
                        return [];
                    }),
                    (t.binding = function (e) {
                        throw new Error("process.binding is not supported");
                    }),
                    (t.cwd = function () {
                        return "/";
                    }),
                    (t.chdir = function (e) {
                        throw new Error("process.chdir is not supported");
                    }),
                    (t.umask = function () {
                        return 0;
                    });
            },
            {},
        ],
        60: [
            function (e, t, r) {
                var n = e("inherits"),
                    i = e("events").EventEmitter,
                    o = e("right-now"),
                    a = e("raf");
                function s(e) {
                    if (!(this instanceof s)) return new s(e);
                    (this.running = !1), (this.last = o()), (this._frame = 0), (this._tick = this.tick.bind(this)), e && this.on("tick", e);
                }
                n((t.exports = s), i),
                    (s.prototype.start = function () {
                        if (!this.running) return (this.running = !0), (this.last = o()), (this._frame = a(this._tick)), this;
                    }),
                    (s.prototype.stop = function () {
                        return (this.running = !1), 0 !== this._frame && a.cancel(this._frame), (this._frame = 0), this;
                    }),
                    (s.prototype.tick = function () {
                        this._frame = a(this._tick);
                        var e = o(),
                            t = e - this.last;
                        this.emit("tick", t), (this.last = e);
                    });
            },
            { events: 20, inherits: 51, raf: 61, "right-now": 63 },
        ],
        61: [
            function (h, c, e) {
                !function (l) {
                    !function () {
                        for (
                            var n, i, o, a = h("performance-now"), t = "undefined" == typeof window ? l : window, e = ["moz", "webkit"], r = "AnimationFrame", s = t["request" + r], u = t["cancel" + r] || t["cancelRequest" + r], f = 0;
                            !s && f < e.length;
                            f++
                        )
                            (s = t[e[f] + "Request" + r]), (u = t[e[f] + "Cancel" + r] || t[e[f] + "CancelRequest" + r]);
                        (s && u) ||
                            ((i = n = 0),
                            (o = []),
                            (s = function (e) {
                                var t, r;
                                return (
                                    0 === o.length &&
                                        ((t = a()),
                                        (r = Math.max(0, 1e3 / 60 - (t - n))),
                                        (n = r + t),
                                        setTimeout(function () {
                                            for (var e = o.slice(0), t = (o.length = 0); t < e.length; t++)
                                                if (!e[t].cancelled)
                                                    try {
                                                        e[t].callback(n);
                                                    } catch (e) {
                                                        setTimeout(function () {
                                                            throw e;
                                                        }, 0);
                                                    }
                                        }, Math.round(r))),
                                    o.push({ handle: ++i, callback: e, cancelled: !1 }),
                                    i
                                );
                            }),
                            (u = function (e) {
                                for (var t = 0; t < o.length; t++) o[t].handle === e && (o[t].cancelled = !0);
                            })),
                            (c.exports = function (e) {
                                return s.call(t, e);
                            }),
                            (c.exports.cancel = function () {
                                u.apply(t, arguments);
                            }),
                            (c.exports.polyfill = function (e) {
                                ((e = e || t).requestAnimationFrame = s), (e.cancelAnimationFrame = u);
                            });
                    }.call(this);
                }.call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
            },
            { "performance-now": 58 },
        ],
        62: [
            function (e, t, r) {
                "use strict";
                var n,
                    i = "";
                t.exports = function (e, t) {
                    if ("string" != typeof e) throw new TypeError("expected a string");
                    if (1 === t) return e;
                    if (2 === t) return e + e;
                    var r = e.length * t;
                    if (n !== e || void 0 === n) (n = e), (i = "");
                    else if (i.length >= r) return i.substr(0, r);
                    for (; r > i.length && 1 < t; ) 1 & t && (i += e), (t >>= 1), (e += e);
                    return (i = (i += e).substr(0, r));
                };
            },
            {},
        ],
        63: [
            function (e, t, r) {
                !function (e) {
                    !function () {
                        t.exports =
                            e.performance && e.performance.now
                                ? function () {
                                      return performance.now();
                                  }
                                : Date.now ||
                                  function () {
                                      return +new Date();
                                  };
                    }.call(this);
                }.call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
            },
            {},
        ],
        64: [
            function (e, t, r) {
                "use strict";
                const n = (
                    (this && this.__importDefault) ||
                    function (e) {
                        return e && e.__esModule ? e : { default: e };
                    }
                )(e("./simplex-noise.js"));
                (n.default.SimplexNoise = n.default), (t.exports = n.default);
            },
            { "./simplex-noise.js": 65 },
        ],
        65: [
            function (e, t, r) {
                "use strict";
                Object.defineProperty(r, "__esModule", { value: !0 }), (r.buildPermutationTable = r.SimplexNoise = void 0);
                const E = 0.5 * (Math.sqrt(3) - 1),
                    y = (3 - Math.sqrt(3)) / 6,
                    M = 1 / 6,
                    z = (Math.sqrt(5) - 1) / 4,
                    K = (5 - Math.sqrt(5)) / 20,
                    U = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]),
                    Z = new Float32Array([
                        0,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        -1,
                        0,
                        1,
                        -1,
                        1,
                        0,
                        1,
                        -1,
                        -1,
                        0,
                        -1,
                        1,
                        1,
                        0,
                        -1,
                        1,
                        -1,
                        0,
                        -1,
                        -1,
                        1,
                        0,
                        -1,
                        -1,
                        -1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        0,
                        1,
                        -1,
                        1,
                        0,
                        -1,
                        1,
                        1,
                        0,
                        -1,
                        -1,
                        -1,
                        0,
                        1,
                        1,
                        -1,
                        0,
                        1,
                        -1,
                        -1,
                        0,
                        -1,
                        1,
                        -1,
                        0,
                        -1,
                        -1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        1,
                        0,
                        -1,
                        1,
                        -1,
                        0,
                        1,
                        1,
                        -1,
                        0,
                        -1,
                        -1,
                        1,
                        0,
                        1,
                        -1,
                        1,
                        0,
                        -1,
                        -1,
                        -1,
                        0,
                        1,
                        -1,
                        -1,
                        0,
                        -1,
                        1,
                        1,
                        1,
                        0,
                        1,
                        1,
                        -1,
                        0,
                        1,
                        -1,
                        1,
                        0,
                        1,
                        -1,
                        -1,
                        0,
                        -1,
                        1,
                        1,
                        0,
                        -1,
                        1,
                        -1,
                        0,
                        -1,
                        -1,
                        1,
                        0,
                        -1,
                        -1,
                        -1,
                        0,
                    ]);
                class n {
                    constructor(e = Math.random) {
                        e =
                            "function" == typeof e
                                ? e
                                : (function (e) {
                                      let t = 0,
                                          r = 0,
                                          n = 0,
                                          i = 1;
                                      const o = (function () {
                                          let n = 4022871197;
                                          return function (t) {
                                              t = t.toString();
                                              for (let e = 0; e < t.length; e++) {
                                                  n += t.charCodeAt(e);
                                                  var r = 0.02519603282416938 * n;
                                                  (n = r >>> 0), (r -= n), (r *= n), (n = r >>> 0), (r -= n), (n += 4294967296 * r);
                                              }
                                              return 2.3283064365386963e-10 * (n >>> 0);
                                          };
                                      })();
                                      (t = o(" ")), (r = o(" ")), (n = o(" ")), (t -= o(e)), t < 0 && (t += 1);
                                      (r -= o(e)), r < 0 && (r += 1);
                                      (n -= o(e)), n < 0 && (n += 1);
                                      return function () {
                                          var e = 2091639 * t + 2.3283064365386963e-10 * i;
                                          return (t = r), (r = n), (n = e - (i = 0 | e));
                                      };
                                  })(e);
                        (this.p = i(e)), (this.perm = new Uint8Array(512)), (this.permMod12 = new Uint8Array(512));
                        for (let e = 0; e < 512; e++) (this.perm[e] = this.p[255 & e]), (this.permMod12[e] = this.perm[e] % 12);
                    }
                    noise2D(e, t) {
                        var r = this.permMod12,
                            n = this.perm;
                        let i = 0,
                            o = 0,
                            a = 0;
                        var s = (e + t) * E,
                            u = Math.floor(e + s),
                            f = Math.floor(t + s),
                            l = (u + f) * y,
                            h = e - (u - l),
                            c = t - (f - l);
                        let p, d;
                        d = c < h ? ((p = 1), 0) : ((p = 0), 1);
                        var g = h - p + y,
                            s = c - d + y,
                            e = h - 1 + 2 * y,
                            t = c - 1 + 2 * y,
                            l = 255 & u,
                            u = 255 & f,
                            f = 0.5 - h * h - c * c;
                        0 <= f && ((_ = 3 * r[l + n[u]]), (f *= f), (i = f * f * (U[_] * h + U[1 + _] * c)));
                        var _ = 0.5 - g * g - s * s;
                        0 <= _ && ((c = 3 * r[l + p + n[u + d]]), (_ *= _), (o = _ * _ * (U[c] * g + U[1 + c] * s)));
                        s = 0.5 - e * e - t * t;
                        return 0 <= s && ((u = 3 * r[1 + l + n[1 + u]]), (s *= s), (a = s * s * (U[u] * e + U[1 + u] * t))), 70 * (i + o + a);
                    }
                    noise3D(e, t, r) {
                        var n = this.permMod12,
                            i = this.perm;
                        let o, a, s, u;
                        var f = (e + t + r) * (1 / 3),
                            l = Math.floor(e + f),
                            h = Math.floor(t + f),
                            c = Math.floor(r + f),
                            p = (l + h + c) * M,
                            d = e - (l - p),
                            g = t - (h - p),
                            _ = r - (c - p);
                        let E, y, m, v, b, T;
                        T =
                            g <= d
                                ? _ <= g
                                    ? ((E = 1), (y = 0), (m = 0), (v = 1), (b = 1), 0)
                                    : ((b = ((v = ((m = _ <= d ? ((E = 1), (y = 0)) : ((E = 0), (y = 0), 1)), 1)), 0)), 1)
                                : g < _
                                ? ((E = 0), (y = 0), (m = 1), (v = 0), (b = 1))
                                : d < _
                                ? ((E = 0), (y = 1), (m = 0), (v = 0), (b = 1))
                                : ((E = 0), (y = 1), (m = 0), (v = 1), (b = 1), 0);
                        var A = d - E + M,
                            w = g - y + M,
                            R = _ - m + M,
                            x = d - v + 2 * M,
                            I = g - b + 2 * M,
                            N = _ - T + 2 * M,
                            f = d - 1 + 0.5,
                            e = g - 1 + 0.5,
                            t = _ - 1 + 0.5,
                            r = 255 & l,
                            p = 255 & h,
                            l = 255 & c,
                            h = 0.6 - d * d - g * g - _ * _;
                        o = h < 0 ? 0 : ((c = 3 * n[r + i[p + i[l]]]), (h *= h) * h * (U[c] * d + U[1 + c] * g + U[2 + c] * _));
                        _ = 0.6 - A * A - w * w - R * R;
                        a = _ < 0 ? 0 : ((S = 3 * n[r + E + i[p + y + i[l + m]]]), (_ *= _) * _ * (U[S] * A + U[1 + S] * w + U[2 + S] * R));
                        var S = 0.6 - x * x - I * I - N * N;
                        s = S < 0 ? 0 : ((R = 3 * n[r + v + i[p + b + i[l + T]]]), (S *= S) * S * (U[R] * x + U[1 + R] * I + U[2 + R] * N));
                        N = 0.6 - f * f - e * e - t * t;
                        return (u = N < 0 ? 0 : ((l = 3 * n[1 + r + i[1 + p + i[1 + l]]]), (N *= N) * N * (U[l] * f + U[1 + l] * e + U[2 + l] * t))), 32 * (o + a + s + u);
                    }
                    noise4D(e, t, r, n) {
                        var i = this.perm;
                        let o, a, s, u, f;
                        var l = (e + t + r + n) * z,
                            h = Math.floor(e + l),
                            c = Math.floor(t + l),
                            p = Math.floor(r + l),
                            d = Math.floor(n + l),
                            g = (h + c + p + d) * K,
                            _ = e - (h - g),
                            E = t - (c - g),
                            y = r - (p - g),
                            m = n - (d - g);
                        let v = 0,
                            b = 0,
                            T = 0,
                            A = 0;
                        E < _ ? v++ : b++, y < _ ? v++ : T++, m < _ ? v++ : A++, y < E ? b++ : T++, m < E ? b++ : A++, m < y ? T++ : A++;
                        var w = 3 <= v ? 1 : 0,
                            R = 3 <= b ? 1 : 0,
                            x = 3 <= T ? 1 : 0,
                            I = 3 <= A ? 1 : 0,
                            N = 2 <= v ? 1 : 0,
                            S = 2 <= b ? 1 : 0,
                            M = 2 <= T ? 1 : 0,
                            U = 2 <= A ? 1 : 0,
                            L = 1 <= v ? 1 : 0,
                            F = 1 <= b ? 1 : 0,
                            C = 1 <= T ? 1 : 0,
                            O = 1 <= A ? 1 : 0,
                            P = _ - w + K,
                            B = E - R + K,
                            D = y - x + K,
                            j = m - I + K,
                            V = _ - N + 2 * K,
                            k = E - S + 2 * K,
                            X = y - M + 2 * K,
                            G = m - U + 2 * K,
                            H = _ - L + 3 * K,
                            q = E - F + 3 * K,
                            Y = y - C + 3 * K,
                            W = m - O + 3 * K,
                            l = _ - 1 + 4 * K,
                            e = E - 1 + 4 * K,
                            t = y - 1 + 4 * K,
                            r = m - 1 + 4 * K,
                            n = 255 & h,
                            g = 255 & c,
                            h = 255 & p,
                            c = 255 & d,
                            p = 0.6 - _ * _ - E * E - y * y - m * m;
                        o = p < 0 ? 0 : ((d = (i[n + i[g + i[h + i[c]]]] % 32) * 4), (p *= p) * p * (Z[d] * _ + Z[1 + d] * E + Z[2 + d] * y + Z[3 + d] * m));
                        m = 0.6 - P * P - B * B - D * D - j * j;
                        a = m < 0 ? 0 : ((I = (i[n + w + i[g + R + i[h + x + i[c + I]]]] % 32) * 4), (m *= m) * m * (Z[I] * P + Z[1 + I] * B + Z[2 + I] * D + Z[3 + I] * j));
                        j = 0.6 - V * V - k * k - X * X - G * G;
                        s = j < 0 ? 0 : ((U = (i[n + N + i[g + S + i[h + M + i[c + U]]]] % 32) * 4), (j *= j) * j * (Z[U] * V + Z[1 + U] * k + Z[2 + U] * X + Z[3 + U] * G));
                        G = 0.6 - H * H - q * q - Y * Y - W * W;
                        u = G < 0 ? 0 : ((O = (i[n + L + i[g + F + i[h + C + i[c + O]]]] % 32) * 4), (G *= G) * G * (Z[O] * H + Z[1 + O] * q + Z[2 + O] * Y + Z[3 + O] * W));
                        W = 0.6 - l * l - e * e - t * t - r * r;
                        return (f = W < 0 ? 0 : ((c = (i[1 + n + i[1 + g + i[1 + h + i[1 + c]]]] % 32) * 4), (W *= W) * W * (Z[c] * l + Z[1 + c] * e + Z[2 + c] * t + Z[3 + c] * r))), 27 * (o + a + s + u + f);
                    }
                }
                function i(t) {
                    const r = new Uint8Array(256);
                    for (let e = 0; e < 256; e++) r[e] = e;
                    for (let e = 0; e < 255; e++) {
                        var n = e + ~~(t() * (256 - e)),
                            i = r[e];
                        (r[e] = r[n]), (r[n] = i);
                    }
                    return r;
                }
                (r.SimplexNoise = n), (r.default = n), (r.buildPermutationTable = i);
            },
            {},
        ],
        66: [
            function (e, t, r) {
                !(function () {
                    "use strict";
                    var p = {
                        not_string: /[^s]/,
                        not_bool: /[^t]/,
                        not_type: /[^T]/,
                        not_primitive: /[^v]/,
                        number: /[diefg]/,
                        numeric_arg: /[bcdiefguxX]/,
                        json: /[j]/,
                        not_json: /[^j]/,
                        text: /^[^\x25]+/,
                        modulo: /^\x25{2}/,
                        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
                        key: /^([a-z_][a-z_\d]*)/i,
                        key_access: /^\.([a-z_][a-z_\d]*)/i,
                        index_access: /^\[(\d+)\]/,
                        sign: /^[+-]/,
                    };
                    function d(e) {
                        return (function (e, t) {
                            var r,
                                n,
                                i,
                                o,
                                a,
                                s,
                                u,
                                f,
                                l = 1,
                                h = e.length,
                                c = "";
                            for (n = 0; n < h; n++)
                                if ("string" == typeof e[n]) c += e[n];
                                else if ("object" == typeof e[n]) {
                                    if ((o = e[n]).keys)
                                        for (r = t[l], i = 0; i < o.keys.length; i++) {
                                            if (null == r) throw new Error(d('[sprintf] Cannot access property "%s" of undefined value "%s"', o.keys[i], o.keys[i - 1]));
                                            r = r[o.keys[i]];
                                        }
                                    else r = o.param_no ? t[o.param_no] : t[l++];
                                    if ((p.not_type.test(o.type) && p.not_primitive.test(o.type) && r instanceof Function && (r = r()), p.numeric_arg.test(o.type) && "number" != typeof r && isNaN(r)))
                                        throw new TypeError(d("[sprintf] expecting number but found %T", r));
                                    switch ((p.number.test(o.type) && (u = 0 <= r), o.type)) {
                                        case "b":
                                            r = parseInt(r, 10).toString(2);
                                            break;
                                        case "c":
                                            r = String.fromCharCode(parseInt(r, 10));
                                            break;
                                        case "d":
                                        case "i":
                                            r = parseInt(r, 10);
                                            break;
                                        case "j":
                                            r = JSON.stringify(r, null, o.width ? parseInt(o.width) : 0);
                                            break;
                                        case "e":
                                            r = o.precision ? parseFloat(r).toExponential(o.precision) : parseFloat(r).toExponential();
                                            break;
                                        case "f":
                                            r = o.precision ? parseFloat(r).toFixed(o.precision) : parseFloat(r);
                                            break;
                                        case "g":
                                            r = o.precision ? String(Number(r.toPrecision(o.precision))) : parseFloat(r);
                                            break;
                                        case "o":
                                            r = (parseInt(r, 10) >>> 0).toString(8);
                                            break;
                                        case "s":
                                            (r = String(r)), (r = o.precision ? r.substring(0, o.precision) : r);
                                            break;
                                        case "t":
                                            (r = String(!!r)), (r = o.precision ? r.substring(0, o.precision) : r);
                                            break;
                                        case "T":
                                            (r = Object.prototype.toString.call(r).slice(8, -1).toLowerCase()), (r = o.precision ? r.substring(0, o.precision) : r);
                                            break;
                                        case "u":
                                            r = parseInt(r, 10) >>> 0;
                                            break;
                                        case "v":
                                            (r = r.valueOf()), (r = o.precision ? r.substring(0, o.precision) : r);
                                            break;
                                        case "x":
                                            r = (parseInt(r, 10) >>> 0).toString(16);
                                            break;
                                        case "X":
                                            r = (parseInt(r, 10) >>> 0).toString(16).toUpperCase();
                                    }
                                    p.json.test(o.type)
                                        ? (c += r)
                                        : (!p.number.test(o.type) || (u && !o.sign) ? (f = "") : ((f = u ? "+" : "-"), (r = r.toString().replace(p.sign, ""))),
                                          (a = o.pad_char ? ("0" === o.pad_char ? "0" : o.pad_char.charAt(1)) : " "),
                                          (s = o.width - (f + r).length),
                                          (s = o.width && 0 < s ? a.repeat(s) : ""),
                                          (c += o.align ? f + r + s : "0" === a ? f + s + r : s + f + r));
                                }
                            return c;
                        })(
                            (function (e) {
                                if (u[e]) return u[e];
                                var t,
                                    r = e,
                                    n = [],
                                    i = 0;
                                for (; r; ) {
                                    if (null !== (t = p.text.exec(r))) n.push(t[0]);
                                    else if (null !== (t = p.modulo.exec(r))) n.push("%");
                                    else {
                                        if (null === (t = p.placeholder.exec(r))) throw new SyntaxError("[sprintf] unexpected placeholder");
                                        if (t[2]) {
                                            i |= 1;
                                            var o = [],
                                                a = t[2],
                                                s = [];
                                            if (null === (s = p.key.exec(a))) throw new SyntaxError("[sprintf] failed to parse named argument key");
                                            for (o.push(s[1]); "" !== (a = a.substring(s[0].length)); )
                                                if (null !== (s = p.key_access.exec(a))) o.push(s[1]);
                                                else {
                                                    if (null === (s = p.index_access.exec(a))) throw new SyntaxError("[sprintf] failed to parse named argument key");
                                                    o.push(s[1]);
                                                }
                                            t[2] = o;
                                        } else i |= 2;
                                        if (3 === i) throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
                                        n.push({ placeholder: t[0], param_no: t[1], keys: t[2], sign: t[3], pad_char: t[4], align: t[5], width: t[6], precision: t[7], type: t[8] });
                                    }
                                    r = r.substring(t[0].length);
                                }
                                return (u[e] = n);
                            })(e),
                            arguments
                        );
                    }
                    function e(e, t) {
                        return d.apply(null, [e].concat(t || []));
                    }
                    var u = Object.create(null);
                    void 0 !== r && ((r.sprintf = d), (r.vsprintf = e)),
                        "undefined" != typeof window &&
                            ((window.sprintf = d),
                            (window.vsprintf = e),
                            "function" == typeof define &&
                                define.amd &&
                                define(function () {
                                    return { sprintf: d, vsprintf: e };
                                }));
                })();
            },
            {},
        ],
        67: [
            function (R, e, x) {
                !function (w) {
                    !function () {
                        "use strict";
                        var r = R("bit-twiddle"),
                            e = R("dup"),
                            n = R("buffer").Buffer;
                        w.__TYPEDARRAY_POOL ||
                            (w.__TYPEDARRAY_POOL = {
                                UINT8: e([32, 0]),
                                UINT16: e([32, 0]),
                                UINT32: e([32, 0]),
                                BIGUINT64: e([32, 0]),
                                INT8: e([32, 0]),
                                INT16: e([32, 0]),
                                INT32: e([32, 0]),
                                BIGINT64: e([32, 0]),
                                FLOAT: e([32, 0]),
                                DOUBLE: e([32, 0]),
                                DATA: e([32, 0]),
                                UINT8C: e([32, 0]),
                                BUFFER: e([32, 0]),
                            });
                        var t = "undefined" != typeof Uint8ClampedArray,
                            i = "undefined" != typeof BigUint64Array,
                            o = "undefined" != typeof BigInt64Array,
                            a = w.__TYPEDARRAY_POOL;
                        a.UINT8C || (a.UINT8C = e([32, 0])), a.BIGUINT64 || (a.BIGUINT64 = e([32, 0])), a.BIGINT64 || (a.BIGINT64 = e([32, 0])), a.BUFFER || (a.BUFFER = e([32, 0]));
                        var s = a.DATA,
                            u = a.BUFFER;
                        function f(e) {
                            var t;
                            e && ((t = e.length || e.byteLength), (t = r.log2(t)), s[t].push(e));
                        }
                        function l(e) {
                            var e = r.nextPow2(e),
                                t = r.log2(e),
                                t = s[t];
                            return 0 < t.length ? t.pop() : new ArrayBuffer(e);
                        }
                        function h(e) {
                            return new Uint8Array(l(e), 0, e);
                        }
                        function c(e) {
                            return new Uint16Array(l(2 * e), 0, e);
                        }
                        function p(e) {
                            return new Uint32Array(l(4 * e), 0, e);
                        }
                        function d(e) {
                            return new Int8Array(l(e), 0, e);
                        }
                        function g(e) {
                            return new Int16Array(l(2 * e), 0, e);
                        }
                        function _(e) {
                            return new Int32Array(l(4 * e), 0, e);
                        }
                        function E(e) {
                            return new Float32Array(l(4 * e), 0, e);
                        }
                        function y(e) {
                            return new Float64Array(l(8 * e), 0, e);
                        }
                        function m(e) {
                            return t ? new Uint8ClampedArray(l(e), 0, e) : h(e);
                        }
                        function v(e) {
                            return i ? new BigUint64Array(l(8 * e), 0, e) : null;
                        }
                        function b(e) {
                            return o ? new BigInt64Array(l(8 * e), 0, e) : null;
                        }
                        function T(e) {
                            return new DataView(l(e), 0, e);
                        }
                        function A(e) {
                            e = r.nextPow2(e);
                            var t = r.log2(e),
                                t = u[t];
                            return 0 < t.length ? t.pop() : new n(e);
                        }
                        (x.free = function (e) {
                            var t;
                            n.isBuffer(e) ? u[r.log2(e.length)].push(e) : (e = "[object ArrayBuffer]" !== Object.prototype.toString.call(e) ? e.buffer : e) && ((t = e.length || e.byteLength), (t = 0 | r.log2(t)), s[t].push(e));
                        }),
                            (x.freeUint8 = x.freeUint16 = x.freeUint32 = x.freeBigUint64 = x.freeInt8 = x.freeInt16 = x.freeInt32 = x.freeBigInt64 = x.freeFloat32 = x.freeFloat = x.freeFloat64 = x.freeDouble = x.freeUint8Clamped = x.freeDataView = function (
                                e
                            ) {
                                f(e.buffer);
                            }),
                            (x.freeArrayBuffer = f),
                            (x.freeBuffer = function (e) {
                                u[r.log2(e.length)].push(e);
                            }),
                            (x.malloc = function (e, t) {
                                if (void 0 === t || "arraybuffer" === t) return l(e);
                                switch (t) {
                                    case "uint8":
                                        return h(e);
                                    case "uint16":
                                        return c(e);
                                    case "uint32":
                                        return p(e);
                                    case "int8":
                                        return d(e);
                                    case "int16":
                                        return g(e);
                                    case "int32":
                                        return _(e);
                                    case "float":
                                    case "float32":
                                        return E(e);
                                    case "double":
                                    case "float64":
                                        return y(e);
                                    case "uint8_clamped":
                                        return m(e);
                                    case "bigint64":
                                        return b(e);
                                    case "biguint64":
                                        return v(e);
                                    case "buffer":
                                        return A(e);
                                    case "data":
                                    case "dataview":
                                        return T(e);
                                    default:
                                        return null;
                                }
                                return null;
                            }),
                            (x.mallocArrayBuffer = l),
                            (x.mallocUint8 = h),
                            (x.mallocUint16 = c),
                            (x.mallocUint32 = p),
                            (x.mallocInt8 = d),
                            (x.mallocInt16 = g),
                            (x.mallocInt32 = _),
                            (x.mallocFloat32 = x.mallocFloat = E),
                            (x.mallocFloat64 = x.mallocDouble = y),
                            (x.mallocUint8Clamped = m),
                            (x.mallocBigUint64 = v),
                            (x.mallocBigInt64 = b),
                            (x.mallocDataView = T),
                            (x.mallocBuffer = A),
                            (x.clearCache = function () {
                                for (var e = 0; e < 32; ++e)
                                    (a.UINT8[e].length = 0),
                                        (a.UINT16[e].length = 0),
                                        (a.UINT32[e].length = 0),
                                        (a.INT8[e].length = 0),
                                        (a.INT16[e].length = 0),
                                        (a.INT32[e].length = 0),
                                        (a.FLOAT[e].length = 0),
                                        (a.DOUBLE[e].length = 0),
                                        (a.BIGUINT64[e].length = 0),
                                        (a.BIGINT64[e].length = 0),
                                        (a.UINT8C[e].length = 0),
                                        (s[e].length = 0),
                                        (u[e].length = 0);
                            });
                    }.call(this);
                }.call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
            },
            { "bit-twiddle": 11, buffer: 12, dup: 18 },
        ],
        68: [
            function (e, t, r) {
                "use strict";
                t.exports = function (e, t, r) {
                    return 0 === e.length
                        ? e
                        : t
                        ? (r || e.sort(t),
                          (function (e, t) {
                              for (var r, n = 1, i = e.length, o = e[0], a = (e[0], 1); a < i; ++a) (r = o), t((o = e[a]), r) && (a !== n ? (e[n++] = o) : n++);
                              return (e.length = n), e;
                          })(e, t))
                        : (r || e.sort(),
                          (function (e) {
                              for (var t = 1, r = e.length, n = e[0], i = e[0], o = 1; o < r; ++o, i = n) (i = n), (n = e[o]) !== i && (o !== t ? (e[t++] = n) : t++);
                              return (e.length = t), e;
                          })(e));
                };
            },
            {},
        ],
        69: [
            function (e, m, t) {
                !(function () {
                    "use strict";
                    if ("undefined" == typeof ses || !ses.ok || ses.ok()) {
                        "undefined" != typeof ses && (ses.weakMapPermitHostObjects = p);
                        var t = !1;
                        if ("function" == typeof WeakMap) {
                            var r = WeakMap;
                            if ("undefined" == typeof navigator || !/Firefox/.test(navigator.userAgent)) {
                                var e = new r(),
                                    n = Object.freeze({});
                                if ((e.set(n, 1), 1 === e.get(n))) return (m.exports = WeakMap);
                                t = !0;
                            }
                        }
                        Object.prototype.hasOwnProperty;
                        var i,
                            o = Object.getOwnPropertyNames,
                            a = Object.defineProperty,
                            s = Object.isExtensible,
                            u = "weakmap:",
                            f = u + "ident:" + Math.random() + "___";
                        "undefined" != typeof crypto &&
                            "function" == typeof crypto.getRandomValues &&
                            "function" == typeof ArrayBuffer &&
                            "function" == typeof Uint8Array &&
                            ((n = new ArrayBuffer(25)),
                            (n = new Uint8Array(n)),
                            crypto.getRandomValues(n),
                            (f =
                                u +
                                "rand:" +
                                Array.prototype.map
                                    .call(n, function (e) {
                                        return (e % 36).toString(36);
                                    })
                                    .join("") +
                                "___")),
                            a(Object, "getOwnPropertyNames", {
                                value: function (e) {
                                    return o(e).filter(d);
                                },
                            }),
                            "getPropertyNames" in Object &&
                                ((i = Object.getPropertyNames),
                                a(Object, "getPropertyNames", {
                                    value: function (e) {
                                        return i(e).filter(d);
                                    },
                                })),
                            (function () {
                                var t = Object.freeze;
                                a(Object, "freeze", {
                                    value: function (e) {
                                        return g(e), t(e);
                                    },
                                });
                                var r = Object.seal;
                                a(Object, "seal", {
                                    value: function (e) {
                                        return g(e), r(e);
                                    },
                                });
                                var n = Object.preventExtensions;
                                a(Object, "preventExtensions", {
                                    value: function (e) {
                                        return g(e), n(e);
                                    },
                                });
                            })();
                        var l = !1,
                            h = 0,
                            c = function () {
                                this instanceof c || E();
                                var n = [],
                                    i = [],
                                    o = h++;
                                return Object.create(c.prototype, {
                                    get___: {
                                        value: _(function (e, t) {
                                            var r = g(e);
                                            return r ? (o in r ? r[o] : t) : 0 <= (e = n.indexOf(e)) ? i[e] : t;
                                        }),
                                    },
                                    has___: {
                                        value: _(function (e) {
                                            var t = g(e);
                                            return t ? o in t : 0 <= n.indexOf(e);
                                        }),
                                    },
                                    set___: {
                                        value: _(function (e, t) {
                                            var r = g(e);
                                            return r ? (r[o] = t) : 0 <= (r = n.indexOf(e)) ? (i[r] = t) : ((r = n.length), (i[r] = t), (n[r] = e)), this;
                                        }),
                                    },
                                    delete___: {
                                        value: _(function (e) {
                                            var t = g(e);
                                            return t ? o in t && delete t[o] : !((t = n.indexOf(e)) < 0) && ((e = n.length - 1), (n[t] = void 0), (i[t] = i[e]), (n[t] = n[e]), (n.length = e), (i.length = e), !0);
                                        }),
                                    },
                                });
                            };
                        (c.prototype = Object.create(Object.prototype, {
                            get: {
                                value: function (e, t) {
                                    return this.get___(e, t);
                                },
                                writable: !0,
                                configurable: !0,
                            },
                            has: {
                                value: function (e) {
                                    return this.has___(e);
                                },
                                writable: !0,
                                configurable: !0,
                            },
                            set: {
                                value: function (e, t) {
                                    return this.set___(e, t);
                                },
                                writable: !0,
                                configurable: !0,
                            },
                            delete: {
                                value: function (e) {
                                    return this.delete___(e);
                                },
                                writable: !0,
                                configurable: !0,
                            },
                        })),
                            "function" == typeof r
                                ? (t && "undefined" != typeof Proxy && (Proxy = void 0),
                                  (y.prototype = c.prototype),
                                  (m.exports = y),
                                  Object.defineProperty(WeakMap.prototype, "constructor", { value: WeakMap, enumerable: !1, configurable: !0, writable: !0 }))
                                : ("undefined" != typeof Proxy && (Proxy = void 0), (m.exports = c));
                    }
                    function p(e) {
                        e.permitHostObjects___ && e.permitHostObjects___(p);
                    }
                    function d(e) {
                        return !(e.substr(0, u.length) == u && "___" === e.substr(e.length - 3));
                    }
                    function g(e) {
                        if (e !== Object(e)) throw new TypeError("Not an object: " + e);
                        var t = e[f];
                        if (t && t.key === e) return t;
                        if (s(e)) {
                            t = { key: e };
                            try {
                                return a(e, f, { value: t, writable: !1, enumerable: !1, configurable: !1 }), t;
                            } catch (e) {
                                return;
                            }
                        }
                    }
                    function _(e) {
                        return (e.prototype = null), Object.freeze(e);
                    }
                    function E() {
                        l || "undefined" == typeof console || ((l = !0), console.warn("WeakMap should be invoked as new WeakMap(), not WeakMap(). This will be an error in the future."));
                    }
                    function y() {
                        this instanceof c || E();
                        var e,
                            n = new r(),
                            i = void 0,
                            o = !1;
                        return (
                            (e = t
                                ? function (e, t) {
                                      return n.set(e, t), n.has(e) || (i = i || new c()).set(e, t), this;
                                  }
                                : function (t, r) {
                                      if (o)
                                          try {
                                              n.set(t, r);
                                          } catch (e) {
                                              (i = i || new c()).set___(t, r);
                                          }
                                      else n.set(t, r);
                                      return this;
                                  }),
                            Object.create(c.prototype, {
                                get___: {
                                    value: _(function (e, t) {
                                        return i ? (n.has(e) ? n.get(e) : i.get___(e, t)) : n.get(e, t);
                                    }),
                                },
                                has___: {
                                    value: _(function (e) {
                                        return n.has(e) || (!!i && i.has___(e));
                                    }),
                                },
                                set___: { value: _(e) },
                                delete___: {
                                    value: _(function (e) {
                                        var t = !!n.delete(e);
                                        return (i && i.delete___(e)) || t;
                                    }),
                                },
                                permitHostObjects___: {
                                    value: _(function (e) {
                                        if (e !== p) throw new Error("bogus call to permitHostObjects___");
                                        o = !0;
                                    }),
                                },
                            })
                        );
                    }
                })();
            },
            {},
        ],
        70: [
            function (e, t, r) {
                var n = e("./hidden-store.js");
                t.exports = function () {
                    var r = {};
                    return function (e) {
                        if (("object" != typeof e || null === e) && "function" != typeof e) throw new Error("Weakmap-shim: Key must be object");
                        var t = e.valueOf(r);
                        return t && t.identity === r ? t : n(e, r);
                    };
                };
            },
            { "./hidden-store.js": 71 },
        ],
        71: [
            function (e, t, r) {
                t.exports = function (e, t) {
                    var r = { identity: t },
                        n = e.valueOf;
                    return (
                        Object.defineProperty(e, "valueOf", {
                            value: function (e) {
                                return e !== t ? n.apply(this, arguments) : r;
                            },
                            writable: !0,
                        }),
                        r
                    );
                };
            },
            {},
        ],
        72: [
            function (e, t, r) {
                var n = e("./create-store.js");
                t.exports = function () {
                    var r = n();
                    return {
                        get: function (e, t) {
                            e = r(e);
                            return e.hasOwnProperty("value") ? e.value : t;
                        },
                        set: function (e, t) {
                            return (r(e).value = t), this;
                        },
                        has: function (e) {
                            return "value" in r(e);
                        },
                        delete: function (e) {
                            return delete r(e).value;
                        },
                    };
                };
            },
            { "./create-store.js": 70 },
        ],
        73: [
            function (e, t, r) {
                var n = e("get-canvas-context");
                t.exports = function (e) {
                    return n("webgl", e);
                };
            },
            { "get-canvas-context": 21 },
        ],
    },
    {},
    [1]
);
