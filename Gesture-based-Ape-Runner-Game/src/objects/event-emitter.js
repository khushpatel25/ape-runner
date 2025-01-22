let obj=null;
export default class EventEmitter extends Phaser.Events.EventEmitter{
 
    constructor(){
        super();
    }
    static getObj(){
        if(obj===null){
            obj=new EventEmitter();
        }
        return obj;
    }
    subsribe(type,fn){
        this.addListener(type,fn);
    }
    static kill(){
        obj=null;
    }
}