const { doUpgrade } =  require('role.upgrader'),
      { collectResource } =  require('utils'),
      role = {

        /** @param {Creep} creep **/
        run: function(creep) {

          if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
          }
          if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
          }

          if(creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
              switch(creep.build(targets[0])) {
                case ERR_NOT_IN_RANGE:
                  creep.doMove(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                case OK:
                  return;
              }
            }

            doUpgrade(creep);
          } else {
            collectResource(creep);
          }
        }
      };

module.exports = role;
