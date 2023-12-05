import React, {useState} from 'react';

type SignalIndicatorProps = {
    strength: number;
};

const SignalIndicator: React.FC<SignalIndicatorProps> = ({strength}) => {
    const getColor = (level: number) => {
        if (level <= strength) {
            if (strength < -75) return 'bg-red-600';
            if (strength < -50) return 'bg-yellow-600';
            if (strength < -25) return 'bg-green-400';
            return 'bg-green-600';
        }
        return 'bg-gray-300';
    };

    return (
        <div className="flex items-end gap-1">
            <div className={`w-1 h-2 ${getColor(-100)}`}></div>
            <div className={`w-1 h-3 ${getColor(-75)}`}></div>
            <div className={`w-1 h-4 ${getColor(-50)}`}></div>
            <div className={`w-1 h-5 ${getColor(-25)}`}></div>
        </div>
    );
};

export type WifiNetwork = {
    ssid: string;
    strength: number;
};

export type WifiSetup = Record<'ssid' | 'pwd', string>

function WifiNetworksTable({wifis, connect}: { wifis: WifiNetwork[], connect: (wifi: WifiSetup) => void }) {
    const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(null);
    const [password, setPassword] = useState('');

    const handleConnectClick = (network: WifiNetwork) => {
        setSelectedNetwork(network);
    };

    return (
        <div className="w-full">
            <div className="dark:bg-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            SSID
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Strength
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Connect</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-600">
                    {wifis.sort((w1, w2) => w2.strength - w1.strength).map((network, idx) => (
                        <tr key={idx}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-300 min-w-0">
                                <div className="max-w-[180px] md:max-w-full break-words">{network.ssid}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <SignalIndicator strength={network.strength}/>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => {
                                        handleConnectClick(network);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-500"
                                >
                                    Connect
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {selectedNetwork && (
                <div className="dark:bg-gray-800 my-4">
                    <h3 className="dark:text-white p-1">Connect to {selectedNetwork.ssid}</h3>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600 p-1"
                    />
                    <button
                        onClick={() => {
                            connect({ssid: selectedNetwork?.ssid, pwd: password});
                            setPassword('');
                            setSelectedNetwork(null);
                        }}
                        className="dark:bg-blue-500 mx-4 p-1 dark:text-white dark:hover:bg-blue-600">Connect
                    </button>
                </div>
            )}
        </div>
    );
}

export default WifiNetworksTable;
