import type { ValueOf } from "fvtt-types/utils";
import { localize as localizeString } from "@util";

const PACKAGE_ID = "Facets";

export function log(msg: string) {
    Logger.warn(msg);
}

export class Logger {
    static PACKAGE_ID = PACKAGE_ID;

    static LOG_LEVEL = {
        Debug: 0,
        Log: 1,
        Info: 2,
        Warn: 3,
        Error: 4
    } as const;

    static log({ msg, level, options: { toast, permanent, localize } = {} }: LogMessage) {
        const prefix = Logger.PACKAGE_ID + " | ";
        switch (level) {
            case Logger.LOG_LEVEL.Error:
                console.error(prefix, localize ? localizeString(msg) : msg);
                if (toast)
                    ui?.notifications?.error(msg.toString(), {
                        permanent,
                        localize,
                        console: false
                    });
                break;
            case Logger.LOG_LEVEL.Warn:
                console.warn(prefix, localize ? localizeString(msg) : msg);
                if (toast)
                    ui?.notifications?.warn(msg.toString(), {
                        permanent,
                        localize,
                        console: false
                    });
                break;
            case Logger.LOG_LEVEL.Info:
                console.info(prefix, localize ? localizeString(msg) : msg);
                if (toast)
                    ui?.notifications?.info(msg.toString(), {
                        permanent,
                        localize,
                        console: false
                    });
                break;
            case Logger.LOG_LEVEL.Debug:
                console.debug(prefix, localize ? localizeString(msg) : msg);
                if (toast)
                    ui?.notifications?.info(msg.toString(), {
                        permanent,
                        localize,
                        console: false
                    });
                break;
            case Logger.LOG_LEVEL.Log:
            default:
                console.log(prefix, localize ? localizeString(msg) : msg);
                if (toast) ui?.notifications?.info(msg.toString(), { permanent, console: false });
                break;
        }
    }

    static error(msg: never | string, options?: LogMessageOptions) {
        Logger.log({ msg, level: Logger.LOG_LEVEL.Error, options });
    }

    static warn(msg: never | string, options?: LogMessageOptions) {
        Logger.log({ msg, level: Logger.LOG_LEVEL.Warn, options });
    }

    static info(msg: never | string, options?: LogMessageOptions) {
        Logger.log({ msg, level: Logger.LOG_LEVEL.Info, options });
    }

    static debug(msg: never | string, options?: LogMessageOptions) {
        Logger.log({ msg, level: Logger.LOG_LEVEL.Debug, options });
    }
}

interface LogMessage {
    /** The message or data to log */
    msg: never | string;
    options?: LogMessageOptions;
    /** The log level @see {@link Logger.LOG_LEVEL} */
    level: ValueOf<typeof Logger.LOG_LEVEL>;
}

interface LogMessageOptions extends foundry.applications.ui.Notifications.NotifyOptions {
    force?: boolean;
    toast?: boolean;
}
