var utils = {
  // pulls resources from containers or the ground
  collectResource: function(creep) {
    let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: res => res.resourceType === RESOURCE_ENERGY });
    if(target) {
      switch(creep.pickup(target)) {
        case ERR_NOT_IN_RANGE:
          creep.doMove(target, {visualizePathStyle: {stroke: '#00aaff'}})
        case OK:
          return;
      }
    }

    target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_CONTAINER && bldg.store[RESOURCE_ENERGY] > 0 });
    if(target) {
      switch(creep.withdraw(target, RESOURCE_ENERGY)) {
        case ERR_NOT_IN_RANGE:
          creep.doMove(target, {visualizePathStyle: {stroke: '#00aaff'}})
        case OK:
          return;
      }
    }

    if(creep.memory.role === 'upgrader') {
      target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: bldg => bldg.structureType === STRUCTURE_EXTENSION && bldg.energy > 0 });
      if(target) {
        switch(creep.withdraw(target, RESOURCE_ENERGY)) {
          case ERR_NOT_IN_RANGE:
            creep.doMove(target, {visualizePathStyle: {stroke: '#00aaff'}});
          case OK:
            return;
        }
      }
    }
  },

  getBodyForRole: function(role) {
    switch(role) {
      case 'soldier':
        return [MOVE,MOVE,MOVE,ATTACK,ATTACK];
      case 'hauler':
        return [MOVE,MOVE,MOVE,CARRY,CARRY];
      case 'harvester':
        return [MOVE,CARRY,WORK,WORK,WORK];
      default:
        return [MOVE,MOVE,CARRY,WORK,WORK];
    }
  },

  cleanupMemory: function(creepName) {
    const oldMem = Memory.creeps[creepName];

    if(oldMem.role === 'harvester') {
      Memory.sources[oldMem.reservedSource].recalc = true;
    }

    delete Memory.creeps[creepName];
    console.log('Clearing non-existing creep memory:', creepName);
  }
}

module.exports = utils;
