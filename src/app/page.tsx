'use client'
import {MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import WifiTable, {WifiNetwork, WifiSetup} from "@/components/wifi-table";
import {Logbox, useLog} from "@/components/logbox";

const SERVICE = '0000180a-0000-1000-8000-00805f9b34fb'
const ENDPOINT_CHARACTERISTIC = '00009999-0000-1000-8000-00805f9b34fb'
const NOTIFICATIONS_CHARACTERISTIC = '00001910-0000-1000-8000-00805f9b34fb'

type SetWifiCommand = { seq: 3001, cmd: "setup", ssid: string, pwd: string }

type Log = (msg: string) => void;
type DeviceRef = MutableRefObject<null | BluetoothDevice>;

const SCAN_COMMAND = {seq: 3000, cmd: "scan"}
const SET_WIFI_COMMAND_BASE: Pick<SetWifiCommand, 'seq' | 'cmd'> = {seq: 3001, cmd: "setup"}

const EOT = '\x04'
const SOH = '\x01'
const AST = '\x42'

const wrapCmd = (cmd: string | any, prefix = '\x1c') => new TextEncoder().encode(`${SOH}${prefix}${typeof cmd === 'string' ? cmd : JSON.stringify(cmd)}${EOT}`)


const handleNotification = (msg: AllowSharedBufferSource, msgBuffer: MsgBufferRef, log: Log, addWifi: (wifi: WifiNetwork) => void) => {
    const msgStr = new TextDecoder().decode(msg)

    const [curMsg, nextMsg] = msgStr.split(EOT)
    if (typeof nextMsg === 'string') { // meaning transmission has ended
        const resp = msgBuffer.current.substring(2) + curMsg
        try {
            const respJson = JSON.parse(resp.trim())
            if (respJson.cmd === 'scan') addWifi({ssid: respJson.ssid[0].n, strength: respJson.ssid[0].r})
            if (respJson.cmd === 'setup') {
                if (respJson.err_code === 0) log('Wifi should now be successfully set! See IP address below')
                else log('Something went wrong, check error response below')
            }
        } catch (e) {
            log('Something went wrong when parsing notification response')
            log(`${e}`)
        }
        log(resp)
    }
    msgBuffer.current = nextMsg ?? msgBuffer.current + curMsg
}

const handleConnect = async (wifi: WifiSetup, charsRef: CharsRef, log: Log) => {
    log('Sending setup command')
    const setWifiCmd: SetWifiCommand = {...SET_WIFI_COMMAND_BASE, ssid: wifi.ssid, pwd: wifi.pwd}
    await charsRef.current.endpoint!.writeValueWithResponse(wrapCmd(setWifiCmd, AST))
    log('Command sent')
    log('If you don\'t to see any further messages in this log, restart your printer, disconnect and try again')
}

const connectAndScan = async (e: any, deviceRef: DeviceRef, charsRef: CharsRef, log: Log, msgBuffer: MsgBufferRef, addWifi: (wifi: WifiNetwork) => void) => {
    e.preventDefault()
    try {
        deviceRef.current = deviceRef.current ?? await navigator.bluetooth.requestDevice({
            optionalServices: [SERVICE],
            filters: [{services: [SERVICE]}]
        })
        const d = deviceRef.current
        d.addEventListener('gattserverdisconnected', () => {
            log('Disconnected');
            deviceRef.current = null;
            charsRef.current = {notifications: null, endpoint: null}
        });
        const connection = await d.gatt!.connect()
        const service = await connection.getPrimaryService(SERVICE)
        if (!charsRef.current.endpoint) charsRef.current.endpoint = await service.getCharacteristic(ENDPOINT_CHARACTERISTIC)
        if (!charsRef.current.notifications) {
            charsRef.current.notifications = await service.getCharacteristic(NOTIFICATIONS_CHARACTERISTIC)
            charsRef.current.notifications.addEventListener('characteristicvaluechanged', (e: any) => e?.target?.value && handleNotification(e.target!.value, msgBuffer, log, addWifi));
            charsRef.current.notifications.startNotifications()
            log('If your device is not already paired with the printer, accept pairing on both devices');
        }
        const characteristic = charsRef.current.endpoint
        await characteristic.writeValueWithResponse(wrapCmd(SCAN_COMMAND))
        log('Device paired, sending scan command')

    } catch (e) {
        log(`${e}`)
    }
}

type CharsRef = MutableRefObject<Record<'endpoint' | 'notifications', null | BluetoothRemoteGATTCharacteristic>>;
type MsgBufferRef = MutableRefObject<string>;

export default function Home() {
    const msgBufferRef = useRef('')
    const [logs, log] = useLog()

    const [wifis, setWifis] = useState<WifiNetwork[]>([])
    const appendWifi = (newWifi: WifiNetwork) => setWifis(wifis => [...wifis.filter(wifi => wifi.ssid !== newWifi.ssid), newWifi])

    const deviceRef: DeviceRef = useRef(null)
    const charsRef: CharsRef = useRef({endpoint: null, notifications: null})

    useEffect(() => {
        log('This app can be used to set up WiFi on the Bambu Lab P1S 3D printer. Your browser needs to support the Web Bluetooth API.')
        log('Start by clicking scan.')
    }, [log])

    return (
        <main className="flex min-vh-80 flex-col items-center p-8 max-w-3xl mx-auto">
            <div className="flex m-4">
                <button className="bg-blue-900 text-white p-2 ml-4 rounded"
                        onClick={e => connectAndScan(e, deviceRef, charsRef, log, msgBufferRef, appendWifi)}>
                    Scan
                </button>
                <button disabled={!charsRef.current.endpoint} className={`bg-red-400 text-white p-2 ml-4 rounded`}
                        onClick={e => {
                            e.preventDefault();
                            setWifis([])
                            deviceRef?.current?.gatt?.disconnect()
                        }}>
                    Disconnect
                </button>
            </div>
            {!!wifis.length &&
                <WifiTable wifis={wifis} connect={(wifi) => handleConnect(wifi, charsRef, log)}/>}
            <Logbox logs={logs}/>
        </main>
    )
}
