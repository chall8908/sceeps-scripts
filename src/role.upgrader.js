import { collectResource } from './utils';

const role = {

  /** @param {Creep} creep **/
  run: function(creep) {
    // If the sign is unclaimed or not claimed by me
    if(!creep.room.controller.sign || creep.room.controller.sign.username != creep.owner.username) {
      if(creep.signController(creep.room.controller, "I'm claiming the objective") == ERR_NOT_IN_RANGE) {
        creep.doMove(creep.room.controller, {visualizePathStyle: {stroke: '#ccffcc'}});
      }
    }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
      role.doUpgrade(creep);
    }
    else {
      utils.collectResource(creep);
    }
  },

  doUpgrade: function(creep) {
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.doMove(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
    }
  }
};

export default role;
