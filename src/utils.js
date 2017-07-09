import { filter as _filter } from 'lodash';

Memory.sources || (Memory.sources = {});

function sourceMem(source, key, value) {
  Memory.sources[source.id] || (Memory.sources[source.id] = {});
  if(key) {
    if(value) {
      Memory.sources[source.id][key] = value;
    }

    return Memory.sources[source.id][key];
  }

  return Memory.sources[source.id];
}

function hasWorkableSpots(source) {
  if(!sourceMem(source, 'maxWorkableSpots')) {
    // determine number of workable spots
    var terrain = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
    terrain = _filter(terrain, function(t) { return t.terrain != 'wall' });

    sourceMem(source, 'maxWorkableSpots', terrain.length);
    sourceMem(source, 'workableSpots', terrain.length);
  }

  return sourceMem(source, 'workableSpots') > 0;
}

function checkoutSpot(creep, source) {
  if(!source) { return false; }

  if(creep.memory.reservedSource != source.id && sourceMem(source, 'workableSpots') > 0) {
    if(creep.memory.reservedSource) {
      utils.checkinSpot(creep); // just in case
    }
    sourceMem(source, 'workableSpots', sourceMem(source, 'workableSpots') - 1);
    creep.memory.reservedSource = source.id;
  }

  return source.id == creep.memory.reservedSource;
}

var utils = {
  // Path the creep to the nearest workable resource
  harvestResource: function(creep) {
    var source = creep.pos.findClosestByPath(FIND_SOURCES,
                                             { filter: (source) => source.energy > 0 && hasWorkableSpots(source) });

    if(source && checkoutSpot(creep, source)) {
      if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.doMove(source, {visualizePathStyle: {stroke: '#00aaff'}});
      }
    }
  },
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
  checkinSpot: function (creep) {
    try {
      var source = Game.getObjectById(creep.memory.reservedSource);
      creep.memory.reservedSource = null;
      sourceMem(source, 'workableSpots', Math.min(sourceMem(source, 'workableSpots') + 1, sourceMem(source, 'maxWorkableSpots')));
    }
    catch(e) {}
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
  }
}

export default utils;
