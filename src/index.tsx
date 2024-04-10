import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Repo} from '@automerge/automerge-repo';
import {BrowserWebSocketClientAdapter} from '@automerge/automerge-repo-network-websocket';
import {IndexedDBStorageAdapter} from '@automerge/automerge-repo-storage-indexeddb';
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
import {RepoContext} from '@automerge/automerge-repo-react-hooks';

const ws_url = import.meta.env.VITE_AUTOMERGE_URL;

const repo = new Repo({
    network: [new BroadcastChannelNetworkAdapter(), new BrowserWebSocketClientAdapter(ws_url)],
    storage: new IndexedDBStorageAdapter(),
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <RepoContext.Provider value={repo}>
            <App />
        </RepoContext.Provider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
