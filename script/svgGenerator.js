var O = 200;
function G(a) {
  var b,
    c,
    d,
    e,
    g,
    h,
    i,
    j,
    l,
    m,
    n,
    o,
    p = [],
    q = {
      x: 0,
      y: 0,
    },
    r = {},
    s = 0.001,
    t = [];
  for (j = a.length, g = 0; j > g; g += 1) {
    i = a[g];
    try {
      c = i.args.slice(0);
    } catch (u) {
      c = [];
    }
    if (((e = i.cmd.toLowerCase()), (l = c ? c.length : 0), l > 1)) {
      if (
        ((r.x = c[l - 2]),
        (r.y = c[l - 1]),
        "c" === e
          ? (m &&
              ((o = f(m, q)),
              Math.abs(o.x - c[0]) < s && Math.abs(o.y - c[1]) < s
                ? ((e = "s"), (c = c.slice(2)), (m = o))
                : (m = !1)),
            m ||
              (m = {
                x: c[2],
                y: c[3],
              }),
            (n = !1))
          : "q" === e
          ? (n &&
              ((o = f(n, q)),
              Math.abs(o.x - c[0]) < s && Math.abs(o.y - c[1]) < s
                ? ((e = "t"), (c = c.slice(2)), (n = o))
                : (n = !1)),
            n ||
              (n = {
                x: c[0],
                y: c[1],
              }),
            (m = !1))
          : "s" === e
          ? ((m = m ? f(m, q) : !1), (n = !1))
          : "t" === e
          ? ((n = n ? f(n, q) : !1), (m = !1))
          : ((m = !1), (n = !1)),
        "m" === e)
      )
        e = "M";
      else
        for (l = c.length, h = 0; l > h; h += 2)
          (c[h] -= q.x), (c[h + 1] -= q.y);
      "l" === e &&
        (0 === c[0]
          ? ((e = "v"), (c = [c[1]]))
          : 0 === c[1] && ((e = "h"), (c = [c[0]]))),
        (q.x = r.x),
        (q.y = r.y);
    }
    p.push({
      cmd: e,
      args: c,
    });
  }
  for (d = [], g = 0; j > g; g += 1) {
    for (i = p[g], d.push(i), e = i.cmd, h = g + 1; j > h && p[h].cmd === e; )
      (i.args = i.args.concat(p[h].args)), (h += 1);
    g = h - 1;
  }
  for (j = d.length, g = 0; j > g; g += 1)
    for (
      i = d[g], t.push(i.cmd), l = i.args ? i.args.length : 0, h = 0;
      l > h;
      h += 1
    )
      (b = i.args[h]), (b = b >= 0 && 0 !== h ? " " + k(b) : k(b)), t.push(b);
  return t.join("");
}
function f(a, b) {
  return {
    x: 2 * b.x - a.x,
    y: 2 * b.y - a.y,
  };
}
function g(a, b) {
  var c, d, e, f, g, h, i, j, k;
  if (b && a) {
    if (
      ((c = isNaN(b.a) ? 1 : b.a),
      (d = isNaN(b.b) ? 0 : b.b),
      (e = isNaN(b.c) ? 0 : b.c),
      (f = isNaN(b.d) ? 1 : b.d),
      (g = isNaN(b.e) ? 0 : b.e),
      (h = isNaN(b.f) ? 0 : b.f),
      (j = a.length),
      !j)
    )
      return {
        x: c * a.x + e * a.y + g,
        y: d * a.x + f * a.y + h,
      };
    if (a[0] && !isNaN(a[0].x) && !isNaN(a[0].y)) {
      for (k = [], i = 0; j > i; i += 1)
        (k[i] = {}),
          (k[i].x = c * a[i].x + e * a[i].y + g),
          (k[i].y = d * a[i].x + f * a[i].y + h);
      return k;
    }
    if ("number" == typeof a[0] && j % 2 === 0)
      for (i = 0; j > i; i += 2)
        (k = {
          x: a[i],
          y: a[i + 1],
        }),
          (a[i] = c * k.x + e * k.y + g),
          (a[i + 1] = d * k.x + f * k.y + h);
  }
}
function h(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}
function i(a, b) {
  return h({
    x: b.x - a.x,
    y: b.y - a.y,
  });
}
function k(a, b) {
  return (
    (isNaN(b) || 0 > b) && (b = 3),
    a
      .toFixed(b)
      .replace(/\.0+$/, "")
      .replace(/(\.[^0]+)0+$/, "$1")
  );
}
function l(a) {
  return (
    (a = a.toLowerCase()),
    /[vh]/.test(a)
      ? 1
      : /[mlt]/.test(a)
      ? 2
      : /[sq]/.test(a)
      ? 4
      : /[c]/.test(a)
      ? 6
      : /[a]/.test(a)
      ? 7
      : 0
  );
}
function m(a) {
  var b,
    c,
    d,
    e,
    f,
    g,
    h,
    i = [];
  if (!a) return i;
  for (
    a = a
      .replace(/,/g, " ")
      .replace(/-/g, " -")
      .replace(/-\s+/g, "-")
      .replace(/e\s*/gi, "e")
      .replace(/\.(\d+)\./g, ".$1 .")
      .replace(/\.(\d+)\./g, ".$1 .")
      .replace(/\s+/g, " "),
      i = a.replace(/([mzlhvcsqta])\s?/gi, "|$1").split("|"),
      i.splice(0, 1),
      f = i.length,
      d = 0;
    f > d;
    d += 1
  ) {
    if (((h = i[d]), (c = h[0]), (b = h.substr(1).trim())))
      for (b = b.split(/\s/), g = b.length, e = 0; g > e; e += 1)
        b[e] = Number(b[e]);
    else b = [];
    i[d] = {
      cmd: c,
      args: b,
    };
  }
  return i;
}
function Q(a) {
  return "[object Array]" === Object.prototype.toString.call(a);
}
function v(a) {
  var b,
    c,
    d,
    e,
    f,
    g,
    h,
    i = [],
    j = !0;
  for (
    "string" == typeof a
      ? (f = m(a))
      : ((f = t(a)),
        (j = a.style.stroke),
        (j = j && "none" !== j && 0 !== u(a.style.strokeWidth))),
      h = f ? f.length : 0,
      e = 0;
    h > e;
    e += 1
  )
    if (
      ((c = f[e].args),
      (d = f[e].cmd),
      /m/.test(d) && 2 === c.length && f[e + 1] && /m/.test(f[e + 1]))
    );
    else if (((b = l(d)), (c = c || []), c.length > b)) {
      g = 0;
      do
        i.push({
          cmd: d,
          args: c.slice(g, g + b),
        }),
          (g += b),
          "m" === d ? (d = "l") : "M" === d && (d = "L");
      while (g < c.length);
    } else
      i.push({
        cmd: d,
        args: c,
      });
  return y(i, {
    evenOdd: f && f.evenOdd,
    hasStroke: j,
  });
}
function y(a, b) {
  function c(a, b) {
    var c,
      d,
      e,
      f,
      g,
      h,
      j,
      k,
      l = [],
      m = NaN;
    if (((b = b || 0.001), (g = a.length), 2 > g)) return !1;
    for (e = 0; g > e; e += 1)
      (f = a[e]),
        (c = f.cmd),
        "Z" === c
          ? ((h = !1), (j = !1))
          : "M" === c
          ? ((h = {
              x: f.args[0],
              y: f.args[1],
            }),
            (j = !1))
          : "C" === c
          ? ((h = {
              x: f.args[4],
              y: f.args[5],
            }),
            (j = !1))
          : "S" === c || "Q" === c
          ? ((h = {
              x: f.args[2],
              y: f.args[3],
            }),
            (j = !1))
          : "T" === c
          ? ((h = {
              x: f.args[0],
              y: f.args[1],
            }),
            (j = !1))
          : "L" === c &&
            ((d = {
              x: f.args[0],
              y: f.args[1],
            }),
            h
              ? ((k = (d.y - h.y) / (d.x - h.x)),
                !isNaN(m) && (k === m || Math.abs(k - m) < b || i(h, d) < b)
                  ? l.pop()
                  : j
                  ? ((h = j), (m = (d.y - j.y) / (d.x - j.x)))
                  : isNaN(k) || (m = k))
              : (h = d),
            (j = d)),
        "L" !== c && (m = NaN),
        l.push(f);
    return (l[0].cmd = "M"), l;
  }
  var d,
    e,
    f,
    g,
    h,
    j,
    k,
    l,
    m,
    n,
    o = {
      x: 0,
      y: 0,
    },
    p = [],
    q = 0;
  for (l = a.length, h = 0; l > h; h += 1) {
    if (
      ((f = a[h].cmd),
      (j = /[a-z]/.test(f)),
      (f = f.toUpperCase()),
      (d = a[h].args),
      (e = !1),
      "Z" === f)
    )
      (o = g), (g = !1);
    else if ((g || "M" === f || (g = o), "A" === f))
      j && ((d[5] += o.x), (d[6] += o.y)),
        (n = {
          x: d[5],
          y: d[6],
        }),
        (d = x(o, d)),
        (o = n),
        (f = "C"),
        (e = [n.x, n.y]);
    else if ("H" === f)
      j && (d[0] += o.x),
        (o = {
          x: d[0],
          y: o.y,
        }),
        (d[1] = o.y),
        (f = "L");
    else if ("V" === f)
      j && (d[0] += o.y),
        (o = {
          x: o.x,
          y: d[0],
        }),
        (d[0] = o.x),
        (d[1] = o.y),
        (f = "L");
    else {
      if ("M" === f)
        try {
          (n = a[h + 1].cmd.toUpperCase()),
            "Z" === n
              ? (j
                  ? ((o.x += d[0]), (o.y += d[1]))
                  : ((o.x = d[0]), (o.y = d[1])),
                (d = !1),
                (h += 1))
              : (q += 1);
        } catch (r) {}
      for (m = d.length, k = 0; m > k; k += 2)
        j && ((d[k] += o.x), (d[k + 1] += o.y)),
          (k + 2) % m === 0 &&
            (o = {
              x: d[k],
              y: d[k + 1],
            });
    }
    if (
      ("M" === f &&
        g &&
        "Z" !== a[h - 1].cmd.toUpperCase() &&
        !b.hasStroke &&
        p.push({
          cmd: "Z",
          args: [],
        }),
      d && ("M" !== f || !a[h + 1] || "M" !== a[h + 1].cmd.toUpperCase()))
    ) {
      if (("M" === f && (g = o), d[0] && d[0].length))
        for (m = d.length, k = 0; m > k; k += 1)
          p.push({
            cmd: f,
            args: d[k],
          });
      else
        p.push({
          cmd: f,
          args: d,
        });
      e &&
        p.push({
          cmd: "L",
          args: e,
        });
    }
  }
  return (
    "Z" === f ||
      b.hasStroke ||
      p.push({
        cmd: "Z",
        args: [],
      }),
    (p = c(p)),
    b.evenOdd && q > 1 ? J(p) : p
  );
}
module.exports = function N(a) {
  var c = [],
    d = {};
  return (
    (d.append = function (a, b) {
      var e,
        f,
        g,
        h,
        i,
        j,
        k = !1,
        l = [];
      if (
        (c.forEach(function (a) {
          l.push(JSON.stringify(a));
        }),
        !a)
      )
        return this;
      if (Q(a)) {
        for (h = a.length, f = 0; h > f; f += 1) d.append(a[f], !0);
        return this;
      }
      if (
        ("string" != typeof a && a.length && (a = a[0]),
        ("string" == typeof a && /<\/svg>/i.test(a)) ||
          (a.tagName && "svg" === a.tagName.toLowerCase()))
      ) {
        for (
          a = M(P(a)),
            a.viewBox && (d.viewBox = a.viewBox),
            a.strokeWarning && (d.strokeWarning = !0),
            a = a.getPathArray(),
            j = d.viewBox,
            j = {
              xMin: j.x,
              xMax: j.x + j.width,
              yMin: j.y,
              yMax: j.y + j.height,
            },
            i = [],
            g = 0;
          g < a.length;
          g += 1
        )
          (e = z(a[g])),
            e.xMin < j.xMax &&
              e.xMax > j.xMin &&
              e.yMin < j.yMax &&
              e.yMax > j.yMin &&
              i.push(a[g]);
        (a = i), (k = !0);
      } else
        a.tagName || "string" == typeof a
          ? (a = v(a))
          : a.getPathArray
          ? ((a = a.getPathArray()), (k = !0))
          : (a = !1);
      return (
        a &&
          (b || -1 === l.indexOf(JSON.stringify(a))) &&
          (k ? (c = c.concat(a)) : c.push(a)),
        (function () {
          var a,
            d = [],
            e = [];
          !b &&
            c.length > 1 &&
            c.length < O &&
            (c.forEach(function (b) {
              var c = JSON.stringify(b) + JSON.stringify(b.attrs);
              (a = d.indexOf(c)),
                -1 !== a ? e.splice(a, 1) : d.push(c),
                e.push(b);
            }),
            (c = e));
        })(),
        this
      );
    }),
    (d.setPath = function (a) {
      return (c = []), d.append(a);
    }),
    (d.setAttrs = function (a, b) {
      (b = b || 0), c[b] && (c[b].attrs = a);
    }),
    (d.getAttrs = function (a) {
      var d,
        e,
        f,
        g = !0,
        h = b([0, 0, 0]),
        i = c.length,
        j = [],
        k = !1;
      for (f = 0; i > f; f += 1)
        j.push(c[f].attrs || {}),
          a &&
            (j[f].fill &&
              "none" !== j[f].fill &&
              ((d = b(j[f].fill)),
              (e = j[f].fill = d.toString()),
              (g = g && b(j[f].fill).distance(h) < 14),
              f &&
                !k &&
                b(j[f].fill).distance(b(j[f - 1].fill)) > 10 &&
                !g &&
                (k = !0)),
            j[f].stroke &&
              "none" !== j[f].stroke &&
              ((d = b(j[f].stroke)), (j[f].stroke = d.toString())),
            1 === j[f].opacity && delete j[f].opacity);
      if (a)
        if (k)
          for (f = 0; i > f; f += 1)
            (j[f] = j[f] || {}),
              j[f].fill || (j[f].fill = "#000"),
              j[f].strokeWidth > 0 && !j[f].stroke && (j[f].stroke = "#000");
        else
          j = j.map(function (a) {
            return "none" !== a.fill && (j.fill = e), a;
          });
      return j;
    }),
    (d.getPathData = function (a) {
      var b,
        d,
        e = [];
      for (b = 0; b < c.length; b += 1) (d = G(c[b])), e.push(d);
      return a ? (c.length > O ? [e.join("")] : e) : e.join("");
    }),
    (d.transform = function (a, b) {
      var e,
        f,
        h = 0,
        i = c.length;
      for (
        !isNaN(b) && b >= 0 && i > b && ((h = b), (i = b + 1)), h;
        i > h;
        h += 1
      )
        for (e = c[h], f = 0; f < e.length; f += 1) g(e[f].args, a);
      return (
        d.viewBox &&
          (a.a &&
            (d.viewBox.width = Math.abs(Math.round(a.a * d.viewBox.width))),
          a.d &&
            (d.viewBox.height = Math.abs(Math.round(a.d * d.viewBox.height)))),
        this
      );
    }),
    (d.scale = function (a, b, c) {
      return (
        (a = Number(a)),
        (b = Number(b)),
        a && a !== 1 / 0
          ? (d.transform(
              {
                a: a,
                d: b || a,
              },
              c
            ),
            this)
          : this
      );
    }),
    (d.translate = function (a, b, c) {
      return (
        (a = Number(a)),
        (b = Number(b)),
        isNaN(a)
          ? this
          : (isNaN(b) && (b = a),
            d.transform(
              {
                e: a,
                f: b,
              },
              c
            ),
            this)
      );
    }),
    (d.rotate = function (a, b) {
      var c, e;
      return (
        (a = (Number(a) / 180) * Math.PI),
        isNaN(a)
          ? this
          : ((c = Math.cos(a)),
            (e = Math.sin(a)),
            d.transform(
              {
                a: c,
                b: e,
                c: -e,
                d: c,
              },
              b
            ),
            this)
      );
    }),
    (d.deleteSubPath = function (a) {
      return a >= 0 && a < c.length && c.splice(a, 1), this;
    }),
    (d.moveLayer = function (a, b) {
      var d;
      a >= 0 &&
        a < c.length &&
        ((b += b > 0 ? 1 : -1),
        (d = c.map(function (a, b) {
          return {
            el: a,
            order: b,
          };
        })),
        (d[a].order += b),
        d.sort(function (a, b) {
          return a.order - b.order;
        }),
        (c = d.map(function (a) {
          return a.el;
        })));
    }),
    (d.getTTFContours = function () {
      var a,
        b = [];
      for (a = 0; a < c.length; a += 1) b = b.concat(D(c[a]));
      return (
        b.length ||
          (b = [
            [
              {
                x: 0,
                y: 0,
              },
              {
                x: 0,
                y: 0,
              },
              {
                x: 0,
                y: 0,
              },
            ],
          ]),
        b
      );
    }),
    (d.getCFFPath = function () {
      var a,
        b = [];
      for (a = 0; a < c.length; a += 1) b = b.concat(c[a]);
      return (
        (b = C(b)),
        b.length ||
          (b = [
            {
              cmd: "Z",
              args: [],
            },
          ]),
        b
      );
    }),
    (d.getPDFSegments = function () {
      var a,
        b = [];
      for (a = 0; a < c.length; a += 1) b.push(E(c[a]));
      return b;
    }),
    (d.getPSPaths = function () {
      var a,
        b = [];
      for (a = 0; a < c.length; a += 1) b = b.concat(F(c[a]));
      return b;
    }),
    (d.getPathArray = function () {
      return c.slice(0);
    }),
    d.setPath(a),
    d
  );
};


