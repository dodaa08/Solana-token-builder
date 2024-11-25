import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';
import Tokenlaunch from './components/Tokenlaunch';

function App() {
    const wallets = [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network: 'devnet' }) // Optional additional wallets
    ];

    return (
        <div className="bg-black h-screen">
            <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 20,
                            }}
                        >
                            <WalletMultiButton />
                            <WalletDisconnectButton />
                        </div>
                         <Tokenlaunch />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
}

export default App;
