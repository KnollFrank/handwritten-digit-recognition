'use strict';

export class TimedExecutor {
    constructor(waitTimeMillis) {
        this.waitTimeMillis = waitTimeMillis;
        this.lastExecutionTime = new Date().getTime();
        this.firstExecution = true;
    }

    execute(callback) {
        const actualExecutionTime = new Date().getTime();
        if (actualExecutionTime - this.lastExecutionTime >= this.waitTimeMillis || this.firstExecution) {
            this.firstExecution = false;
            this.lastExecutionTime = actualExecutionTime;
            callback();
        }
    }
}