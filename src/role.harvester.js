const { filter: _filter, reduce: _reduce } = require('lodash');

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
  else if(sourceMem(source, 'recalc')) {
    // count creeps that have reserved this source
    let reservedSpots = _reduce(Memory.creeps, (count, _, creep) => ( count + (creep.reservedSource === source.id )), 0);
    sourceMem(source, 'workableSpots', reservedSpots);
    sourceMem(source, 'recalc', false);
  }

  return sourceMem(source, 'workableSpots') > 0;
}

const { harvestResource, checkinSpot } = require('utils'),
      role = {

        /** @param {Creep} creep **/
        run: function(creep) {
          if(creep.carryCapacity !== 0 && creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
            creep.memory.harvesting = false;
          }

          if(!creep.memory.harvesting && creep.carry.energy === 0) {
            creep.memory.harvesting = true;
          }

          if(creep.memory.harvesting) {
            role.harvestResource(creep);
          }
          else {
            // Find the nearest non-full container
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                                                     { filter: bldg => (
                                                       bldg.structureType === STRUCTURE_CONTAINER &&
                                                       bldg.store[RESOURCE_ENERGY] < bldg.storeCapacity
                                                     )
                                                     });

            if(target) {
              if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.doMove(target, {visualizePathStyle: {stroke: '#ffffff'}});
              }
            }
          }
        },

        // Path the creep to the nearest workable resource
        harvestResource: function(creep) {
          let source;

          if (creep.memory.reservedSource) {
            source = Game.getObjectById(creep.memory.reservedSource);
          }
          else {
            source = creep.pos.findClosestByPath(FIND_SOURCES,
                                                 { filter: (source) => source.energy > 0 && hasWorkableSpots(source) });
          }

          // reserve source if it's not already reserved
          if(creep.memory.reservedSource != source.id && sourceMem(source, 'workableSpots') > 0) {
            sourceMem(source, 'workableSpots', sourceMem(source, 'workableSpots') - 1);
            creep.memory.reservedSource = source.id;
          }

          if(source) {
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
              creep.doMove(source, {visualizePathStyle: {stroke: '#00aaff'}});
            }
          }
        }
      };

module.exports = role;
