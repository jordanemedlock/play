SVG.on(document, 'DOMContentLoaded', function () {
  var draw = SVG().addTo('body').size(1125, 2436);
  var rect = draw.rect(1125, 2436).attr({fill: 'aquamarine'});

  var fern = idealFern(draw, 
    [
      {
        startScale: 0.3,
        endScale: 0.1,
        numChildren: 10,
        angle: 70
      },
      {
        startScale: 0.3,
        endScale: 0.1,
        numChildren: 10,
        angle: 70
      },
      {
        startScale: 0.3,
        endScale: 0.1,
        numChildren: 10,
        angle: 70
      },
      {
        
      }
    ], 
    {
      color: '#243'
    }
  );
  fern.transform({
    translateX: 500,
    translateY: 50
  })
  .rotate(90, 0,0)
  .scale(22, 0, 0);
});

function lerp(x, y, frac) {
  return (y - x) * frac + x;
}

function idealFern(draw, levels, config) {
  var group = draw.group();

  
  group.line(0, 0, 100, 0).stroke({width: 1, color: config.color, linecap: 'round'});

  if (levels.length > 1) {
    var level = levels[0];
    var scale = level.startScale;
    var deltaX = 100 / level.numChildren;
    for (var i=0; i < level.numChildren; i++) {
      var frac = i / level.numChildren;
      var child = idealFern(group, levels.slice(1), config);
      var scale = lerp(level.startScale, level.endScale, frac);
      child
      .translate(deltaX * i, 0)
      .scale(scale, 0, 0)
      .rotate(i % 2 ? level.angle : -level.angle, 0, 0);
    }
  }

  return group;
}