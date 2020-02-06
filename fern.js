
SVG.on(document, 'DOMContentLoaded', function () {
  var draw = SVG().addTo('body').size(1125, 2436);
  var rect = draw.rect(1125, 2436).attr({fill: 'aquamarine'});

  var settings = new Settings(
    [
      {
      },
      {
      },
      {
        isLeaf: true
      }
    ], 
    {
      color: '#243',
      startScale: 0.3,
      endScale: 0.1,
      numChildren: 10,
      angle: 70,
      curve: 2
    }
  );

  var fern = idealFern(draw, settings);
  fern.transform({
    translateX: 500,
    translateY: 50
  })
  .rotate(90, 0,0)
  .scale(22, 0, 0);
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
        return this.levels[0][name];
      } else if (this.config[name]) {
        return this.config[name];
      } else {
        return null;
      }
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

function modifyLeaf(ps, settings) {
  return _.map(ps, (point) => {
    var [x, y] = point;
    var curveFactor = settings.get('curve') * 0.001;

    return [
      x,
      y + (curveFactor * x*x)
    ];
  });
}


function drawLeaf(draw, settings) {
  var group = draw.group();
  var ps = [
    [0,0], [10,0], [30,10], [40,10], [90,0], [100,0],
    [90,0], [50,-10], [40,-10], [10, 0], [0,0]
  ];
  ps = modifyLeaf(ps, settings);
  var pathString = psToString(ps);
  var path = group.path(pathString).stroke({color: settings.get('color')})
  return group;
}

function idealFern(draw, settings) {
  var group = draw.group();

  if (settings.get('isLeaf')) {
    var leaf = drawLeaf(group, settings)
  } else {
    group.line(0, 0, 100, 0).stroke({width: 1, color: settings.get('color'), linecap: 'round'});
  }

  var nextLevel = settings.nextLevel();

  if (nextLevel) {
    var numChildren = settings.get('numChildren');
    var deltaX = 100 / numChildren;
    for (var i=0; i < numChildren; i++) {
      var frac = i / numChildren;
      var child = idealFern(group, nextLevel);
      var scale = lerp(settings.get('startScale'), settings.get('endScale'), frac);
      child
      .translate(deltaX * i, 0)
      .scale(scale, 0, 0)
      .rotate(i % 2 ? settings.get('angle') : -settings.get('angle'), 0, 0);
    }
  }

  return group;
}