Creep.prototype.doMove = function (target, options) {
    let opts = options || {};

    opts.reusePath = 2;

    this.moveTo(target, options);
};
