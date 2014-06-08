// strength
// level
// charm
// + spells (use or receive)

// - fill in
// + cast spell - add damage or attack

var spells = {
  "smite evil": function(paladin) {return {attack: paladin.charm, damage: paladin.level};},
  "divine favour": function(paladin) {return {attack: 1, damage: 1};},
  "haste": function(paladin) {return {attack: 1, damage: 0};}
};

function initPaladin(level, str, cha) {
  var paladin = { level: level,
                  str: str, 
                  cha: cha,
                  activeSpells: [] };

  var addStr = function(str) {
    paladin.strength += str;
  }

  var subStr = function(str) {
    paladin.strength -= str;
  }                

  var hasSpell = function(spell) {
    for(i in paladin.activeSpells) {
      if(paladin.activeSpells[i] === spell) {
        return spell;
      }
    }
    return undefined;
  }

  var calc = function() {
  }

  paladin.addStr = addStr;
  paladin.subStr = subStr;

  return paladin;
} 

function addSpell(paladin, spell) {
  paladin.activeSpells.push(spell);
}

function removeSpell(paladin, spell) {
  paladin.activeSpells.;
}
