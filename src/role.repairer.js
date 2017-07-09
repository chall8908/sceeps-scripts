import { doUpgrade } from './role.upgrader';
import { collectResource } from './utils';

const role = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if(creep.memory.repairing && creep.carry.energy == 0) {
      creep.memory.repairing = false;
    }
    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
      creep.memory.repairing = true;
    }

    if(creep.memory.repairing) {
      if(role.doRepair(creep)) { return; }
    }

    collectResource(creep);
  },

  doRepair: function(creep) {
    let targets = creep.room.find(FIND_STRUCTURES, { filter: bldg => bldg.hits < bldg.hitsMax });

    // Sort targets by lowest hits followed by soonest to decay.  Otherwise, don't sort
    targets.sort((a,b) => ( a.hits - b.hits || a.ticksToDecay - b.ticksToDecay || 0 ));
    let target = targets[0];

    if(target) {
      switch(creep.repair(target)) {
        case ERR_NOT_IN_RANGE:
          creep.doMove(target, {visualizePathStyle: {stroke: '#ffffff'}});
        case OK:
          return;
      }
    }

    doUpgrade(creep);
  }
};

export default role;
