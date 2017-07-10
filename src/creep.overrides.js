Creep.prototype.doMove = function (target, options) {
  let opts = options || {};

  opts.reusePath = 0;
  
  this.moveTo(target, options);
};
