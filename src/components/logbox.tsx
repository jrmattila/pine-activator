import {useCallback, useRef, useState} from "react";

export const Logbox = ({logs}: { logs: string[] }) => (
    <div className="container m-4">
        <div className="bg-gray-700 text-white p-4 max-h-64 rounded overflow-y-scroll flex flex-col flex-col-reverse">
            {logs.map((log, index) => (
                <p key={index}>{log}</p>
            ))}
        </div>
    </div>
);

export const useLog = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const log = useCallback((msg: string) => {
        setLogs(oldLogs => [`> ${msg}`, ...oldLogs]);
    }, [setLogs]);
    return [logs, log] as const
}