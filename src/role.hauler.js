const { collectResource } = require('utils'),
      STORAGE_STRUCTURES = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION],
      role = {
        run: function(creep) {

          if(creep.memory.hauling) {
            if(creep.carry.energy === 0) {
              creep.memory.hauling = false;
            }
          }
          else {
            if(creep.carry.energy === creep.carryCapacity) {
              creep.memory.hauling = true;
            }
          }

          if(!creep.memory.hauling) {
            collectResource(creep);
          }
          else {
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                                                     { filter: bldg => (
                                                       STORAGE_STRUCTURES.some(type => type === bldg.structureType) &&
                                                       bldg.energy < bldg.energyCapacity
                                                     )
                                                     });

            if(!target) {
              target = creep.pos.findClosestByPath(FIND_STRUCTURES,
                                                   { filter: (bldg) => (
                                                     bldg.structureType === STRUCTURE_TOWER && bldg.energy < bldg.energyCapacity
                                                   )})
            }

            if(target && creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.doMove(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
          }
        }
      };

module.exports = role;
