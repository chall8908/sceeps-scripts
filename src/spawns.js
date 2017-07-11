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
      nextCreepCount = function(spawn) {
        let creepNum = (spawn.memory.creepCounter || 0) + 1;
        spawn.memory.creepCounter = creepNum > 20 ? 1 : creepNum;
        return creepNum;
      },
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

            if (role) {
              numRoles[creep.memory.role]++;

              try {
                role.run(creep);
              }
              catch(e) {
                console.log(e);
                if(e.toSource) {
                  console.log(e.toSource());
                }
              }
            }
          }

          let towers = spawn.room.find(FIND_MY_STRUCTURES, { filter: (bldg) => bldg.structureType === STRUCTURE_TOWER });

          for(let tower of towers) {
            TowerUtils.run(tower);
          }

          let unableToBuild = false;
          if(!spawn.spawning) {
            let spawnFunc = spawn.room.memory.panic ? building.panic : building.spawnCreeps;

            unableToBuild = !spawnFunc(spawn, numRoles);
          }

          // Activate panic mode if we have no harvesters or haulers
          // and spawn is unable to build our regular creeps
          if(unableToBuild && !numRoles.harvester && !numRoles.hauler) {
            spawn.room.memory.panic = true;
          }

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
        },

        // Do regular creep spaning
        spawnCreeps: function(spawn, numRoles) {
          for(let role of roleOrder) {
            if(numRoles[role] < wantedRoles[role]) {
              let body = utils.getBodyForRole(role);

              if(spawn.canCreateCreep(body) == OK) {
                let creepNum = nextCreepCount(spawn);
                spawn.createCreep(body, role + creepNum, { role });
                return true;
              }
              else {
                // Stop trying to build creeps if we're short harvesters or haulers
                if(role === 'harvester' || role === 'hauler') {
                  break;
                }
              }
            }
          }

          return false;
        },

        // Perform panic mode spawning
        panic: function(spawn, numRoles) {
          const body = [MOVE,CARRY,WORK];

          let creepNum;

          if(numRoles.harvester < 2) {
            if(spawn.canCreateCreep(body) === OK) {
              creepNum = nextCreepCount(spawn);
              spawn.createCreep(body, `panic harvester ${creepNum}`, { role: 'harvester' });
              return true;
            }
          }
          else if(numRoles.upgrader < 1) {
            if(spawn.canCreateCreep(body) === OK) {
              creepNum = nextCreepCount(spawn);
              spawn.createCreep(body, `panic upgrader ${creepNum}`, { role: 'upgrader' });
              return true;
            }
          }
          else if(numRoles.hauler < 1) {
            if(spawn.canCreateCreep(body) === OK) {
              creepNum = nextCreepCount(spawn);
              spawn.createCreep(body, `panic hauler ${creepNum}`, { role: 'hauler' });
              return true;
            }
          }
          else {
            spawn.room.memory.panic = false;
            return building.spawnCreeps(spawn, numRoles);
          }

          return false;
        }
      };

module.exports = building;
