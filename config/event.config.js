import EventEmmiter from "events";

class EmitterClass extends EventEmmiter {
    constructor() {
        super();
        this.setMaxListeners(20); // Avoid memory leak warnings
    }

    // Helper for easier usage
    trigger(eventName, data) {
        console.log(`[EVENT] ${eventName}`, data);
        this.emit(eventName, data);
    }
}

const Emitter = new EmitterClass();

export default Emitter;
