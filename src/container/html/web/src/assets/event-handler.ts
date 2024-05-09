import e from "express";


type anyObject = {[key:string]: any}

type eventOptions = {

  /**
   * if id is declared then eventHandler will ensure 
   * callbacks won't be stacked even if on()
   * is called multiple times within the same event.
   */
  id: string
}

type callbackFn = {
  id: string | null;
  fn: Function;
}
export class EventHandler {
  private static $instance: EventHandler | null;
  static events = {};

  static emit (event: string, data: anyObject): void {
    EventHandler.events[event].ignite.map((ig) => {
      ig.fn(data);
    })
  }

  static on (event: string, callback: Function, options?: anyObject) {
    if(!EventHandler.events[event]) EventHandler.events[event] = {ignite: []}
    if(options?.id) {
      let ignite =  EventHandler.events[event].ignite.find(ig => ig.id === options.id);
      if(!ignite) {
        EventHandler.events[event].ignite.push({
          id: options.id,
          fn: callback
        })
      } else ignite.fn = callback;
    } else {
      EventHandler.events[event].ignite.push({
        fn: callback
      })
    }

  }
}