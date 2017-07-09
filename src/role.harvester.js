import { harvestResource, checkinSpot } from './utils';

const role ={

  /** @param {Creep} creep **/
  run: function(creep) {
    if(creep.carryCapacity !== 0 && creep.memory.harvesting && creep.carry.energy === creep.carryCapacity) {
      creep.memory.harvesting = false;
    }

    if(!creep.memory.harvesting && creep.carry.energy === 0) {
      creep.memory.harvesting = true;
    }

    if(creep.memory.harvesting) {
      harvestResource(creep);
    }
    else {
      checkinSpot(creep);

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
  }
};

export default role;
