export interface Message {
    messageId: string,
    cmd: string,
    args?: any[],
    result?: any,
    error?: any,
    pubsub?: boolean
};

let messageId: number = 0;

export class Store {
    private $callbacks: {[messageId: string]: Function} = {};

    dispatch (cmd: string, callback: Function, ...args: any[]) {
        let msg = this.buildMessage(cmd, ...args);

        // callback when the worker receives back the final result
        if (callback) {
            this.$callbacks[msg.messageId] = callback;
        }

        // send command to be executed by the master node
        process.send(msg);
    }

    consume (message: Message) {
        if (this.$callbacks[ message.messageId ]) {

            // dispatch callback
            this.$callbacks[ message.messageId ]( message.error, message.result );

            // cleanup
            delete this.$callbacks[ message.messageId ];

        } else if (message.pubsub) {

            console.log("CONSUME, PUBSUB:", message);
        }
    }

    getMessageId () {
        return `${ process.pid }:${ messageId++ }`;
    }

    buildMessage(command: string, ...args: any[]): Message {
        return {
            messageId: this.getMessageId(),
            cmd: command,
            args: args
        }
    }
}