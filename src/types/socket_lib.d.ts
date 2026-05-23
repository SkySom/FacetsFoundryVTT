declare module "socketlib" {
    interface SocketLib {
        registerSystem(name: string): Socket;
    }

    interface Socket {
        register(name: string, func: Any): void;

        executeAsGM(handler: string, parameters: Any[]): Promise<Any>;

        executeAsUser(handler: string, userId: string, parameters: Any[]): Promise<Any>;
    }
}
