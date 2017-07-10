const utils = require('utils'),
      TowerUtils = require('towers'),
      roles = {
        harvester: require('role.harvester'),
        hauler   : require('role.hauler'),
        upgrader : require('role.upgrader'),
        builder  : require('role.builder'),
        repairer : require('role.repairer'),
        soldier  : require('role.soldier')
      },
      wantedRoles = {
        'harvester': 6,
        'hauler'   : 4,
        'upgrader' : 2,
        'builder'  : 3,
        'repairer' : 0,
        'soldier'  : 1
      },
      roleOrder  = ['harvester', 'hauler', 'builder', 'upgrader', 'repairer', 'soldier'],
      building = {
        main: Game.spawns['Aurelia'],

        processRoom: function (spawn) {
          let numRoles = {
            'harvester': 0,
            'hauler'   : 0,
            'upgrader' : 0,
            'builder'  : 0,
            'repairer' : 0,
            'soldier'  : 0
          };

          // Get all creeps in the current room and process them
          for(let creep of spawn.room.find(FIND_MY_CREEPS)) {
            let role = roles[creep.memory.role];

            numRoles[creep.memory.role]++;
            
            role && role.run(creep);
          }

          let towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: (bldg) => bldg.structureType === STRUCTURE_TOWER });

          for(let tower of towers) {
            TowerUtils.run(tower);
          }

          let unableToBuild = false;
          if(!spawn.spawning) {
            for(let role of roleOrder) {
              if(numRoles[role] < wantedRoles[role]) {
                if(spawn.canCreateCreep(utils.getBodyForRole(role)) == OK) {
                  let creepNum = spawn.memory.creepCounter || 0;
                  spawn.createCreep(utils.getBodyForRole(role), role + creepNum, { role: role });

                  spawn.memory.creepCounter = creepNum > 20 ? 1 : creepNum + 1;
                  break;
                } else {
                  unableToBuild = true;
                  // Stop trying to build creeps if we're short harvesters or haulers
                  if(role === 'harvester' || role === 'hauler') {
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

          if(spawn.spawning) {
            let name = spawn.spawning.name,
                role = Memory.creeps[name].role,
                percentLeft = Math.floor(( (spawn.spawning.needTime - spawn.spawning.remainingTime) / spawn.spawning.needTime) * 100);

            spawnMessage = percentLeft + '% ' + name;
          } else if(unableToBuild) {
            spawnMessage = 'low energy';
          }

          if(spawnMessage) {
            spawn.room.visual.text(spawnMessage,
                                   spawn.pos.x + 1, spawn.pos.y,
                                   { font: 0.5, stroke: '#000000', align: 'left', opacity: 0.7 });
          }
        }
      };

module.exports = building;
