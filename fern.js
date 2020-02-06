
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
      },
      {
      }
    ], 
    {
      color: '#243',
      startScale: 0.3,
      endScale: 0.1,
      numChildren: 10,
      angle: 70
    }
  );

  // var fern = idealFern(draw, settings);
  // fern.transform({
  //   translateX: 500,
  //   translateY: 50
  // })
  // .rotate(90, 0,0)
  // .scale(22, 0, 0);
  var leaf = drawLeaf(draw, settings)
  .translate(500, 50)
  .rotate(90, 0, 0)
  .scale(22, 0, 0);
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

function pToS(p) {
  return p.x + ',' + p.y + ' ';
}

function psToString(ps) {
  return 'M'+pToS(ps[0])+'C'+pToS(ps[1])+pToS(ps[2])+pToS(ps[3])+'S'+pToS(ps[4])+pToS(ps[5])+'z';
}
function drawLeaf(draw, settings) {
  var group = draw.group();
  var ps = [{x:0,y:0}, {x:10,y:0}, {x:40,y:10}, {x:50,y:10},{x:90,y:0}, {x:100,y:0}]
  var pathString = psToString(ps);
  var path = group.path(pathString).stroke({color:settings.get('color')})
  var flipped = path.clone(group).flip('y');
  return group;
}

function idealFern(draw, settings) {
  var group = draw.group();

  
  group.line(0, 0, 100, 0).stroke({width: 1, color: settings.get('color'), linecap: 'round'});

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