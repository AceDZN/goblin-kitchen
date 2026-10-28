/** Campaign content describes physical cooking tasks; there is no grade gate. */
export type Food = 'banana'|'apple'|'pear'|'bread'|'tomato'|'carrot'|'cucumber'|'potato'|'mushroom'|'pepper';
export type Form = 'whole'|'peeled'|'sliced'|'prepared'|'diced'|'grated';
export type Heat = 'raw'|'toasted'|'roasted';
export type Unit = 'tablespoon'|'cup'|'teaspoon'|'half-cup';
export type Liquid = 'yogurt'|'broth'|'oil';
export type Tool = 'dice'|'grate'|'toast'|'roast'|'blend';
export type Ingredient = {food:Food;form:Form;count:number;heat?:Heat;prepared?:boolean};
export type Measure = {unit:Unit;amount:number;liquid?:Liquid};
export type Recipe = Ingredient & {id:string;text:string;title?:string;yogurt?:{unit:Unit;amount?:number};sauce?:Liquid;dressings?:Measure[];extra?:Ingredient[];stir:boolean;blend?:boolean;layers?:Food[]};
export type Level = {name:string;he:string;recipes:Recipe[];hint:string;intro:string;venue:number;layout:number;pantry:Food[];liquids:Liquid[];units:Unit[];tools:Tool[];cart:number;dirty?:boolean;guided?:boolean;transfer?:boolean;serveInOrder?:boolean;brief?:string;skill:string;targetSeconds:number};
export const foodNames:Record<Food,string>={banana:'banana',apple:'apple',pear:'pear',bread:'bread',tomato:'tomato',carrot:'carrot',cucumber:'cucumber',potato:'potato',mushroom:'mushroom',pepper:'pepper'};
export const venues=[
 {name:'EMBER ALLEY',he:'סמטת הגחלים',subtitle:'LEVELS 01–06'},
 {name:'THE BREAD YARD',he:'חצר המאפייה',subtitle:'LEVELS 07–12'},
 {name:'GARDEN MARKET',he:'שוק הגינה',subtitle:'LEVELS 13–18'},
 {name:'HARBOUR CANTEEN',he:'מטבח הנמל',subtitle:'LEVELS 19–24'},
 {name:'ROOFTOP LAB',he:'מעבדת הגג',subtitle:'LEVELS 25–30'},
 {name:'THE ROYAL FEAST',he:'המשתה המלכותי',subtitle:'LEVELS 31–36'}
] as const;
