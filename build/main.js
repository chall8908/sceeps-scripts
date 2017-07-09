/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = __webpack_require__(6);

Memory.sources || (Memory.sources = {});

function sourceMem(source, key, value) {
  Memory.sources[source.id] || (Memory.sources[source.id] = {});
  if (key) {
    if (value) {
      Memory.sources[source.id][key] = value;
    }

    return Memory.sources[source.id][key];
  }

  return Memory.sources[source.id];
}

function hasWorkableSpots(source) {
  if (!sourceMem(source, 'maxWorkableSpots')) {
    // determine number of workable spots
    var terrain = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
    terrain = (0, _lodash.filter)(terrain, function (t) {
      return t.terrain != 'wall';
    });

    sourceMem(source, 'maxWorkableSpots', terrain.length);
    sourceMem(source, 'workableSpots', terrain.length);
  }

  return sourceMem(source, 'workableSpots') > 0;
}

function checkoutSpot(creep, source) {
  if (!source) {
    return false;
  }

  if (creep.memory.reservedSource != source.id && sourceMem(source, 'workableSpots') > 0) {
    if (creep.memory.reservedSource) {
      utils.checkinSpot(creep); // just in case
    }
    sourceMem(source, 'workableSpots', sourceMem(source, 'workableSpots') - 1);
    creep.memory.reservedSource = source.id;
  }

  return source.id == creep.memory.reservedSource;
}

var utils = {
  // Path the creep to the nearest workable resource
  harvestResource: function (creep) {
    var source = creep.pos.findClosestByPath(FIND_SOURCES, { filter: source => source.energy > 0 && hasWorkableSpots(source) });

    if (source && checkoutSpot(creep, source)) {
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.doMove(source, { visualizePathStyle: { stroke: '#00aaff' } });
      }
    }
  },
  // pulls resources from containers or the ground
  collectResource: function (creep) {
    let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: res => res.resourceType === RESOURCE_ENERGY });
    if (target) {
      switch (creep.pickup(target)) {
        case ERR_NOT_IN_RANGE:
          creep.doMove(target, { visualizePathStyle: { stroke: '#00aaff' } });
        case OK:
          return;
      }
    }

    target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_CONTAINER && bldg.store[RESOURCE_ENERGY] > 0 });
    if (target) {
      switch (creep.withdraw(target, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
          creep.doMove(target, { visualizePathStyle: { stroke: '#00aaff' } });
        case OK:
          return;
      }
    }

    if (creep.memory.role === 'upgrader') {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_EXTENSION && bldg.energy > 0 });
      if (target) {
        switch (creep.withdraw(target, RESOURCE_ENERGY)) {
          case ERR_NOT_IN_RANGE:
            creep.doMove(target, { visualizePathStyle: { stroke: '#00aaff' } });
          case OK:
            return;
        }
      }
    }
  },
  checkinSpot: function (creep) {
    try {
      var source = Game.getObjectById(creep.memory.reservedSource);
      creep.memory.reservedSource = null;
      sourceMem(source, 'workableSpots', Math.min(sourceMem(source, 'workableSpots') + 1, sourceMem(source, 'maxWorkableSpots')));
    } catch (e) {}
  },

  getBodyForRole: function (role) {
    switch (role) {
      case 'soldier':
        return [MOVE, MOVE, MOVE, ATTACK, ATTACK];
      case 'hauler':
        return [MOVE, MOVE, MOVE, CARRY, CARRY];
      case 'harvester':
        return [MOVE, CARRY, WORK, WORK, WORK];
      default:
        return [MOVE, MOVE, CARRY, WORK, WORK];
    }
  }
};

exports.default = utils;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(0);

const role = {

  /** @param {Creep} creep **/
  run: function (creep) {
    // If the sign is unclaimed or not claimed by me
    if (!creep.room.controller.sign || creep.room.controller.sign.username != creep.owner.username) {
      if (creep.signController(creep.room.controller, "I'm claiming the objective") == ERR_NOT_IN_RANGE) {
        creep.doMove(creep.room.controller, { visualizePathStyle: { stroke: '#ccffcc' } });
      }
    }

    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
    }

    if (creep.memory.upgrading) {
      role.doUpgrade(creep);
    } else {
      utils.collectResource(creep);
    }
  },

  doUpgrade: function (creep) {
    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.doMove(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
};

exports.default = role;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(0);

const role = {

  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.carryCapacity !== 0 && creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }

    if (!creep.memory.harvesting && creep.carry.energy === 0) {
      creep.memory.harvesting = true;
    }

    if (creep.memory.harvesting) {
      (0, _utils.harvestResource)(creep);
    } else {
      (0, _utils.checkinSpot)(creep);

      // Find the nearest non-full container
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_CONTAINER && bldg.store[RESOURCE_ENERGY] < bldg.storeCapacity
      });

      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.doMove(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};

exports.default = role;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(4);

var _spawns = __webpack_require__(5);

// Check for dead creeps every 25 ticks
if (!Memory.checkCounter && Memory.checkCounter !== 0) {
    Memory.checkCounter = 0;
} // Prototype modifications etc.

// const SpawnUtils = require('spawns');


module.exports.loop = function () {
    for (let spawnName in Game.spawns) {
        (0, _spawns.processRoom)(Game.spawns[spawnName]);
    }

    if (Memory.checkCounter > 25) {
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
        Memory.checkCounter = 0;
    }

    Memory.checkCounter++;

    for (let sourceID in Memory.sources) {
        let source = Memory.sources[sourceID],
            obj = Game.getObjectById(sourceID);
        obj.room.visual.text('🔄 ' + source.workableSpots + '/' + source.maxWorkableSpots, obj.pos.x, obj.pos.y - 1, { font: 0.5, stroke: '#000000', opacity: 0.7 });
    }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Creep.prototype.doMove = function (target, options) {
    let opts = options || {};

    opts.reusePath = 2;

    this.moveTo(target, options);
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _role = __webpack_require__(2);

var _role2 = _interopRequireDefault(_role);

var _role3 = __webpack_require__(7);

var _role4 = _interopRequireDefault(_role3);

var _role5 = __webpack_require__(1);

var _role6 = _interopRequireDefault(_role5);

var _role7 = __webpack_require__(8);

var _role8 = _interopRequireDefault(_role7);

var _role9 = __webpack_require__(9);

var _role10 = _interopRequireDefault(_role9);

var _role11 = __webpack_require__(10);

var _role12 = _interopRequireDefault(_role11);

var _utils = __webpack_require__(0);

var _utils2 = _interopRequireDefault(_utils);

var _towers = __webpack_require__(11);

var _towers2 = _interopRequireDefault(_towers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const roles = {
  harvester: _role2.default,
  hauler: _role4.default,
  upgrader: _role6.default,
  builder: _role8.default,
  repairer: _role10.default,
  soldier: _role12.default
},
      wantedRoles = {
  'harvester': 6,
  'hauler': 3,
  'upgrader': 2,
  'builder': 3,
  'repairer': 0,
  'soldier': 1
},
      roleOrder = ['harvester', 'hauler', 'builder', 'upgrader', 'repairer', 'soldier'],
      building = {
  main: Game.spawns['Aurelia'],

  processRoom: function (spawn) {
    let numRoles = {
      'harvester': 0,
      'hauler': 0,
      'upgrader': 0,
      'builder': 0,
      'repairer': 0,
      'soldier': 0
    };

    // Get all creeps in the current room and process them
    for (let creep of spawn.room.find(FIND_MY_CREEPS)) {
      let role = roles[creep.memory.role];

      numRoles[creep.memory.role]++;

      role && role.run(creep);
    }

    let towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_TOWER });

    for (let tower of towers) {
      _towers2.default.run(tower);
    }

    let unableToBuild = false;
    if (!spawn.spawning) {
      for (let role of roleOrder) {
        if (numRoles[role] < wantedRoles[role]) {
          if (spawn.canCreateCreep(_utils2.default.getBodyForRole(role)) == OK) {
            let creepNum = spawn.memory.creepCounter || 0;
            spawn.createCreep(_utils2.default.getBodyForRole(role), role + creepNum, { role: role });

            spawn.memory.creepCounter = creepNum > 20 ? 1 : creepNum + 1;
          } else {
            unableToBuild = true;
            // Stop trying to build creeps if we're short harvesters or haulers
            if (role === 'harvester' || role === 'hauler') {
              break;
            }
          }
        }
      }
    }

    // Panic mode
    // If no harvesters or haulers and spawn is full
    /* if(unableToBuild && spawn.energy === spawn.energyCapacity) {
     *   
     * }*/

    let spawnMessage;

    if (spawn.spawning) {
      let name = spawn.spawning.name,
          role = Memory.creeps[name].role,
          percentLeft = Math.floor((spawn.spawning.needTime - spawn.spawning.remainingTime) / spawn.spawning.needTime * 100);

      spawnMessage = percentLeft + '% ' + name;
    } else if (unableToBuild) {
      spawnMessage = 'low energy';
    }

    if (spawnMessage) {
      spawn.room.visual.text(spawnMessage, spawn.pos.x + 1, spawn.pos.y, { font: 0.5, stroke: '#000000', align: 'left', opacity: 0.7 });
    }
  }
};

exports.default = building;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(0);

const STORAGE_STRUCTURES = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION],
      role = {
  run: function (creep) {

    if (creep.memory.hauling) {
      if (creep.carry.energy === 0) {
        creep.memory.hauling = false;
      }
    } else {
      if (creep.carry.energy === creep.carryCapacity) {
        creep.memory.hauling = true;
      }
    }

    if (!creep.memory.hauling) {
      (0, _utils.collectResource)(creep);
    } else {
      let target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => STORAGE_STRUCTURES.some(type => type === bldg.structureType) && bldg.energy < bldg.energyCapacity
      });

      if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_TOWER && bldg.energy < bldg.energyCapacity });
      }

      if (target && creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.doMove(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }
};

exports.default = role;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _role = __webpack_require__(2);

var _role2 = _interopRequireDefault(_role);

var _role3 = __webpack_require__(1);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const role = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        switch (creep.build(targets[0])) {
          case ERR_NOT_IN_RANGE:
            creep.doMove(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          case OK:
            return;
        }
      }

      (0, _role3.doUpgrade)(creep);
    } else {
      (0, _utils.collectResource)(creep);
    }
  }
};

exports.default = role;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _role = __webpack_require__(1);

var _utils = __webpack_require__(0);

const role = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.repairing && creep.carry.energy == 0) {
      creep.memory.repairing = false;
    }
    if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
      creep.memory.repairing = true;
    }

    if (creep.memory.repairing) {
      if (role.doRepair(creep)) {
        return;
      }
    }

    (0, _utils.collectResource)(creep);
  },

  doRepair: function (creep) {
    let targets = creep.room.find(FIND_STRUCTURES, { filter: bldg => bldg.hits < bldg.hitsMax });

    // Sort targets by lowest hits followed by soonest to decay.  Otherwise, don't sort
    targets.sort((a, b) => a.hits - b.hits || a.ticksToDecay - b.ticksToDecay || 0);
    let target = targets[0];

    if (target) {
      switch (creep.repair(target)) {
        case ERR_NOT_IN_RANGE:
          creep.doMove(target, { visualizePathStyle: { stroke: '#ffffff' } });
        case OK:
          return;
      }
    }

    (0, _role.doUpgrade)(creep);
  }
};

exports.default = role;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
const role = {
    run: function (creep) {
        var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);

        if (hostile) {
            if (creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostile, { visualizePathStyle: { stroke: '#ff0000', opacity: 0.2 } });
            }
        }
    }
};

exports.default = role;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
const getMostHurt = things => things.reduce((mostHurt, t) => mostHurt.hits > t.hits ? t : mostHurt),
      building = {
  run: function (tower) {
    let needHealing = tower.room.find(FIND_MY_CREEPS, { filter: creep => creep.hits < creep.hitsMax }),
        soldiers = [],
        civilians = [];

    needHealing.forEach(creep => {
      creep.memory.role === 'soldier' ? soldiers.push(creep) : civilians.push(creep);
    });

    if (soldiers.length) {
      return tower.heal(getMostHurt(soldiers));
    }

    let intruders = tower.room.find(FIND_HOSTILE_CREEPS);

    if (intruders.length) {
      return tower.attack(intruders[0]);
    }

    if (civilians.length) {
      return tower.heal(getMostHurt(civilians));
    }

    let buildings = tower.room.find(FIND_STRUCTURES, { filter: bldg => bldg.hits < bldg.hitsMax });

    if (buildings.length) {
      tower.repair(getMostHurt(buildings));
    }
  }
};

exports.default = building;

/***/ })
/******/ ]);