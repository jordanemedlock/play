
SVG.on(document, 'DOMContentLoaded', function () {
  var draw = SVG().addTo('body').size(1125, 2436);
  var rect = draw.rect(1125, 2436).attr({fill: 'aquamarine'});

  var settings = new Settings(
    [
      {
        numChildren: 30,
        childTranslation: (settings, childNum) => {
          var xs = [7, 9,  22, 24,  36, 37];
          if (childNum >= xs.length) {
            var v = 0.3;
            childNum = Math.floor(childNum / 2) * 2;
            var scale = settings.get('numChildren') - xs.length;
            var frac = (childNum - xs.length) / scale;
            frac = 1 - Math.pow(1 - frac, 1.5);
            return frac * scale * 2 + 45 + Math.random() * v - v/2;
          } else {
            return xs[childNum];
          }
        },
        skew: 1.5,
        childScale: (settings, childNum) => {
          if (childNum < 6) {
            childNum -= 1;
          }
          var skew = settings.get('skew');
          var frac = childNum / settings.get('numChildren');
          frac = 1 - Math.pow(1 - frac, skew);
          return lerp(0.3, 0.001, frac);
        },
        curve: () => -1,
        levelNum: 0
      },
      // {
      //   levelNum: 1
      // },
      // {
      //   levelNum: 2,
      //   isLeaf: () => true
      // }
    ], 
    {
      color: '#243',
      childScale: (settings, childNum) => {
        var frac = childNum / settings.get('numChildren');
        // frac = 1 - (1 - frac)*(1 - frac);
        return lerp(0.3, 0.001, frac);
      },
      numChildren: 15,
      childStart: 5,
      childEnd: 100,
      angle: 70,
      curve: (settings, childNum) => {
        return childNum % 2 == 0 ? 2 : -2;
      },
      lineWidth: 10,
      fill: null,
      isLeaf: (settings, scale) => scale < 4.3,
      childTranslation: (settings, childNum) => {
        var numChildren = settings.get('numChildren');
        var childStart = settings.get('childStart');
        var childEnd = settings.get('childEnd');
        var deltaX = (childEnd - childStart) / numChildren;
        return deltaX * childNum + childStart;
      }
    }
  );

  var fern = idealFern(draw, settings, 19, 0);
  fern.transform({
    translateX: 500,
    translateY: 450
  })
  .rotate(90, 0,0);
  // var leaf = drawLeaf(draw, settings)
  // .translate(500, 50)
  // .rotate(90, 0, 0)
  // .scale(22, 0, 0);
});

function Settings(levels, config) {
  return {
    levels: levels,
    config: config,
    get: function(name) {
      if (this.levels[0][name]) {
        var ret = this.levels[0][name];
      } else if (this.config[name]) {
        var ret = this.config[name];
      } else {
        var ret = null;
      }
      return ret;
    },
    set: function(key, value) {
      this.config[key] = value;
    },
    nextLevel: function() {
      if (this.levels.length > 1) {
        return new Settings(this.levels.slice(1), this.config);
      } else {
        return null;
      }
    }
  }
}

function lerp(x, y, frac) {
  return (y - x) * frac + x;
}

function s(p) {
  return p.x + ',' + p.y;
}

function psToString(ps) {
  var p = _.map(ps, (x) => x[0] + ',' + x[1]);
  return `M${p[0]} C${p[1]} ${p[2]} ${p[3]} S${p[4]} ${p[5]} C${p[6]} ${p[7]} ${p[8]} S${p[9]} ${p[10]} z`
}

function flipPoints(points) {
  var ret = [];
  for (var i=0; i < points.length; i++) {
    ret[i] = {
      x: points[i].x,
      y: -points[i].y
    }
  }
  return ret;
}

function modifyLeaf(ps, settings, scale, childNum) {
  return _.map(ps, (point) => {
    var [x, y] = point;
    var curveFactor = settings.get('curve')(settings, childNum) * 0.001;

    return [
      x * scale,
      (y + (curveFactor * x*x))*scale
    ];
  });
}

function modifyStem(ps, settings, scale, childNum) {
  return _.map(ps, (point) => {
    var [x, y] = point;
    var curveFactor = settings.get('curve')(settings, childNum) * 0.001;

    return [
      x * scale,
      (y + (curveFactor * x*x))*scale
    ];
  })
}


function drawLeaf(draw, settings, scale, childNum) {
  var group = draw.group();
  var ps = [
    [0,0], [10,0], [30,10], [40,10], [90,0], [100,0],
    [90,0], [50,-10], [40,-10], [10, 0], [0,0]
  ];
  ps = modifyLeaf(ps, settings, scale, childNum);
  var pathString = psToString(ps);
  var path = group.path(pathString)
  .fill('none')
  .stroke({
    color: settings.get('color'), 
    width: settings.get('lineWidth'),
    linecap: 'round',
    linejoin: 'round'
  });
  return group;
}

function drawStem(draw, settings, scale, childNum) {
  var group = draw.group();
  var ps = [
    [0,0], [10,1], [40,1], [50,0], [90, -0.5], [100, 0],
    [90, -1], [60, -2], [50, -1], [10, 0], [0, -1]
  ];
  ps = modifyStem(ps, settings, scale, childNum);
  var pathString = psToString(ps);
  var path = group.path(pathString)
  .fill('none')
  .stroke({
    color: settings.get('color'), 
    width: settings.get('lineWidth'),
    linecap: 'round',
    linejoin: 'round'
  });
  return group;
  // draw.line(0, 0, 100*scale, 0).stroke({width: settings.get('lineWidth'), color: settings.get('color'), linecap: 'round'});

}

function idealFern(draw, settings, scale, childNum) {
  var group = draw.group();

  if (settings.get('isLeaf')(settings, scale)) {
    var leaf = drawLeaf(group, settings, scale, childNum);
    return group;
  } else {
    var stem = drawStem(group, settings, scale, childNum);
  }

  var nextLevel = settings.nextLevel();

  if (nextLevel) {
    var numChildren = settings.get('numChildren');
    for (var i=0; i < numChildren; i++) {
      var newX = settings.get('childTranslation')(settings, i) * scale;
      var newScale = settings.get('childScale')(settings, i) * scale;
      var child = idealFern(group, nextLevel, newScale, i);
      child
      .translate(newX, 0)
      .rotate(i % 2 ? settings.get('angle') : -settings.get('angle'), 0, 0);
    }
  }

  return group;
}