import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {Repo} from '@automerge/automerge-repo';
import {BrowserWebSocketClientAdapter} from '@automerge/automerge-repo-network-websocket';
import {IndexedDBStorageAdapter} from '@automerge/automerge-repo-storage-indexeddb';
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
import {RepoContext} from '@automerge/automerge-repo-react-hooks';
import {Provider} from 'react-redux';
import {store} from './store/store';

const ws_url = import.meta.env.VITE_AUTOMERGE_URL;

const repo = new Repo({
    network: [new BroadcastChannelNetworkAdapter(), new BrowserWebSocketClientAdapter(ws_url)],
    storage: new IndexedDBStorageAdapter(),
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    //<React.StrictMode>
    <Provider store={store}>
        <RepoContext.Provider value={repo}>
            <App />
        </RepoContext.Provider>
    </Provider>,
    //</React.StrictMode>,
);
