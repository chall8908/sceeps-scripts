const getMostHurt = (things) => things.reduce((mostHurt, t) => mostHurt.hits > t.hits ? t : mostHurt),
      building = {
        run: function(tower) {
          let needHealing = tower.room.find(FIND_MY_CREEPS,
                                            { filter: creep => creep.hits < creep.hitsMax }),
              soldiers = [],
              civilians = [];

          needHealing.forEach(creep => { creep.memory.role === 'soldier' ? soldiers.push(creep) : civilians.push(creep) });

          if(soldiers.length) {
            return tower.heal(getMostHurt(soldiers));
          }

          let intruders = tower.room.find(FIND_HOSTILE_CREEPS);

          if(intruders.length) {
            return tower.attack(intruders[0]);
          }

          if(civilians.length) {
            return tower.heal(getMostHurt(civilians));
          }

          let buildings = tower.room.find(FIND_STRUCTURES, { filter: bldg => bldg.hits < bldg.hitsMax });

          if(buildings.length) {
            tower.repair(getMostHurt(buildings));
          }
        }
      };

export default building;
